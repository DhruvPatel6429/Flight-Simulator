import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const BulkOperationsDialog = ({ open, onOpenChange, flights, onComplete }) => {
  const [bulkPassengers, setBulkPassengers] = useState([
    { name: '', passport: '', flight_id: '', seat_number: '' }
  ]);
  const [loading, setLoading] = useState(false);

  const addPassengerRow = () => {
    setBulkPassengers([...bulkPassengers, { name: '', passport: '', flight_id: '', seat_number: '' }]);
  };

  const removePassengerRow = (index) => {
    const updated = bulkPassengers.filter((_, i) => i !== index);
    setBulkPassengers(updated);
  };

  const updatePassenger = (index, field, value) => {
    const updated = [...bulkPassengers];
    updated[index][field] = value;
    setBulkPassengers(updated);
  };

  const handleBulkSubmit = async () => {
    const validPassengers = bulkPassengers.filter(p => 
      p.name && p.passport && p.flight_id && p.seat_number
    );

    if (validPassengers.length === 0) {
      toast.error('Please fill at least one complete passenger entry');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/passengers/bulk`, validPassengers);
      toast.success(`Added ${res.data.added} passengers successfully!`);
      if (res.data.failed > 0) {
        toast.warning(`Failed to add ${res.data.failed} passengers`);
      }
      setBulkPassengers([{ name: '', passport: '', flight_id: '', seat_number: '' }]);
      onComplete();
      onOpenChange(false);
    } catch (error) {
      toast.error('Bulk operation failed: ' + (error.response?.data?.detail || error.message));
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-aviation-surface border-aviation-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading text-aviation-text-primary">
            Bulk Add Passengers
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {bulkPassengers.map((passenger, index) => (
            <div key={index} className="grid grid-cols-5 gap-3 p-4 bg-aviation-bg rounded-lg border border-aviation-border">
              <div>
                <Label className="text-xs text-aviation-text-secondary">Name</Label>
                <Input
                  value={passenger.name}
                  onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                  className="bg-aviation-surface border-aviation-border"
                  placeholder="Full Name"
                />
              </div>
              <div>
                <Label className="text-xs text-aviation-text-secondary">Passport</Label>
                <Input
                  value={passenger.passport}
                  onChange={(e) => updatePassenger(index, 'passport', e.target.value)}
                  className="bg-aviation-surface border-aviation-border"
                  placeholder="P12345678"
                />
              </div>
              <div>
                <Label className="text-xs text-aviation-text-secondary">Flight ID</Label>
                <select
                  value={passenger.flight_id}
                  onChange={(e) => updatePassenger(index, 'flight_id', e.target.value)}
                  className="w-full h-10 px-3 bg-aviation-surface border border-aviation-border text-aviation-text-primary rounded"
                >
                  <option value="">Select Flight</option>
                  {flights.map(f => (
                    <option key={f.flight_id} value={f.flight_id}>
                      {f.flight_id} ({f.source_code}→{f.destination_code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs text-aviation-text-secondary">Seat</Label>
                <Input
                  value={passenger.seat_number}
                  onChange={(e) => updatePassenger(index, 'seat_number', e.target.value)}
                  className="bg-aviation-surface border-aviation-border"
                  placeholder="12A"
                />
              </div>
              <div className="flex items-end">
                {bulkPassengers.length > 1 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removePassengerRow(index)}
                    className="w-full"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}

          <div className="flex gap-3">
            <Button onClick={addPassengerRow} variant="outline" className="flex-1">
              + Add Another Passenger
            </Button>
            <Button onClick={handleBulkSubmit} disabled={loading} className="flex-1 bg-dsa-graph hover:bg-dsa-graph/80">
              {loading ? 'Processing...' : `Submit ${bulkPassengers.filter(p => p.name).length} Passengers`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
