import React from 'react';

export const StackVisualization = ({ stack }) => {
  const maxDisplay = 8;
  const displayStack = stack.slice(0, maxDisplay);
  
  return (
    <div className="space-y-4" data-testid="stack-visualization">
      {stack.length === 0 ? (
        <div className="text-center py-12 text-aviation-text-secondary">
          <div className="text-4xl mb-2">📚</div>
          <div>No cancellations</div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="text-xs font-mono text-aviation-text-secondary">TOP (Most Recent)</div>
          </div>
          
          <div className="space-y-2">
            {displayStack.map((item, idx) => (
              <div 
                key={`${item.ticket_id}-${idx}`}
                className="stack-item-animate bg-aviation-surface border-2 border-dsa-stack rounded-lg p-4 relative"
                style={{ marginLeft: `${idx * 8}px` }}
                data-testid={`stack-item-${item.ticket_id}`}
              >
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-dsa-stack rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {idx}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-xs text-aviation-text-secondary">Ticket ID</div>
                    <div className="font-mono font-bold text-dsa-stack">{item.ticket_id}</div>
                  </div>
                  <div>
                    <div className="text-xs text-aviation-text-secondary">Passenger</div>
                    <div className="text-aviation-text-primary">{item.passenger_name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-aviation-text-secondary">Flight</div>
                    <div className="font-mono text-aviation-text-primary">{item.flight_id}</div>
                  </div>
                  <div>
                    <div className="text-xs text-aviation-text-secondary">Time</div>
                    <div className="text-xs font-mono text-aviation-text-secondary">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {stack.length > maxDisplay && (
            <div className="text-center text-sm text-aviation-text-secondary font-mono">
              + {stack.length - maxDisplay} more cancellations
            </div>
          )}
        </>
      )}
    </div>
  );
};
