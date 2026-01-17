import requests
import sys
import json
from datetime import datetime

class DSALabAPITester:
    def __init__(self, base_url="https://flydata-dash.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, params=params)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:100]}"
            
            self.log_test(name, success, details)
            return success, response.json() if success and response.text else {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_system_initialization(self):
        """Test system initialization and reset"""
        print("\n🔧 Testing System Initialization...")
        
        # Reset system first
        success, _ = self.run_test("Reset System", "POST", "reset-system", 200)
        
        # Initialize sample data
        success, _ = self.run_test("Initialize Sample Data", "POST", "initialize-data", 200)
        
        return success

    def test_airports_api(self):
        """Test Airport APIs (Graph vertices)"""
        print("\n🏢 Testing Airport APIs...")
        
        # Get airports
        success, airports = self.run_test("Get Airports", "GET", "airports", 200)
        if success:
            expected_count = 6
            actual_count = len(airports)
            if actual_count == expected_count:
                self.log_test(f"Airport Count Verification ({expected_count})", True)
            else:
                self.log_test(f"Airport Count Verification", False, f"Expected {expected_count}, got {actual_count}")
        
        # Test adding new airport
        new_airport = {
            "code": "GOI",
            "name": "Goa International",
            "city": "Goa"
        }
        success, _ = self.run_test("Add New Airport", "POST", "airports", 200, new_airport)
        
        # Test duplicate airport (should fail)
        success, _ = self.run_test("Add Duplicate Airport (Should Fail)", "POST", "airports", 400, new_airport)
        
        return True

    def test_flights_api(self):
        """Test Flight APIs (Graph edges)"""
        print("\n✈️ Testing Flight APIs...")
        
        # Get flights
        success, flights = self.run_test("Get Flights", "GET", "flights", 200)
        if success:
            expected_count = 8
            actual_count = len(flights)
            if actual_count == expected_count:
                self.log_test(f"Flight Count Verification ({expected_count})", True)
            else:
                self.log_test(f"Flight Count Verification", False, f"Expected {expected_count}, got {actual_count}")
        
        # Test adding new flight
        new_flight = {
            "flight_id": "AI109",
            "source_code": "DEL",
            "destination_code": "GOI",
            "departure_time": "20:00",
            "total_seats": 180
        }
        success, _ = self.run_test("Add New Flight", "POST", "flights", 200, new_flight)
        
        return True

    def test_adjacency_list(self):
        """Test Graph Adjacency List"""
        print("\n📊 Testing Graph Adjacency List...")
        
        success, adj_list = self.run_test("Get Adjacency List", "GET", "graph/adjacency-list", 200)
        if success:
            # Verify structure
            if isinstance(adj_list, dict):
                self.log_test("Adjacency List Structure", True)
                
                # Check if airports have connections
                has_connections = any(len(connections) > 0 for connections in adj_list.values())
                self.log_test("Airport Connections Exist", has_connections)
            else:
                self.log_test("Adjacency List Structure", False, "Not a dictionary")
        
        return success

    def test_passengers_api(self):
        """Test Passenger APIs (Hash Table)"""
        print("\n👥 Testing Passenger APIs...")
        
        # Get passengers
        success, passengers = self.run_test("Get Passengers", "GET", "passengers", 200)
        if success:
            expected_count = 12
            actual_count = len(passengers)
            if actual_count == expected_count:
                self.log_test(f"Passenger Count Verification ({expected_count})", True)
            else:
                self.log_test(f"Passenger Count Verification", False, f"Expected {expected_count}, got {actual_count}")
        
        # Test adding new passenger
        new_passenger = {
            "name": "Test User",
            "passport": "P99999999",
            "flight_id": "AI101",
            "seat_number": "24A"
        }
        success, passenger_data = self.run_test("Add New Passenger", "POST", "passengers", 200, new_passenger)
        
        # Test passenger search
        if success and 'ticket_id' in passenger_data:
            ticket_id = passenger_data['ticket_id']
            success, _ = self.run_test("Search Passenger", "GET", f"passengers/search/{ticket_id}", 200)
        
        return True

    def test_hash_table(self):
        """Test Hash Table Visualization"""
        print("\n🔢 Testing Hash Table...")
        
        success, hash_table = self.run_test("Get Hash Table", "GET", "passengers/hash-table", 200)
        if success:
            # Verify hash table structure (buckets 0-9)
            expected_buckets = set(str(i) for i in range(10))
            actual_buckets = set(hash_table.keys())
            
            if expected_buckets == actual_buckets:
                self.log_test("Hash Table Buckets (0-9)", True)
            else:
                self.log_test("Hash Table Buckets", False, f"Expected {expected_buckets}, got {actual_buckets}")
            
            # Check for collisions
            collisions = sum(1 for bucket in hash_table.values() if len(bucket) > 1)
            self.log_test(f"Hash Collisions Detection ({collisions} found)", True)
        
        return success

    def test_boarding_queue(self):
        """Test Boarding Queue (FIFO)"""
        print("\n🚶 Testing Boarding Queue...")
        
        # Get queue for a flight
        flight_id = "AI101"
        success, queue = self.run_test(f"Get Boarding Queue ({flight_id})", "GET", f"boarding-queue/{flight_id}", 200)
        
        # Test enqueue
        success, _ = self.run_test("Enqueue Passenger", "POST", f"boarding-queue/{flight_id}/enqueue", 200, 
                                 params={"ticket_id": "TKTABC12345"})
        
        # Test dequeue
        success, dequeue_result = self.run_test("Dequeue Passenger", "POST", f"boarding-queue/{flight_id}/dequeue", 200)
        if success and 'boarded' in dequeue_result:
            self.log_test("Dequeue Returns Boarded Passenger", True)
        
        return True

    def test_cancellation_stack(self):
        """Test Cancellation Stack (LIFO)"""
        print("\n📚 Testing Cancellation Stack...")
        
        # Get current cancellations
        success, cancellations = self.run_test("Get Cancellations", "GET", "cancellations", 200)
        
        # Test push (cancel ticket)
        success, _ = self.run_test("Push Cancellation", "POST", "cancellations/push", 200, 
                                 params={"ticket_id": "TKTDEF67890"})
        
        # Test pop
        success, pop_result = self.run_test("Pop Cancellation", "POST", "cancellations/pop", 200)
        if success and 'cancellation' in pop_result:
            self.log_test("Pop Returns Latest Cancellation", True)
        
        return True

    def test_flight_scheduler_heap(self):
        """Test Flight Scheduler (Min Heap)"""
        print("\n⏰ Testing Flight Scheduler Heap...")
        
        success, heap_flights = self.run_test("Get Flight Heap", "GET", "scheduler/heap", 200)
        if success:
            # Verify flights are sorted by departure time
            if len(heap_flights) > 1:
                is_sorted = all(heap_flights[i]['departure_time'] <= heap_flights[i+1]['departure_time'] 
                              for i in range(len(heap_flights)-1))
                self.log_test("Heap Sort by Departure Time", is_sorted)
            else:
                self.log_test("Heap Sort Verification", True, "Single or no flights")
        
        return success

    def test_analytics(self):
        """Test Analytics Dashboard"""
        print("\n📈 Testing Analytics...")
        
        success, analytics = self.run_test("Get Analytics", "GET", "analytics", 200)
        if success:
            required_fields = ['total_airports', 'total_flights', 'total_tickets', 'boarded', 'cancelled', 'pending']
            missing_fields = [field for field in required_fields if field not in analytics]
            
            if not missing_fields:
                self.log_test("Analytics Fields Complete", True)
            else:
                self.log_test("Analytics Fields", False, f"Missing: {missing_fields}")
            
            # Verify counts make sense
            total_tickets = analytics.get('total_tickets', 0)
            boarded = analytics.get('boarded', 0)
            cancelled = analytics.get('cancelled', 0)
            pending = analytics.get('pending', 0)
            
            if boarded + cancelled + pending == total_tickets:
                self.log_test("Analytics Count Consistency", True)
            else:
                self.log_test("Analytics Count Consistency", False, 
                            f"Total: {total_tickets}, Sum: {boarded + cancelled + pending}")
        
        return success

    def run_all_tests(self):
        """Run comprehensive test suite"""
        print("🚀 Starting DSA Lab API Testing...")
        print(f"Backend URL: {self.base_url}")
        
        # Test sequence
        tests = [
            self.test_system_initialization,
            self.test_airports_api,
            self.test_flights_api,
            self.test_adjacency_list,
            self.test_passengers_api,
            self.test_hash_table,
            self.test_boarding_queue,
            self.test_cancellation_stack,
            self.test_flight_scheduler_heap,
            self.test_analytics
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                print(f"❌ Test failed with exception: {str(e)}")
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = DSALabAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())