import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { RefreshCw, Zap, TrendingUp, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ANIMATION_SPEEDS = {
  slow: 1500,
  normal: 800,
  fast: 400
};

const COLLISION_METHODS = [
  { value: 'separate_chaining', label: 'Separate Chaining', description: 'Linked list in each bucket' },
  { value: 'linear_probing', label: 'Linear Probing', description: 'Sequential slot search' },
  { value: 'quadratic_probing', label: 'Quadratic Probing', description: 'Jump by squares' },
  { value: 'double_hashing', label: 'Double Hashing', description: 'Secondary hash function' }
];

export const AdvancedHashTableVisualization = ({ 
  animationSpeed = 'normal',
  showSteps = false,
  stepMode = false
}) => {
  const [hashData, setHashData] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('separate_chaining');
  const [tableSize, setTableSize] = useState(10);
  const [isRehashing, setIsRehashing] = useState(false);
  const [rehashData, setRehashData] = useState(null);
  const [animatingIndex, setAnimatingIndex] = useState(null);
  const [highlightedProbe, setHighlightedProbe] = useState([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonData, setComparisonData] = useState({});

  useEffect(() => {
    loadHashTable();
  }, [selectedMethod, tableSize]);

  const loadHashTable = async () => {
    try {
      const res = await axios.get(`${API}/passengers/hash-table?method=${selectedMethod}&table_size=${tableSize}`);
      setHashData(res.data);
    } catch (error) {
      console.error('Error loading hash table:', error);
      toast.error('Failed to load hash table');
    }
  };

  const handleRehash = async () => {
    setIsRehashing(true);
    const newSize = tableSize * 2;
    
    try {
      const res = await axios.post(`${API}/passengers/hash-table/rehash?old_size=${tableSize}&new_size=${newSize}`);
      setRehashData(res.data);
      
      // Animate rehashing
      await animateRehashing(res.data);
      
      // Update table size
      setTableSize(newSize);
      toast.success(`Rehashed! Table size: ${tableSize} → ${newSize}`);
    } catch (error) {
      toast.error('Failed to rehash table');
    }
    
    setIsRehashing(false);
    setRehashData(null);
  };

  const animateRehashing = async (data) => {
    const speed = ANIMATION_SPEEDS[animationSpeed];
    
    for (const movement of data.movements) {
      setAnimatingIndex(movement.from_index);
      await new Promise(resolve => setTimeout(resolve, speed / 2));
      setAnimatingIndex(movement.to_index);
      await new Promise(resolve => setTimeout(resolve, speed / 2));
    }
    
    setAnimatingIndex(null);
  };

  const loadComparisonData = async () => {
    setComparisonMode(true);
    const data = {};
    
    try {
      for (const method of COLLISION_METHODS) {
        const res = await axios.get(`${API}/passengers/hash-table?method=${method.value}&table_size=${tableSize}`);
        data[method.value] = res.data;
      }
      setComparisonData(data);
      toast.success('Loaded comparison data');
    } catch (error) {
      toast.error('Failed to load comparison data');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'boarded': return 'bg-green-500/20 border-green-500 text-green-400';
      case 'cancelled': return 'bg-red-500/20 border-red-500 text-red-400';
      case 'pending': return 'bg-blue-500/20 border-blue-500 text-blue-400';
      default: return 'bg-aviation-surface border-aviation-border text-aviation-text-secondary';
    }
  };

  const getLoadFactorColor = (loadFactor) => {
    if (loadFactor > 0.75) return 'text-red-500';
    if (loadFactor > 0.5) return 'text-yellow-500';
    return 'text-green-500';
  };

  const renderSeparateChaining = () => {
    if (!hashData) return null;
    
    return (
      <div className="space-y-3">
        {Object.entries(hashData.table).map(([index, items]) => (
          <div 
            key={index} 
            className={`border border-aviation-border rounded-lg p-3 transition-all ${
              animatingIndex === parseInt(index) ? 'bg-yellow-500/20 border-yellow-500' : 'bg-aviation-bg'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Index Label */}
              <div className="flex-shrink-0 w-20">
                <div className="bg-aviation-surface border border-aviation-border rounded px-3 py-2 text-center">
                  <div className="text-xs text-aviation-text-secondary mb-1">Index</div>
                  <div className="font-mono font-bold text-aviation-text-primary">[{index}]</div>
                </div>
              </div>
              
              {/* Linked List Chain */}
              <div className="flex-1 min-w-0">
                {items.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-aviation-text-secondary text-sm italic border border-dashed border-aviation-border rounded px-4 py-2">
                    NULL (Empty bucket)
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Collision warning */}
                    {items.length > 1 && (
                      <div className="flex items-center gap-2 text-xs bg-yellow-500/10 border border-yellow-500/50 rounded px-2 py-1">
                        <AlertTriangle className="w-3 h-3 text-yellow-500" />
                        <span className="text-yellow-500 font-bold">{items.length} Collisions - Separate Chaining</span>
                      </div>
                    )}
                    
                    {/* Chain visualization */}
                    <div className="flex flex-wrap items-center gap-2">
                      {items.map((passenger, idx) => (
                        <React.Fragment key={passenger.ticket_id}>
                          {idx > 0 && (
                            <div className="text-aviation-text-secondary font-bold text-lg">→</div>
                          )}
                          <div className={`border-2 rounded-lg px-4 py-2 ${getStatusColor(passenger.status)} shadow-sm`}>
                            <div className="text-xs font-mono font-bold mb-1">
                              {passenger.ticket_id}
                            </div>
                            <div className="text-xs opacity-75">
                              {passenger.passenger_name}
                            </div>
                          </div>
                        </React.Fragment>
                      ))}
                      <div className="text-aviation-text-secondary/50 text-sm font-mono">→ NULL</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderOpenAddressing = () => {
    if (!hashData) return null;
    
    return (
      <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3">
        {Object.entries(hashData.table).map(([index, item]) => (
          <div 
            key={index}
            className={`relative border-2 rounded-lg p-3 transition-all min-h-[80px] flex flex-col justify-center ${
              animatingIndex === parseInt(index) ? 'bg-yellow-500/20 scale-105 border-yellow-500 shadow-lg' : 
              item ? 'bg-aviation-bg border-aviation-border hover:shadow-md' : 'bg-aviation-surface/30 border-aviation-border/30 border-dashed'
            }`}
          >
            {/* Index Badge */}
            <div className="absolute -top-2 -left-2 bg-aviation-accent text-white text-xs font-mono font-bold px-2 py-0.5 rounded">
              {index}
            </div>
            
            {item ? (
              <div className={`text-center ${getStatusColor(item.status)} rounded-lg p-2`}>
                <div className="text-xs font-mono font-bold mb-1">
                  {item.ticket_id}
                </div>
                <div className="text-xs opacity-75 truncate">
                  {item.passenger_name}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-xs text-aviation-text-secondary/50 italic">Empty</div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderComparisonView = () => {
    if (!comparisonMode || Object.keys(comparisonData).length === 0) return null;
    
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {COLLISION_METHODS.map(method => {
          const data = comparisonData[method.value];
          if (!data) return null;
          
          return (
            <Card key={method.value} className="bg-aviation-surface border-aviation-border p-4">
              <h4 className="font-heading font-bold text-sm text-aviation-text-primary mb-2">
                {method.label}
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-aviation-text-secondary">Load Factor:</span>
                  <span className={`font-bold ${getLoadFactorColor(data.load_factor)}`}>
                    {data.load_factor}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-aviation-text-secondary">Collisions:</span>
                  <span className="font-mono font-bold text-aviation-text-primary">
                    {data.collision_count}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-aviation-text-secondary">Items:</span>
                  <span className="font-mono text-aviation-text-primary">
                    {data.num_items}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  if (!hashData) {
    return <div className="text-center text-aviation-text-secondary">Loading hash table...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-aviation-bg border border-aviation-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Collision Method Selector */}
          <div>
            <label className="text-xs text-aviation-text-secondary mb-1 block">Collision Method</label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full bg-aviation-surface border border-aviation-border text-aviation-text-primary rounded px-3 py-2 text-sm"
            >
              {COLLISION_METHODS.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          {/* Table Size */}
          <div>
            <label className="text-xs text-aviation-text-secondary mb-1 block">Table Size</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={tableSize}
                onChange={(e) => setTableSize(parseInt(e.target.value) || 10)}
                min="5"
                max="50"
                className="flex-1 bg-aviation-surface border border-aviation-border text-aviation-text-primary rounded px-3 py-2 text-sm"
              />
              <Button onClick={loadHashTable} size="sm" variant="outline">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Rehash Button */}
          <div className="flex items-end">
            <Button
              onClick={handleRehash}
              disabled={isRehashing || !hashData.needs_resize}
              className="w-full"
              variant={hashData.needs_resize ? "default" : "outline"}
            >
              {isRehashing ? 'Rehashing...' : 'Trigger Rehash'}
            </Button>
          </div>

          {/* Comparison Button */}
          <div className="flex items-end">
            <Button
              onClick={loadComparisonData}
              className="w-full"
              variant="outline"
            >
              Compare Methods
            </Button>
          </div>
        </div>

        {/* Method Description */}
        <div className="mt-4 text-sm text-aviation-text-secondary">
          <strong className="text-aviation-text-primary">
            {COLLISION_METHODS.find(m => m.value === selectedMethod)?.label}:
          </strong>{' '}
          {COLLISION_METHODS.find(m => m.value === selectedMethod)?.description}
        </div>
      </div>

      {/* Statistics Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-aviation-surface border-aviation-border p-4">
          <div className="text-xs text-aviation-text-secondary mb-1">Load Factor (α)</div>
          <div className={`text-2xl font-bold font-mono ${getLoadFactorColor(hashData.load_factor)}`}>
            {hashData.load_factor}
          </div>
          <div className="text-xs text-aviation-text-secondary mt-1">
            n/m = {hashData.num_items}/{hashData.table_size}
          </div>
        </Card>

        <Card className="bg-aviation-surface border-aviation-border p-4">
          <div className="text-xs text-aviation-text-secondary mb-1">Collisions</div>
          <div className="text-2xl font-bold font-mono text-yellow-500">
            {hashData.collision_count}
          </div>
          <div className="text-xs text-aviation-text-secondary mt-1">Total conflicts</div>
        </Card>

        <Card className="bg-aviation-surface border-aviation-border p-4">
          <div className="text-xs text-aviation-text-secondary mb-1">Table Size</div>
          <div className="text-2xl font-bold font-mono text-aviation-text-primary">
            {hashData.table_size}
          </div>
          <div className="text-xs text-aviation-text-secondary mt-1">Bucket count</div>
        </Card>

        <Card className={`border p-4 ${hashData.needs_resize ? 'bg-red-500/10 border-red-500' : 'bg-green-500/10 border-green-500'}`}>
          <div className="text-xs mb-1">Resize Status</div>
          <div className="text-2xl font-bold">
            {hashData.needs_resize ? (
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="w-6 h-6" />
                <span>Needed</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-500">
                <Zap className="w-6 h-6" />
                <span>Good</span>
              </div>
            )}
          </div>
          <div className="text-xs mt-1">
            {hashData.needs_resize ? 'α > 0.75' : 'α ≤ 0.75'}
          </div>
        </Card>
      </div>

      {/* Hash Table Visualization */}
      <Card className="bg-aviation-surface border-aviation-border p-6">
        <h3 className="font-heading font-bold text-aviation-text-primary mb-4">
          Hash Table Visualization
        </h3>
        {selectedMethod === 'separate_chaining' ? renderSeparateChaining() : renderOpenAddressing()}
      </Card>

      {/* Comparison View */}
      {renderComparisonView()}

      {/* Educational Info */}
      {showSteps && (
        <Card className="bg-aviation-bg border border-dsa-hash rounded-lg p-4">
          <h3 className="font-heading font-bold text-dsa-hash mb-3">Hash Table Complexity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-bold text-aviation-text-primary mb-2">Separate Chaining</h4>
              <div className="text-xs font-mono text-aviation-text-secondary space-y-1">
                <div>• Insert: O(1) average</div>
                <div>• Search: O(1 + α) average</div>
                <div>• Delete: O(1 + α) average</div>
                <div>• Space: O(n + m)</div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-aviation-text-primary mb-2">Open Addressing</h4>
              <div className="text-xs font-mono text-aviation-text-secondary space-y-1">
                <div>• Insert: O(1/(1-α)) average</div>
                <div>• Search: O(1/(1-α)) average</div>
                <div>• Delete: Complex (lazy deletion)</div>
                <div>• Space: O(m)</div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
