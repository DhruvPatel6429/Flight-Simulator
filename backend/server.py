from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
import heapq

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Pydantic Models
class Airport(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    name: str
    city: str

class AirportCreate(BaseModel):
    code: str
    name: str
    city: str

class FlightRoute(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    flight_id: str
    source_code: str
    destination_code: str
    departure_time: str
    total_seats: int = 180
    booked_seats: int = 0

class FlightRouteCreate(BaseModel):
    flight_id: str
    source_code: str
    destination_code: str
    departure_time: str
    total_seats: int = 180

class Passenger(BaseModel):
    model_config = ConfigDict(extra="ignore")
    ticket_id: str
    name: str
    passport: str
    flight_id: str
    seat_number: str
    status: str = "pending"

class PassengerCreate(BaseModel):
    name: str
    passport: str
    flight_id: str
    seat_number: str

class BoardingQueueItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    ticket_id: str
    passenger_name: str
    flight_id: str
    position: int

class CancellationItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    ticket_id: str
    passenger_name: str
    flight_id: str
    timestamp: str

class Analytics(BaseModel):
    total_airports: int
    total_flights: int
    total_tickets: int
    boarded: int
    cancelled: int
    pending: int
    upcoming_flight: Optional[Dict] = None

# Helper function to generate hash
def generate_hash(value: str, table_size: int = 10) -> int:
    hash_val = 0
    for char in value:
        hash_val = (hash_val * 31 + ord(char)) % table_size
    return hash_val

# Airport APIs
@api_router.post("/airports", response_model=Airport)
async def create_airport(airport: AirportCreate):
    existing = await db.airports.find_one({"code": airport.code}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Airport code already exists")
    
    airport_obj = Airport(**airport.model_dump())
    doc = airport_obj.model_dump()
    await db.airports.insert_one(doc)
    return airport_obj

@api_router.get("/airports", response_model=List[Airport])
async def get_airports():
    airports = await db.airports.find({}, {"_id": 0}).to_list(1000)
    return airports

@api_router.delete("/airports/{code}")
async def delete_airport(code: str):
    result = await db.airports.delete_one({"code": code})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Airport not found")
    return {"message": "Airport deleted"}

# Flight Route APIs
@api_router.post("/flights", response_model=FlightRoute)
async def create_flight(flight: FlightRouteCreate):
    source = await db.airports.find_one({"code": flight.source_code}, {"_id": 0})
    dest = await db.airports.find_one({"code": flight.destination_code}, {"_id": 0})
    
    if not source or not dest:
        raise HTTPException(status_code=400, detail="Source or destination airport not found")
    
    flight_obj = FlightRoute(**flight.model_dump())
    doc = flight_obj.model_dump()
    await db.flights.insert_one(doc)
    return flight_obj

@api_router.get("/flights", response_model=List[FlightRoute])
async def get_flights():
    flights = await db.flights.find({}, {"_id": 0}).to_list(1000)
    return flights

@api_router.delete("/flights/{flight_id}")
async def delete_flight(flight_id: str):
    result = await db.flights.delete_one({"flight_id": flight_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Flight not found")
    return {"message": "Flight deleted"}

# Adjacency List API
@api_router.get("/graph/adjacency-list")
async def get_adjacency_list():
    flights = await db.flights.find({}, {"_id": 0}).to_list(1000)
    airports = await db.airports.find({}, {"_id": 0}).to_list(1000)
    
    adj_list = {}
    for airport in airports:
        adj_list[airport['code']] = []
    
    for flight in flights:
        source = flight['source_code']
        dest = flight['destination_code']
        if source in adj_list:
            adj_list[source].append({
                "destination": dest,
                "flight_id": flight['flight_id'],
                "departure_time": flight['departure_time']
            })
        if dest in adj_list:
            adj_list[dest].append({
                "destination": source,
                "flight_id": flight['flight_id'],
                "departure_time": flight['departure_time']
            })
    
    return adj_list

# Passenger APIs (Hash Table)
@api_router.post("/passengers", response_model=Passenger)
async def create_passenger(passenger: PassengerCreate):
    flight = await db.flights.find_one({"flight_id": passenger.flight_id}, {"_id": 0})
    if not flight:
        raise HTTPException(status_code=400, detail="Flight not found")
    
    if flight['booked_seats'] >= flight['total_seats']:
        raise HTTPException(status_code=400, detail="Flight is full")
    
    ticket_id = f"TKT{uuid.uuid4().hex[:8].upper()}"
    passenger_obj = Passenger(ticket_id=ticket_id, **passenger.model_dump())
    doc = passenger_obj.model_dump()
    
    await db.passengers.insert_one(doc)
    await db.flights.update_one(
        {"flight_id": passenger.flight_id},
        {"$inc": {"booked_seats": 1}}
    )
    
    return passenger_obj

@api_router.get("/passengers", response_model=List[Passenger])
async def get_passengers():
    passengers = await db.passengers.find({}, {"_id": 0}).to_list(1000)
    return passengers

@api_router.get("/passengers/search/{ticket_id}", response_model=Passenger)
async def search_passenger(ticket_id: str):
    passenger = await db.passengers.find_one({"ticket_id": ticket_id}, {"_id": 0})
    if not passenger:
        raise HTTPException(status_code=404, detail="Passenger not found")
    return passenger

@api_router.get("/passengers/hash-table")
async def get_hash_table():
    passengers = await db.passengers.find({}, {"_id": 0}).to_list(1000)
    table_size = 10
    hash_table = {i: [] for i in range(table_size)}
    
    for passenger in passengers:
        hash_val = generate_hash(passenger['ticket_id'], table_size)
        hash_table[hash_val].append(passenger)
    
    return hash_table

# Boarding Queue APIs
@api_router.post("/boarding-queue/{flight_id}/enqueue")
async def enqueue_passenger(flight_id: str, ticket_id: str):
    passenger = await db.passengers.find_one({"ticket_id": ticket_id}, {"_id": 0})
    if not passenger:
        raise HTTPException(status_code=404, detail="Passenger not found")
    
    if passenger['flight_id'] != flight_id:
        raise HTTPException(status_code=400, detail="Passenger flight mismatch")
    
    if passenger['status'] == "boarded":
        raise HTTPException(status_code=400, detail="Passenger already boarded")
    
    queue = await db.boarding_queue.find({"flight_id": flight_id}, {"_id": 0}).to_list(1000)
    position = len(queue)
    
    queue_item = {
        "ticket_id": ticket_id,
        "passenger_name": passenger['name'],
        "flight_id": flight_id,
        "position": position
    }
    await db.boarding_queue.insert_one(queue_item)
    
    return {"message": "Passenger added to queue", "position": position}

@api_router.post("/boarding-queue/{flight_id}/dequeue")
async def dequeue_passenger(flight_id: str):
    queue_item = await db.boarding_queue.find_one({"flight_id": flight_id}, {"_id": 0}, sort=[("position", 1)])
    if not queue_item:
        raise HTTPException(status_code=404, detail="Queue is empty")
    
    await db.boarding_queue.delete_one({"ticket_id": queue_item['ticket_id'], "flight_id": flight_id})
    await db.passengers.update_one(
        {"ticket_id": queue_item['ticket_id']},
        {"$set": {"status": "boarded"}}
    )
    
    remaining = await db.boarding_queue.find({"flight_id": flight_id}, {"_id": 0}).to_list(1000)
    for idx, item in enumerate(remaining):
        await db.boarding_queue.update_one(
            {"ticket_id": item['ticket_id'], "flight_id": flight_id},
            {"$set": {"position": idx}}
        )
    
    return {"message": "Passenger boarded", "boarded": queue_item}

@api_router.get("/boarding-queue/{flight_id}", response_model=List[BoardingQueueItem])
async def get_boarding_queue(flight_id: str):
    queue = await db.boarding_queue.find({"flight_id": flight_id}, {"_id": 0}, sort=[("position", 1)]).to_list(1000)
    return queue

# Cancellation Stack APIs
@api_router.post("/cancellations/push")
async def push_cancellation(ticket_id: str):
    passenger = await db.passengers.find_one({"ticket_id": ticket_id}, {"_id": 0})
    if not passenger:
        raise HTTPException(status_code=404, detail="Passenger not found")
    
    if passenger['status'] == 'cancelled':
        raise HTTPException(status_code=400, detail="Ticket already cancelled")
    
    cancellation = {
        "ticket_id": ticket_id,
        "passenger_name": passenger['name'],
        "flight_id": passenger['flight_id'],
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.cancellations.insert_one(cancellation)
    await db.passengers.update_one(
        {"ticket_id": ticket_id},
        {"$set": {"status": "cancelled"}}
    )
    
    await db.boarding_queue.delete_many({"ticket_id": ticket_id})
    
    flight = await db.flights.find_one({"flight_id": passenger['flight_id']}, {"_id": 0})
    if flight and flight['booked_seats'] > 0:
        await db.flights.update_one(
            {"flight_id": passenger['flight_id']},
            {"$inc": {"booked_seats": -1}}
        )
    
    # Return without _id
    cancellation_response = {
        "ticket_id": cancellation["ticket_id"],
        "passenger_name": cancellation["passenger_name"],
        "flight_id": cancellation["flight_id"],
        "timestamp": cancellation["timestamp"]
    }
    return {"message": "Cancellation recorded", "cancellation": cancellation_response}

@api_router.post("/cancellations/pop")
async def pop_cancellation():
    cancellation = await db.cancellations.find_one({}, {"_id": 0}, sort=[("timestamp", -1)])
    if not cancellation:
        raise HTTPException(status_code=404, detail="No cancellations found")
    
    await db.cancellations.delete_one({"ticket_id": cancellation['ticket_id']})
    return {"message": "Cancellation removed", "cancellation": cancellation}

@api_router.get("/cancellations", response_model=List[CancellationItem])
async def get_cancellations():
    cancellations = await db.cancellations.find({}, {"_id": 0}, sort=[("timestamp", -1)]).to_list(1000)
    return cancellations

# Flight Scheduler (Min Heap) APIs
@api_router.get("/scheduler/heap")
async def get_flight_heap():
    flights = await db.flights.find({}, {"_id": 0}).to_list(1000)
    
    heap_data = []
    for flight in flights:
        heap_data.append((flight['departure_time'], flight))
    
    heapq.heapify(heap_data)
    
    result = []
    while heap_data:
        time, flight = heapq.heappop(heap_data)
        result.append(flight)
    
    return result

# Analytics API
@api_router.get("/analytics", response_model=Analytics)
async def get_analytics():
    airports_count = await db.airports.count_documents({})
    flights_count = await db.flights.count_documents({})
    passengers = await db.passengers.find({}, {"_id": 0}).to_list(1000)
    
    total_tickets = len(passengers)
    boarded = sum(1 for p in passengers if p['status'] == 'boarded')
    cancelled = sum(1 for p in passengers if p['status'] == 'cancelled')
    pending = sum(1 for p in passengers if p['status'] == 'pending')
    
    flights = await db.flights.find({}, {"_id": 0}).to_list(1000)
    upcoming_flight = None
    if flights:
        sorted_flights = sorted(flights, key=lambda x: x['departure_time'])
        upcoming_flight = sorted_flights[0] if sorted_flights else None
    
    return Analytics(
        total_airports=airports_count,
        total_flights=flights_count,
        total_tickets=total_tickets,
        boarded=boarded,
        cancelled=cancelled,
        pending=pending,
        upcoming_flight=upcoming_flight
    )

# Initialize with sample data
@api_router.post("/initialize-data")
async def initialize_data():
    await db.airports.delete_many({})
    await db.flights.delete_many({})
    await db.passengers.delete_many({})
    await db.boarding_queue.delete_many({})
    await db.cancellations.delete_many({})
    
    sample_airports = [
        {"id": str(uuid.uuid4()), "code": "DEL", "name": "Indira Gandhi International", "city": "New Delhi"},
        {"id": str(uuid.uuid4()), "code": "BOM", "name": "Chhatrapati Shivaji Maharaj International", "city": "Mumbai"},
        {"id": str(uuid.uuid4()), "code": "BLR", "name": "Kempegowda International", "city": "Bangalore"},
        {"id": str(uuid.uuid4()), "code": "MAA", "name": "Chennai International", "city": "Chennai"},
        {"id": str(uuid.uuid4()), "code": "CCU", "name": "Netaji Subhas Chandra Bose International", "city": "Kolkata"},
        {"id": str(uuid.uuid4()), "code": "HYD", "name": "Rajiv Gandhi International", "city": "Hyderabad"}
    ]
    await db.airports.insert_many(sample_airports)
    
    sample_flights = [
        {"id": str(uuid.uuid4()), "flight_id": "AI101", "source_code": "DEL", "destination_code": "BOM", "departure_time": "08:00", "total_seats": 180, "booked_seats": 0},
        {"id": str(uuid.uuid4()), "flight_id": "AI102", "source_code": "BOM", "destination_code": "BLR", "departure_time": "10:30", "total_seats": 180, "booked_seats": 0},
        {"id": str(uuid.uuid4()), "flight_id": "AI103", "source_code": "BLR", "destination_code": "MAA", "departure_time": "12:00", "total_seats": 180, "booked_seats": 0},
        {"id": str(uuid.uuid4()), "flight_id": "AI104", "source_code": "MAA", "destination_code": "CCU", "departure_time": "14:30", "total_seats": 180, "booked_seats": 0},
        {"id": str(uuid.uuid4()), "flight_id": "AI105", "source_code": "CCU", "destination_code": "HYD", "departure_time": "16:00", "total_seats": 180, "booked_seats": 0},
        {"id": str(uuid.uuid4()), "flight_id": "AI106", "source_code": "HYD", "destination_code": "DEL", "departure_time": "18:30", "total_seats": 180, "booked_seats": 0},
        {"id": str(uuid.uuid4()), "flight_id": "AI107", "source_code": "DEL", "destination_code": "BLR", "departure_time": "09:00", "total_seats": 180, "booked_seats": 0},
        {"id": str(uuid.uuid4()), "flight_id": "AI108", "source_code": "BOM", "destination_code": "HYD", "departure_time": "11:00", "total_seats": 180, "booked_seats": 0}
    ]
    await db.flights.insert_many(sample_flights)
    
    sample_passengers = [
        {"ticket_id": "TKTABC12345", "name": "Rajesh Kumar", "passport": "P12345678", "flight_id": "AI101", "seat_number": "12A", "status": "pending"},
        {"ticket_id": "TKTDEF67890", "name": "Priya Sharma", "passport": "P23456789", "flight_id": "AI101", "seat_number": "13B", "status": "pending"},
        {"ticket_id": "TKTGHI11223", "name": "Amit Patel", "passport": "P34567890", "flight_id": "AI102", "seat_number": "14C", "status": "pending"},
        {"ticket_id": "TKTJKL44556", "name": "Sneha Reddy", "passport": "P45678901", "flight_id": "AI102", "seat_number": "15D", "status": "pending"},
        {"ticket_id": "TKTMNO77889", "name": "Vikram Singh", "passport": "P56789012", "flight_id": "AI103", "seat_number": "16E", "status": "pending"},
        {"ticket_id": "TKTPQR99001", "name": "Ananya Iyer", "passport": "P67890123", "flight_id": "AI103", "seat_number": "17F", "status": "pending"},
        {"ticket_id": "TKTSTU22334", "name": "Karan Mehta", "passport": "P78901234", "flight_id": "AI104", "seat_number": "18A", "status": "pending"},
        {"ticket_id": "TKTVWX55667", "name": "Deepika Nair", "passport": "P89012345", "flight_id": "AI104", "seat_number": "19B", "status": "pending"},
        {"ticket_id": "TKTYZA88990", "name": "Rohan Gupta", "passport": "P90123456", "flight_id": "AI105", "seat_number": "20C", "status": "pending"},
        {"ticket_id": "TKTBCD11122", "name": "Kavya Desai", "passport": "P01234567", "flight_id": "AI105", "seat_number": "21D", "status": "pending"},
        {"ticket_id": "TKTEFG33445", "name": "Arjun Rao", "passport": "P12340987", "flight_id": "AI106", "seat_number": "22E", "status": "pending"},
        {"ticket_id": "TKTHIJ66778", "name": "Neha Bansal", "passport": "P23451098", "flight_id": "AI106", "seat_number": "23F", "status": "pending"}
    ]
    await db.passengers.insert_many(sample_passengers)
    
    for flight_id in ["AI101", "AI102", "AI103", "AI104", "AI105", "AI106"]:
        flight_passengers = [p for p in sample_passengers if p['flight_id'] == flight_id]
        await db.flights.update_one(
            {"flight_id": flight_id},
            {"$set": {"booked_seats": len(flight_passengers)}}
        )
    
    return {"message": "Sample data initialized successfully"}

@api_router.post("/reset-system")
async def reset_system():
    await db.airports.delete_many({})
    await db.flights.delete_many({})
    await db.passengers.delete_many({})
    await db.boarding_queue.delete_many({})
    await db.cancellations.delete_many({})
    return {"message": "System reset successfully"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
