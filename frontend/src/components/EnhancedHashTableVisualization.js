import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';

const ANIMATION_SPEEDS = {
  slow: 1500,
  normal: 800,
  fast: 400
};

export const EnhancedHashTableVisualization = ({ 
  passengers, 
  animationSpeed = 'normal',
  showSteps = false,
  onSearchComplete 
}) => {
  const [hashTable, setHashTable] = useState({});
  const [animatingKey, setAnimatingKey] = useState(null);
  const [highlightBucket, setHighlightBucket] = useState(null);
  const [searchPath, setSearchPath] = useState([]);
  const [hashFormula, setHashFormula] = useState(null);
  const tableSize = 10;

  useEffect(() => {
    buildHashTable();
  }, [passengers]);

  const generateHash = (ticketId) => {
    let hash = 0;
    for (let i = 0; i < ticketId.length; i++) {
      hash = (hash * 31 + ticketId.charCodeAt(i)) % tableSize;
    }
    return hash;
  };

  const buildHashTable = () => {
    const table = {};
    for (let i = 0; i < tableSize; i++) {
      table[i] = [];
    }
    passengers.forEach(passenger => {
      const hash = generateHash(passenger.ticket_id);
      table[hash].push(passenger);
    });
    setHashTable(table);
  };

  const animateInsert = async (ticketId) => {
    const hash = generateHash(ticketId);
    setHashFormula(`hash("${ticketId}") = ${hash}`);
    setAnimatingKey(ticketId);
    await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEEDS[animationSpeed]));
    setHighlightBucket(hash);
    await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEEDS[animationSpeed]));
    setAnimatingKey(null);
    setHighlightBucket(null);
    setHashFormula(null);
  };

  const animateSearch = async (ticketId) => {
    const hash = generateHash(ticketId);
    const bucket = hashTable[hash] || [];
    
    setHashFormula(`hash("${ticketId}") = ${hash}`);
    setHighlightBucket(hash);
    
    const path = [];
    for (let i = 0; i < bucket.length; i++) {
      path.push({ bucket: hash, index: i });
      setSearchPath([...path]);
      await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEEDS[animationSpeed]));
      
      if (bucket[i].ticket_id === ticketId) {
        if (onSearchComplete) onSearchComplete(bucket[i]);
        break;
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEEDS[animationSpeed] * 2));
    setSearchPath([]);
    setHighlightBucket(null);
    setHashFormula(null);
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

  const isSearchHighlighted = (bucketIdx, itemIdx) => {
    return searchPath.some(p => p.bucket === bucketIdx && p.index === itemIdx);
  };

  return (
    <div className="space-y-4" data-testid="enhanced-hash-table">
      {/* Hash Formula Display */}
      {hashFormula && (
        <div className="bg-aviation-accent/10 border border-aviation-accent rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
          <div className="text-sm font-mono text-aviation-accent font-bold">
            {hashFormula}
          </div>
          {showSteps && (
            <div className="text-xs text-aviation-text-secondary mt-2">
              Hash function: Σ(char_code × 31^i) mod {tableSize}
            </div>
          )}
        </div>
      )}

      {/* Status Legend */}
      <div className="flex gap-4 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-aviation-text-secondary">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-aviation-text-secondary">Boarded</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-aviation-text-secondary">Cancelled</span>
        </div>
      </div>

      {/* Hash Table Buckets */}
      <div className="grid grid-cols-1 gap-3">
        {Object.keys(hashTable).map((bucketIdx) => {
          const bucket = hashTable[bucketIdx];
          const idx = parseInt(bucketIdx);
          const isHighlighted = highlightBucket === idx;
          const collisionCount = bucket.length;
          
          return (
            <div
              key={bucketIdx}
              className={`transition-all duration-300 ${
                isHighlighted ? 'scale-105 shadow-lg shadow-aviation-accent/20' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Bucket Index */}
                <div className={`flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center font-bold text-xl transition-all duration-300 ${
                  isHighlighted 
                    ? 'bg-aviation-accent text-white scale-110' 
                    : 'bg-aviation-surface border-2 border-aviation-border text-aviation-text-primary'
                }`}>
                  {bucketIdx}
                </div>

                {/* Bucket Content - Linked List */}
                <div className="flex-1 min-h-[64px] flex items-center">
                  {bucket.length === 0 ? (
                    <div className="text-aviation-text-secondary text-sm font-mono italic">
                      Empty
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      {bucket.map((passenger, itemIdx) => {
                        const isSearching = isSearchHighlighted(idx, itemIdx);
                        return (
                          <React.Fragment key={passenger.ticket_id}>
                            {/* Passenger Card */}
                            <Card className={`p-3 transition-all duration-300 ${
                              getStatusColor(passenger.status)
                            } ${
                              isSearching ? 'ring-2 ring-aviation-accent scale-105' : ''
                            } ${
                              animatingKey === passenger.ticket_id ? 'animate-in zoom-in-50 duration-500' : ''
                            }`}>
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
                                <div className={`text-xs font-mono font-bold ${getStatusTextColor(passenger.status)}`}>
                                  {passenger.status.toUpperCase()}
                                </div>
                              </div>
                            </Card>
                            
                            {/* Arrow to next node in chain */}
                            {itemIdx < bucket.length - 1 && (
                              <div className="text-aviation-text-secondary text-xl">→</div>
                            )}
                          </React.Fragment>
                        );
                      })}
                      
                      {/* Collision indicator */}
                      {collisionCount > 1 && (
                        <div className="ml-2 px-2 py-1 bg-aviation-accent/20 border border-aviation-accent rounded text-xs font-mono text-aviation-accent">
                          Collision: {collisionCount} passengers
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showSteps && (
        <div className="text-xs text-aviation-text-secondary font-mono space-y-1 bg-aviation-surface p-4 rounded-lg">
          <div>• Separate Chaining: Each bucket holds a linked list</div>
          <div>• Collision Resolution: Multiple items with same hash go in same bucket</div>
          <div>• Time Complexity: O(1) average, O(n) worst case (when all keys collide)</div>
        </div>
      )}
    </div>
  );
};
