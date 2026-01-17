import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { EnhancedGraphVisualization } from './EnhancedGraphVisualization';
import { EnhancedHashTableVisualization } from './EnhancedHashTableVisualization';
import { EnhancedQueueVisualization } from './EnhancedQueueVisualization';
import { EnhancedStackVisualization } from './EnhancedStackVisualization';
import { EnhancedHeapVisualization } from './EnhancedHeapVisualization';
import { OperationControlPanel } from './OperationControlPanel';
import { BulkOperationsDialog } from './BulkOperationsDialog';
import { ImportExportDialog } from './ImportExportDialog';
import { AnalyticsCharts } from './AnalyticsCharts';
import { PathfindingVisualizer } from './PathfindingVisualizer';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Dashboard = () => {
  const [airports, setAirports] = useState([]);
  const [flights, setFlights] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [hashTable, setHashTable] = useState({});
  const [adjacencyList, setAdjacencyList] = useState({});
  const [boardingQueues, setBoardingQueues] = useState({});
  const [cancellations, setCancellations] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [detailedAnalytics, setDetailedAnalytics] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showDSAInfo, setShowDSAInfo] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState('normal');
  const [stepMode, setStepMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showImportExportDialog, setShowImportExportDialog] = useState(false);

  const [newAirport, setNewAirport] = useState({ code: '', name: '', city: '' });
  const [newFlight, setNewFlight] = useState({ flight_id: '', source_code: '', destination_code: '', departure_time: '', total_seats: 180 });
  const [newPassenger, setNewPassenger] = useState({ name: '', passport: '', flight_id: '', seat_number: '' });
  const [searchTicket, setSearchTicket] = useState('');
  const [selectedFlight, setSelectedFlight] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [airportsRes, flightsRes, passengersRes, hashTableRes, adjListRes, analyticsRes, cancellationsRes] = await Promise.all([
        axios.get(`${API}/airports`),
        axios.get(`${API}/flights`),
        axios.get(`${API}/passengers`),
        axios.get(`${API}/passengers/hash-table`),
        axios.get(`${API}/graph/adjacency-list`),
        axios.get(`${API}/analytics`),
        axios.get(`${API}/cancellations`)
      ]);

      setAirports(airportsRes.data);
      setFlights(flightsRes.data);
      setPassengers(passengersRes.data);
      setHashTable(hashTableRes.data);
      setAdjacencyList(adjListRes.data);
      setAnalytics(analyticsRes.data);
      setCancellations(cancellationsRes.data);

      const queuePromises = flightsRes.data.map(f => 
        axios.get(`${API}/boarding-queue/${f.flight_id}`)
          .then(res => ({ flight_id: f.flight_id, queue: res.data }))
      );
      const queues = await Promise.all(queuePromises);
      const queueMap = {};
      queues.forEach(q => {
        queueMap[q.flight_id] = q.queue;
      });
      setBoardingQueues(queueMap);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    }
  };

  const initializeData = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/initialize-data`);
      toast.success('Sample data initialized successfully');
      await loadData();
    } catch (error) {
      toast.error('Failed to initialize data');
    }
    setLoading(false);
  };

  const resetSystem = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/reset-system`);
      toast.success('System reset successfully');
      await loadData();
    } catch (error) {
      toast.error('Failed to reset system');
    }
    setLoading(false);
  };

  const addAirport = async () => {
    try {
      await axios.post(`${API}/airports`, newAirport);
      toast.success('Airport added successfully');
      setNewAirport({ code: '', name: '', city: '' });
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add airport');
    }
  };

  const addFlight = async () => {
    try {
      await axios.post(`${API}/flights`, newFlight);
      toast.success('Flight added successfully');
      setNewFlight({ flight_id: '', source_code: '', destination_code: '', departure_time: '', total_seats: 180 });
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add flight');
    }
  };

  const addPassenger = async () => {
    try {
      await axios.post(`${API}/passengers`, newPassenger);
      toast.success('Passenger added successfully');
      setNewPassenger({ name: '', passport: '', flight_id: '', seat_number: '' });
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add passenger');
    }
  };

  const searchPassenger = async () => {
    try {
      const res = await axios.get(`${API}/passengers/search/${searchTicket}`);
      toast.success(`Found: ${res.data.name} - ${res.data.flight_id}`);
    } catch (error) {
      toast.error('Passenger not found');
    }
  };

  const enqueuePassenger = async (ticketId, flightId) => {
    try {
      await axios.post(`${API}/boarding-queue/${flightId}/enqueue?ticket_id=${ticketId}`);
      toast.success('Passenger added to boarding queue');
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to enqueue passenger');
    }
  };

  const dequeuePassenger = async (flightId) => {
    try {
      const res = await axios.post(`${API}/boarding-queue/${flightId}/dequeue`);
      toast.success(`${res.data.boarded.passenger_name} boarded successfully`);
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to board passenger');
    }
  };

  const cancelTicket = async (ticketId) => {
    try {
      await axios.post(`${API}/cancellations/push?ticket_id=${ticketId}`);
      toast.success('Ticket cancelled and added to stack');
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to cancel ticket');
    }
  };

  const popCancellation = async () => {
    try {
      const res = await axios.post(`${API}/cancellations/pop`);
      toast.success(`Removed: ${res.data.cancellation.ticket_id}`);
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'No cancellations to pop');
    }
  };

  const exportVisualization = async (elementId, filename) => {
    try {
      const element = document.getElementById(elementId);
      const canvas = await html2canvas(element, {
        backgroundColor: '#0B1120',
        scale: 2
      });
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL();
      link.click();
      toast.success('Visualization exported successfully');
    } catch (error) {
      toast.error('Failed to export visualization');
    }
  };

  return (
    <div className="min-h-screen bg-aviation-bg">
      {/* Header */}
      <header className="border-b border-aviation-border bg-aviation-surface backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-dsa-graph rounded-lg flex items-center justify-center">
                <span className="text-2xl">✈️</span>
              </div>
              <div>
                <h1 className="text-3xl font-heading font-bold text-aviation-text-primary">AeroOps DSA Simulator</h1>
                <p className="text-sm text-aviation-text-secondary font-mono">Data Structures & Algorithms Lab Project</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-aviation-accent/20 border border-aviation-accent rounded-lg">
                <span className="text-sm font-mono font-bold text-aviation-accent">DSA LAB PROJECT</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        {/* Analytics Dashboard */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <Card className="bg-aviation-surface border-aviation-border p-4" data-testid="analytics-airports">
              <div className="text-sm text-aviation-text-secondary font-mono">Total Airports</div>
              <div className="text-3xl font-heading font-bold text-dsa-graph">{analytics.total_airports}</div>
            </Card>
            <Card className="bg-aviation-surface border-aviation-border p-4" data-testid="analytics-flights">
              <div className="text-sm text-aviation-text-secondary font-mono">Total Flights</div>
              <div className="text-3xl font-heading font-bold text-dsa-graph">{analytics.total_flights}</div>
            </Card>
            <Card className="bg-aviation-surface border-aviation-border p-4" data-testid="analytics-tickets">
              <div className="text-sm text-aviation-text-secondary font-mono">Total Tickets</div>
              <div className="text-3xl font-heading font-bold text-aviation-text-primary">{analytics.total_tickets}</div>
            </Card>
            <Card className="bg-aviation-surface border-aviation-border p-4" data-testid="analytics-boarded">
              <div className="text-sm text-aviation-text-secondary font-mono">Boarded</div>
              <div className="text-3xl font-heading font-bold text-dsa-queue">{analytics.boarded}</div>
            </Card>
            <Card className="bg-aviation-surface border-aviation-border p-4" data-testid="analytics-pending">
              <div className="text-sm text-aviation-text-secondary font-mono">Pending</div>
              <div className="text-3xl font-heading font-bold text-aviation-accent">{analytics.pending}</div>
            </Card>
            <Card className="bg-aviation-surface border-aviation-border p-4" data-testid="analytics-cancelled">
              <div className="text-sm text-aviation-text-secondary font-mono">Cancelled</div>
              <div className="text-3xl font-heading font-bold text-dsa-stack">{analytics.cancelled}</div>
            </Card>
          </div>
        )}

        {/* Controls Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          {/* System Controls */}
          <Card className="lg:col-span-3 bg-aviation-surface border-aviation-border p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <Button onClick={initializeData} disabled={loading} className="bg-dsa-graph hover:bg-dsa-graph/80" data-testid="btn-initialize-data">
                📊 Initialize Sample Data
              </Button>
              <Button onClick={resetSystem} disabled={loading} variant="destructive" data-testid="btn-reset-system">
                🔄 Reset System
              </Button>
              <div className="h-8 w-px bg-aviation-border"></div>
              <div className="text-xs text-aviation-text-secondary font-mono">
                Click airports to explore • Use BFS/DFS to traverse • View step-by-step animations
              </div>
            </div>
          </Card>

          {/* Operation Control Panel */}
          <OperationControlPanel 
            animationSpeed={animationSpeed}
            onSpeedChange={setAnimationSpeed}
            showDSAInfo={showDSAInfo}
            onToggleDSAInfo={() => setShowDSAInfo(!showDSAInfo)}
            stepMode={stepMode}
            onToggleStepMode={() => setStepMode(!stepMode)}
          />
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="graph" className="space-y-6">
          <TabsList className="bg-aviation-surface border border-aviation-border">
            <TabsTrigger value="graph" data-testid="tab-graph">Airport Network (Graph)</TabsTrigger>
            <TabsTrigger value="hash" data-testid="tab-hash">Passenger DB (Hash Table)</TabsTrigger>
            <TabsTrigger value="queue" data-testid="tab-queue">Boarding Queue</TabsTrigger>
            <TabsTrigger value="stack" data-testid="tab-stack">Cancellations (Stack)</TabsTrigger>
            <TabsTrigger value="heap" data-testid="tab-heap">Flight Scheduler (Heap)</TabsTrigger>
          </TabsList>

          {/* Graph Tab */}
          <TabsContent value="graph" className="space-y-4">
            <Card className="bg-aviation-surface border-aviation-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-aviation-text-primary">Airport Network Graph</h2>
                  <p className="text-sm text-aviation-text-secondary font-mono">Graph implemented using Adjacency List</p>
                </div>
                <Button onClick={() => exportVisualization('graph-section', 'airport-graph')} size="sm" data-testid="btn-export-graph">
                  Export PNG
                </Button>
              </div>
              
              {showDSAInfo && (
                <div className="mb-4 p-4 bg-aviation-bg border border-dsa-graph rounded-lg">
                  <h3 className="font-heading font-bold text-dsa-graph mb-2">Data Structure: Graph (Adjacency List)</h3>
                  <p className="text-sm text-aviation-text-secondary mb-2">Represents airports as nodes and flight routes as edges.</p>
                  <div className="text-xs font-mono text-aviation-text-secondary">
                    <div>• Add Vertex (Airport): O(1)</div>
                    <div>• Add Edge (Route): O(1)</div>
                    <div>• Search: O(V + E)</div>
                  </div>
                </div>
              )}

              <div id="graph-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-aviation-bg border border-aviation-border rounded-lg p-4">
                  <EnhancedGraphVisualization 
                    airports={airports}
                    flights={flights}
                    selectedNode={selectedNode}
                    onNodeClick={setSelectedNode}
                    animationSpeed={animationSpeed}
                    showSteps={showDSAInfo}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="bg-aviation-bg border border-aviation-border rounded-lg p-4">
                    <h3 className="font-heading font-bold text-aviation-text-primary mb-3">Add Airport</h3>
                    <div className="space-y-2">
                      <Input 
                        placeholder="Code (e.g., JFK)" 
                        value={newAirport.code}
                        onChange={(e) => setNewAirport({...newAirport, code: e.target.value})}
                        className="bg-aviation-surface border-aviation-border"
                        data-testid="input-airport-code"
                      />
                      <Input 
                        placeholder="Name" 
                        value={newAirport.name}
                        onChange={(e) => setNewAirport({...newAirport, name: e.target.value})}
                        className="bg-aviation-surface border-aviation-border"
                        data-testid="input-airport-name"
                      />
                      <Input 
                        placeholder="City" 
                        value={newAirport.city}
                        onChange={(e) => setNewAirport({...newAirport, city: e.target.value})}
                        className="bg-aviation-surface border-aviation-border"
                        data-testid="input-airport-city"
                      />
                      <Button onClick={addAirport} className="w-full bg-dsa-graph hover:bg-dsa-graph/80" data-testid="btn-add-airport">
                        Add Airport
                      </Button>
                    </div>
                  </div>

                  <div className="bg-aviation-bg border border-aviation-border rounded-lg p-4">
                    <h3 className="font-heading font-bold text-aviation-text-primary mb-3">Add Flight Route</h3>
                    <div className="space-y-2">
                      <Input 
                        placeholder="Flight ID (e.g., AI109)" 
                        value={newFlight.flight_id}
                        onChange={(e) => setNewFlight({...newFlight, flight_id: e.target.value})}
                        className="bg-aviation-surface border-aviation-border"
                        data-testid="input-flight-id"
                      />
                      <Input 
                        placeholder="Source Code" 
                        value={newFlight.source_code}
                        onChange={(e) => setNewFlight({...newFlight, source_code: e.target.value})}
                        className="bg-aviation-surface border-aviation-border"
                        data-testid="input-flight-source"
                      />
                      <Input 
                        placeholder="Destination Code" 
                        value={newFlight.destination_code}
                        onChange={(e) => setNewFlight({...newFlight, destination_code: e.target.value})}
                        className="bg-aviation-surface border-aviation-border"
                        data-testid="input-flight-destination"
                      />
                      <Input 
                        placeholder="Departure Time (HH:MM)" 
                        value={newFlight.departure_time}
                        onChange={(e) => setNewFlight({...newFlight, departure_time: e.target.value})}
                        className="bg-aviation-surface border-aviation-border"
                        data-testid="input-flight-time"
                      />
                      <Button onClick={addFlight} className="w-full bg-dsa-graph hover:bg-dsa-graph/80" data-testid="btn-add-flight">
                        Add Flight
                      </Button>
                    </div>
                  </div>

                  {selectedNode && adjacencyList[selectedNode] && (
                    <div className="bg-aviation-bg border border-dsa-graph rounded-lg p-4">
                      <h3 className="font-heading font-bold text-dsa-graph mb-3">Adjacency List: {selectedNode}</h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {adjacencyList[selectedNode].map((edge, idx) => (
                          <div key={idx} className="text-sm font-mono bg-aviation-surface p-2 rounded">
                            <div className="text-aviation-text-primary">→ {edge.destination}</div>
                            <div className="text-xs text-aviation-text-secondary">Flight: {edge.flight_id} | {edge.departure_time}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Hash Table Tab */}
          <TabsContent value="hash" className="space-y-4">
            <Card className="bg-aviation-surface border-aviation-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-aviation-text-primary">Passenger Database</h2>
                  <p className="text-sm text-aviation-text-secondary font-mono">Hash Table with Separate Chaining for collision handling</p>
                </div>
                <Button onClick={() => exportVisualization('hash-section', 'hash-table')} size="sm" data-testid="btn-export-hash">
                  Export PNG
                </Button>
              </div>

              {showDSAInfo && (
                <div className="mb-4 p-4 bg-aviation-bg border border-dsa-graph rounded-lg">
                  <h3 className="font-heading font-bold text-dsa-graph mb-2">Data Structure: Hash Table (Separate Chaining)</h3>
                  <p className="text-sm text-aviation-text-secondary mb-2">Uses hash function to map ticket IDs to buckets. Collisions handled via linked lists.</p>
                  <div className="text-xs font-mono text-aviation-text-secondary">
                    <div>• Insert: O(1) average, O(n) worst case</div>
                    <div>• Search: O(1) average, O(n) worst case</div>
                    <div>• Delete: O(1) average, O(n) worst case</div>
                  </div>
                </div>
              )}

              <div id="hash-section" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                  <EnhancedHashTableVisualization 
                    passengers={passengers}
                    animationSpeed={animationSpeed}
                    showSteps={showDSAInfo}
                  />
                </div>

                <div className="space-y-4">
                  <div className="bg-aviation-bg border border-aviation-border rounded-lg p-4">
                    <h3 className="font-heading font-bold text-aviation-text-primary mb-3">Add Passenger</h3>
                    <div className="space-y-2">
                      <Input 
                        placeholder="Name" 
                        value={newPassenger.name}
                        onChange={(e) => setNewPassenger({...newPassenger, name: e.target.value})}
                        className="bg-aviation-surface border-aviation-border"
                        data-testid="input-passenger-name"
                      />
                      <Input 
                        placeholder="Passport" 
                        value={newPassenger.passport}
                        onChange={(e) => setNewPassenger({...newPassenger, passport: e.target.value})}
                        className="bg-aviation-surface border-aviation-border"
                        data-testid="input-passenger-passport"
                      />
                      <Input 
                        placeholder="Flight ID" 
                        value={newPassenger.flight_id}
                        onChange={(e) => setNewPassenger({...newPassenger, flight_id: e.target.value})}
                        className="bg-aviation-surface border-aviation-border"
                        data-testid="input-passenger-flight"
                      />
                      <Input 
                        placeholder="Seat Number" 
                        value={newPassenger.seat_number}
                        onChange={(e) => setNewPassenger({...newPassenger, seat_number: e.target.value})}
                        className="bg-aviation-surface border-aviation-border"
                        data-testid="input-passenger-seat"
                      />
                      <Button onClick={addPassenger} className="w-full bg-dsa-graph hover:bg-dsa-graph/80" data-testid="btn-add-passenger">
                        Add Passenger
                      </Button>
                    </div>
                  </div>

                  <div className="bg-aviation-bg border border-aviation-border rounded-lg p-4">
                    <h3 className="font-heading font-bold text-aviation-text-primary mb-3">Search Passenger</h3>
                    <div className="space-y-2">
                      <Input 
                        placeholder="Ticket ID" 
                        value={searchTicket}
                        onChange={(e) => setSearchTicket(e.target.value)}
                        className="bg-aviation-surface border-aviation-border"
                        data-testid="input-search-ticket"
                      />
                      <Button onClick={searchPassenger} className="w-full bg-dsa-graph hover:bg-dsa-graph/80" data-testid="btn-search-passenger">
                        Search
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Queue Tab */}
          <TabsContent value="queue" className="space-y-4">
            <Card className="bg-aviation-surface border-aviation-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-aviation-text-primary">Boarding Queue</h2>
                  <p className="text-sm text-aviation-text-secondary font-mono">Queue implemented using Circular Array (FIFO)</p>
                </div>
                <Button onClick={() => exportVisualization('queue-section', 'boarding-queue')} size="sm" data-testid="btn-export-queue">
                  Export PNG
                </Button>
              </div>

              {showDSAInfo && (
                <div className="mb-4 p-4 bg-aviation-bg border border-dsa-queue rounded-lg">
                  <h3 className="font-heading font-bold text-dsa-queue mb-2">Data Structure: Queue (Circular Array - FIFO)</h3>
                  <p className="text-sm text-aviation-text-secondary mb-2">First In First Out. Front pointer for dequeue, rear pointer for enqueue.</p>
                  <div className="text-xs font-mono text-aviation-text-secondary">
                    <div>• Enqueue: O(1)</div>
                    <div>• Dequeue: O(1)</div>
                    <div>• Peek: O(1)</div>
                  </div>
                </div>
              )}

              <div id="queue-section" className="space-y-4">
                <div className="bg-aviation-bg border border-aviation-border rounded-lg p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <Label className="text-aviation-text-secondary">Select Flight:</Label>
                    <select 
                      value={selectedFlight}
                      onChange={(e) => setSelectedFlight(e.target.value)}
                      className="bg-aviation-surface border border-aviation-border text-aviation-text-primary rounded px-3 py-2"
                      data-testid="select-flight-queue"
                    >
                      <option value="">Choose a flight</option>
                      {flights.map(f => (
                        <option key={f.flight_id} value={f.flight_id}>
                          {f.flight_id} ({f.source_code} → {f.destination_code})
                        </option>
                      ))}
                    </select>
                    {selectedFlight && boardingQueues[selectedFlight] && (
                      <Button 
                        onClick={() => dequeuePassenger(selectedFlight)} 
                        disabled={boardingQueues[selectedFlight].length === 0}
                        className="bg-dsa-queue hover:bg-dsa-queue/80"
                        data-testid="btn-dequeue-passenger"
                      >
                        Board Next Passenger
                      </Button>
                    )}
                  </div>

                  {selectedFlight && boardingQueues[selectedFlight] && (
                    <EnhancedQueueVisualization 
                      queue={boardingQueues[selectedFlight]} 
                      flightId={selectedFlight}
                      animationSpeed={animationSpeed}
                      showSteps={showDSAInfo}
                    />
                  )}
                </div>

                <div className="bg-aviation-bg border border-aviation-border rounded-lg p-4">
                  <h3 className="font-heading font-bold text-aviation-text-primary mb-3">Add to Queue</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                    {passengers.filter(p => p.status === 'pending').map(p => (
                      <div key={p.ticket_id} className="bg-aviation-surface border border-aviation-border rounded-lg p-3">
                        <div className="text-sm font-mono font-bold text-aviation-text-primary">{p.ticket_id}</div>
                        <div className="text-sm text-aviation-text-secondary">{p.name}</div>
                        <div className="text-xs text-aviation-text-secondary font-mono">{p.flight_id} - {p.seat_number}</div>
                        <Button 
                          onClick={() => enqueuePassenger(p.ticket_id, p.flight_id)} 
                          size="sm" 
                          className="w-full mt-2 bg-dsa-queue hover:bg-dsa-queue/80"
                          data-testid={`btn-enqueue-${p.ticket_id}`}
                        >
                          Add to Queue
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Stack Tab */}
          <TabsContent value="stack" className="space-y-4">
            <Card className="bg-aviation-surface border-aviation-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-aviation-text-primary">Cancellation History</h2>
                  <p className="text-sm text-aviation-text-secondary font-mono">Stack used to store cancellation history (LIFO)</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={popCancellation} disabled={cancellations.length === 0} variant="outline" data-testid="btn-pop-cancellation">
                    Pop (Undo)
                  </Button>
                  <Button onClick={() => exportVisualization('stack-section', 'cancellation-stack')} size="sm" data-testid="btn-export-stack">
                    Export PNG
                  </Button>
                </div>
              </div>

              {showDSAInfo && (
                <div className="mb-4 p-4 bg-aviation-bg border border-dsa-stack rounded-lg">
                  <h3 className="font-heading font-bold text-dsa-stack mb-2">Data Structure: Stack (LIFO)</h3>
                  <p className="text-sm text-aviation-text-secondary mb-2">Last In First Out. Most recent cancellation at the top.</p>
                  <div className="text-xs font-mono text-aviation-text-secondary">
                    <div>• Push: O(1)</div>
                    <div>• Pop: O(1)</div>
                    <div>• Peek: O(1)</div>
                  </div>
                </div>
              )}

              <div id="stack-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <EnhancedStackVisualization 
                    stack={cancellations}
                    animationSpeed={animationSpeed}
                    showSteps={showDSAInfo}
                  />
                </div>

                <div className="bg-aviation-bg border border-aviation-border rounded-lg p-4">
                  <h3 className="font-heading font-bold text-aviation-text-primary mb-3">Cancel Ticket</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {passengers.filter(p => p.status !== 'cancelled').map(p => (
                      <div key={p.ticket_id} className="bg-aviation-surface border border-aviation-border rounded-lg p-3">
                        <div className="text-sm font-mono font-bold text-aviation-text-primary">{p.ticket_id}</div>
                        <div className="text-sm text-aviation-text-secondary">{p.name}</div>
                        <div className="text-xs text-aviation-text-secondary font-mono">{p.flight_id} - {p.status}</div>
                        <Button 
                          onClick={() => cancelTicket(p.ticket_id)} 
                          size="sm" 
                          variant="destructive"
                          className="w-full mt-2"
                          data-testid={`btn-cancel-${p.ticket_id}`}
                        >
                          Cancel Ticket
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Heap Tab */}
          <TabsContent value="heap" className="space-y-4">
            <Card className="bg-aviation-surface border-aviation-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-aviation-text-primary">Flight Scheduler</h2>
                  <p className="text-sm text-aviation-text-secondary font-mono">Min Heap used for priority-based flight scheduling</p>
                </div>
                <Button onClick={() => exportVisualization('heap-section', 'flight-heap')} size="sm" data-testid="btn-export-heap">
                  Export PNG
                </Button>
              </div>

              {showDSAInfo && (
                <div className="mb-4 p-4 bg-aviation-bg border border-dsa-heap rounded-lg">
                  <h3 className="font-heading font-bold text-dsa-heap mb-2">Data Structure: Min Heap (Priority Queue)</h3>
                  <p className="text-sm text-aviation-text-secondary mb-2">Binary tree where parent node has earlier departure time than children.</p>
                  <div className="text-xs font-mono text-aviation-text-secondary">
                    <div>• Insert: O(log n)</div>
                    <div>• Extract Min: O(log n)</div>
                    <div>• Heapify: O(n)</div>
                  </div>
                </div>
              )}

              <div id="heap-section" className="bg-aviation-bg border border-aviation-border rounded-lg p-6">
                <EnhancedHeapVisualization 
                  flights={flights}
                  animationSpeed={animationSpeed}
                  showSteps={showDSAInfo}
                  showArrayRepresentation={true}
                />
              </div>

              {analytics?.upcoming_flight && (
                <div className="bg-aviation-bg border border-dsa-heap rounded-lg p-4 mt-4">
                  <h3 className="font-heading font-bold text-dsa-heap mb-2">Next Flight (Heap Root)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-aviation-text-secondary">Flight ID</div>
                      <div className="font-mono font-bold text-aviation-text-primary">{analytics.upcoming_flight.flight_id}</div>
                    </div>
                    <div>
                      <div className="text-aviation-text-secondary">Route</div>
                      <div className="font-mono text-aviation-text-primary">
                        {analytics.upcoming_flight.source_code} → {analytics.upcoming_flight.destination_code}
                      </div>
                    </div>
                    <div>
                      <div className="text-aviation-text-secondary">Departure</div>
                      <div className="font-mono text-aviation-text-primary">{analytics.upcoming_flight.departure_time}</div>
                    </div>
                    <div>
                      <div className="text-aviation-text-secondary">Seats</div>
                      <div className="font-mono text-aviation-text-primary">
                        {analytics.upcoming_flight.booked_seats}/{analytics.upcoming_flight.total_seats}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
