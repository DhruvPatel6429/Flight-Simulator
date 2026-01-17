import React from 'react';

export const QueueVisualization = ({ queue, flightId }) => {
  const maxDisplay = 10;
  const displayQueue = queue.slice(0, maxDisplay);
  
  return (
    <div className="space-y-4" data-testid="queue-visualization">
      {queue.length === 0 ? (
        <div className="text-center py-12 text-aviation-text-secondary">
          <div className="text-4xl mb-2">📭</div>
          <div>Queue is empty</div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4">
            <div className="text-xs font-mono text-aviation-text-secondary">FRONT</div>
            <div className="flex-1 h-px bg-aviation-border"></div>
            <div className="text-xs font-mono text-aviation-text-secondary">REAR</div>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-4">
            {displayQueue.map((item, idx) => (
              <div 
                key={item.ticket_id}
                className="queue-item-animate flex-shrink-0 w-48 bg-aviation-surface border-2 border-dsa-queue rounded-lg p-4 relative"
                data-testid={`queue-item-${item.ticket_id}`}
              >
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-dsa-queue rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {idx}
                </div>
                
                <div className="space-y-1">
                  <div className="font-mono text-sm font-bold text-dsa-queue">{item.ticket_id}</div>
                  <div className="text-aviation-text-primary font-medium">{item.passenger_name}</div>
                  <div className="text-xs text-aviation-text-secondary">Position: {item.position}</div>
                </div>
                
                {idx < displayQueue.length - 1 && (
                  <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 text-2xl text-dsa-queue">→</div>
                )}
              </div>
            ))}
          </div>
          
          {queue.length > maxDisplay && (
            <div className="text-center text-sm text-aviation-text-secondary font-mono">
              + {queue.length - maxDisplay} more passengers in queue
            </div>
          )}
        </>
      )}
    </div>
  );
};
