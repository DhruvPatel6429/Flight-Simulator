import React, { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Download, Search, UserPlus, Plane } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const PassengerDatabaseView = () => {
  const [passengers, setPassengers] = useState([]);
  const [hashTable, setHashTable] = useState({});
  const [newPassenger, setNewPassenger] = useState({
    name: '',
    passport: '',
    flight_id: '',
    seat_number: ''
  });
  const [searchTicketId, setSearchTicketId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const hashTableRef = useRef(null);
  const tableSize = 10;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [passengersRes] = await Promise.all([
        axios.get(`${API}/passengers`)
      ]);
      setPassengers(passengersRes.data);
      buildHashTable(passengersRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load passenger data');
    }
  };

  const generateHash = (ticketId) => {
    let hash = 0;
    for (let i = 0; i < ticketId.length; i++) {
      hash = (hash * 31 + ticketId.charCodeAt(i)) % tableSize;
    }
    return hash;
  };

  const buildHashTable = (passengersList) => {
    const table = {};
    for (let i = 0; i < tableSize; i++) {
      table[i] = [];
    }
    passengersList.forEach(passenger => {
      const hash = generateHash(passenger.ticket_id);
      table[hash].push(passenger);
    });
    setHashTable(table);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'boarded': return 'bg-green-500/20 border-green-500';
      case 'cancelled': return 'bg-red-500/20 border-red-500';
      case 'pending': return 'bg-blue-500/20 border-blue-500';
      default: return 'bg-aviation-surface border-aviation-border';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'boarded': return 'text-green-400';
      case 'cancelled': return 'text-red-400';
      case 'pending': return 'text-blue-400';
      default: return 'text-aviation-text-secondary';
    }
  };

  const handleAddPassenger = async () => {
    // Validation
    if (!newPassenger.name || newPassenger.name.length < 2) {
      toast.error('Please enter a valid name (min 2 characters)');
      return;
    }
    if (!newPassenger.passport || newPassenger.passport.length < 8) {
      toast.error('Please enter a valid passport number (min 8 characters)');
      return;
    }
    if (!newPassenger.flight_id) {
      toast.error('Please select a flight');
      return;
    }
    if (!newPassenger.seat_number || newPassenger.seat_number.length < 2) {
      toast.error('Please enter a valid seat number');
      return;
    }

    try {
      const response = await axios.post(`${API}/passengers`, {
        name: newPassenger.name,
        passport: newPassenger.passport,
        flight_id: newPassenger.flight_id,
        seat_number: newPassenger.seat_number,
        status: 'pending'
      });
      
      toast.success(`Passenger ${newPassenger.name} added successfully! 🎉`);
      setNewPassenger({ name: '', passport: '', flight_id: '', seat_number: '' });
      
      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error adding passenger:', error);
      toast.error(error.response?.data?.detail || 'Failed to add passenger');
    }
  };

  const handleSearchPassenger = async () => {
    if (!searchTicketId) {
      toast.error('Please enter a ticket ID');
      return;
    }

    try {
      const response = await axios.get(`${API}/passengers/search/${searchTicketId}`);
      setSearchResult(response.data);
      toast.success('Passenger found!');
    } catch (error) {
      setSearchResult(null);
      toast.error('Passenger not found');
    }
  };

  const handleExportPNG = async () => {
    if (!hashTableRef.current) {
      toast.error('Hash table not ready for export');
      return;
    }

    setIsExporting(true);
    try {
      const canvas = await html2canvas(hashTableRef.current, {
        backgroundColor: '#0a0e1a',
        scale: 2,
        logging: false,
        useCORS: true
      });

      const link = document.createElement('a');
      link.download = `passenger-hashtable-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast.success('Hash table exported as PNG! 🎉');
    } catch (error) {
      console.error('Error exporting PNG:', error);
      toast.error('Failed to export PNG');
    }
    setIsExporting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Export Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-bold text-aviation-text-primary">
            Passenger Database
          </h2>
          <p className="text-sm text-aviation-text-secondary mt-1">
            Hash Table with Separate Chaining for collision handling
          </p>
        </div>
        <Button
          onClick={handleExportPNG}
          disabled={isExporting}
          className="bg-cyan-500 hover:bg-cyan-600 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export PNG'}
        </Button>
      </div>

      {/* Status Legend */}
      <div className="flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-aviation-text-secondary font-medium">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-aviation-text-secondary font-medium">Boarded</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-aviation-text-secondary font-medium">Cancelled</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hash Table Visualization - Left Side (2/3 width) */}
        <div className="lg:col-span-2">
          <div ref={hashTableRef} className="bg-aviation-bg border border-aviation-border rounded-lg p-6">
            <div className="space-y-4">
              {Object.keys(hashTable).map((bucketIdx) => {
                const bucket = hashTable[bucketIdx];
                const collisionCount = bucket.length;
                
                return (
                  <div key={bucketIdx} className="border border-aviation-border/50 rounded-lg p-4 bg-aviation-surface/30">
                    <div className="flex items-start gap-4">
                      {/* Bucket Index */}
                      <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-aviation-surface border-2 border-aviation-border flex items-center justify-center">
                        <span className="font-bold text-2xl text-aviation-text-primary font-mono">
                          {bucketIdx}
                        </span>
                      </div>

                      {/* Bucket Content */}
                      <div className="flex-1 min-h-[64px] flex items-center">
                        {bucket.length === 0 ? (
                          <div className="text-aviation-text-secondary/50 text-sm font-mono italic">
                            Empty
                          </div>
                        ) : (
                          <div className="space-y-2 w-full">
                            {/* Collision Indicator */}
                            {collisionCount > 1 && (
                              <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500 rounded text-xs font-mono text-yellow-400">
                                Collision: {collisionCount} passengers
                              </div>
                            )}
                            
                            {/* Passenger Cards Chain */}
                            <div className="flex items-center gap-2 flex-wrap">
                              {bucket.map((passenger, itemIdx) => (
                                <React.Fragment key={passenger.ticket_id}>
                                  {/* Passenger Card */}
                                  <Card className={`p-3 border-2 ${getStatusColor(passenger.status)} shadow-sm`}>
                                    <div className="space-y-1">
                                      <div className="font-mono text-xs font-bold text-aviation-text-primary">
                                        {passenger.ticket_id}
                                      </div>
                                      <div className="text-xs text-aviation-text-primary">
                                        {passenger.name}
                                      </div>
                                      <div className="text-xs text-aviation-text-secondary">
                                        {passenger.flight_id}
                                      </div>
                                      <div className={`text-xs font-mono font-bold uppercase ${getStatusTextColor(passenger.status)}`}>
                                        {passenger.status}
                                      </div>
                                    </div>
                                  </Card>
                                  
                                  {/* Arrow to next node */}
                                  {itemIdx < bucket.length - 1 && (
                                    <div className="text-aviation-text-secondary text-2xl font-bold">→</div>
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Forms - Right Side (1/3 width) */}
        <div className="space-y-6">
          {/* Add Passenger Form */}
          <Card className="bg-aviation-surface/50 border-aviation-border p-6">
            <h3 className="text-xl font-heading font-bold text-aviation-text-primary mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Add Passenger
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-aviation-text-secondary mb-1 block">Name</label>
                <Input
                  placeholder="Enter name"
                  value={newPassenger.name}
                  onChange={(e) => setNewPassenger({ ...newPassenger, name: e.target.value })}
                  className="bg-aviation-bg border-aviation-border text-aviation-text-primary"
                />
              </div>
              
              <div>
                <label className="text-xs text-aviation-text-secondary mb-1 block">Passport</label>
                <Input
                  placeholder="Enter passport number"
                  value={newPassenger.passport}
                  onChange={(e) => setNewPassenger({ ...newPassenger, passport: e.target.value })}
                  className="bg-aviation-bg border-aviation-border text-aviation-text-primary"
                />
              </div>
              
              <div>
                <label className="text-xs text-aviation-text-secondary mb-1 block">Flight ID</label>
                <Input
                  placeholder="e.g., AI101"
                  value={newPassenger.flight_id}
                  onChange={(e) => setNewPassenger({ ...newPassenger, flight_id: e.target.value })}
                  className="bg-aviation-bg border-aviation-border text-aviation-text-primary"
                />
              </div>
              
              <div>
                <label className="text-xs text-aviation-text-secondary mb-1 block">Seat Number</label>
                <Input
                  placeholder="e.g., 12A"
                  value={newPassenger.seat_number}
                  onChange={(e) => setNewPassenger({ ...newPassenger, seat_number: e.target.value })}
                  className="bg-aviation-bg border-aviation-border text-aviation-text-primary"
                />
              </div>

              <Button
                onClick={handleAddPassenger}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold"
              >
                Add Passenger
              </Button>
            </div>
          </Card>

          {/* Search Passenger Form */}
          <Card className="bg-aviation-surface/50 border-aviation-border p-6">
            <h3 className="text-xl font-heading font-bold text-aviation-text-primary mb-4 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Passenger
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-aviation-text-secondary mb-1 block">Ticket ID</label>
                <Input
                  placeholder="Enter ticket ID"
                  value={searchTicketId}
                  onChange={(e) => setSearchTicketId(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSearchPassenger();
                  }}
                  className="bg-aviation-bg border-aviation-border text-aviation-text-primary"
                />
              </div>

              <Button
                onClick={handleSearchPassenger}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold"
              >
                Search
              </Button>

              {/* Search Result */}
              {searchResult && (
                <div className={`mt-4 p-4 rounded-lg border-2 ${getStatusColor(searchResult.status)}`}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-aviation-text-secondary">Ticket ID:</span>
                      <span className="text-sm font-mono font-bold text-aviation-text-primary">
                        {searchResult.ticket_id}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-aviation-text-secondary">Name:</span>
                      <span className="text-sm text-aviation-text-primary">
                        {searchResult.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-aviation-text-secondary">Flight:</span>
                      <span className="text-sm text-aviation-text-primary">
                        {searchResult.flight_id}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-aviation-text-secondary">Seat:</span>
                      <span className="text-sm text-aviation-text-primary">
                        {searchResult.seat_number}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-aviation-text-secondary">Status:</span>
                      <span className={`text-sm font-bold uppercase ${getStatusTextColor(searchResult.status)}`}>
                        {searchResult.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
