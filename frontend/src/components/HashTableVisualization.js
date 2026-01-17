import React from 'react';

export const HashTableVisualization = ({ hashTable, onSearch }) => {
  return (
    <div className="space-y-3" data-testid="hash-table-visualization">
      {Object.entries(hashTable).map(([bucket, passengers]) => (
        <div 
          key={bucket}
          className="hash-bucket bg-aviation-surface border border-aviation-border rounded-lg p-4"
        >
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-16 h-16 bg-dsa-graph rounded-lg flex items-center justify-center">
              <span className="text-2xl font-mono font-bold text-white">{bucket}</span>
            </div>
            
            <div className="flex-1">
              {passengers.length === 0 ? (
                <div className="text-aviation-text-secondary text-sm font-mono">EMPTY</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {passengers.map((passenger, idx) => (
                    <div 
                      key={passenger.ticket_id}
                      className="bg-aviation-surface-highlight border border-aviation-border rounded px-3 py-2 flex items-center gap-2"
                      data-testid={`hash-passenger-${passenger.ticket_id}`}
                    >
                      <div className="text-xs">
                        <div className="font-mono text-dsa-graph font-bold">{passenger.ticket_id}</div>
                        <div className="text-aviation-text-secondary">{passenger.name}</div>
                      </div>
                      {idx < passengers.length - 1 && (
                        <div className="text-aviation-text-secondary">→</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {passengers.length > 1 && (
            <div className="mt-2 text-xs text-aviation-accent font-mono">
              ⚠ Collision detected: {passengers.length} passengers in chain
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
