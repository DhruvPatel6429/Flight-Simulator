import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';

const ANIMATION_SPEEDS = {
  slow: 1500,
  normal: 800,
  fast: 400
};

export const EnhancedStackVisualization = ({ 
  stack = [],
  animationSpeed = 'normal',
  showSteps = false 
}) => {
  const [animatingOperation, setAnimatingOperation] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const maxDisplay = 8;
  const displayStack = stack.slice(0, maxDisplay);

  const animatePush = async (index) => {
    setAnimatingOperation('push');
    setHighlightedIndex(index);
    await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEEDS[animationSpeed]));
    setAnimatingOperation(null);
    setHighlightedIndex(null);
  };

  const animatePop = async () => {
    setAnimatingOperation('pop');
    setHighlightedIndex(0);
    await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEEDS[animationSpeed]));
    setAnimatingOperation(null);
    setHighlightedIndex(null);
  };

  return (
    <div className="space-y-6" data-testid="enhanced-stack">
      {/* Stack visualization */}
      <div className="flex flex-col items-center justify-center py-8">
        {stack.length === 0 ? (
          <div className="text-center py-12 text-aviation-text-secondary">
            <div className="text-6xl mb-4">📚</div>
            <div className="text-lg font-mono">Stack is Empty</div>
            <div className="text-sm mt-2">Cancel a ticket to add to cancellation history</div>
          </div>
        ) : (
          <div className="relative w-full max-w-2xl">
            {/* TOP pointer */}
            <div className="flex items-center justify-center mb-4 gap-3">
              <div className="h-12 w-px bg-dsa-stack"></div>
              <div className="px-4 py-2 bg-dsa-stack/20 border-2 border-dsa-stack rounded-lg font-mono text-sm font-bold text-dsa-stack animate-pulse">
                ▼ TOP (Most Recent)
              </div>
              <div className="h-12 w-px bg-dsa-stack"></div>
            </div>

            {/* Stack items */}
            <div className="space-y-3">
              {displayStack.map((item, idx) => {
                const isHighlighted = highlightedIndex === idx;
                const isTop = idx === 0;
                
                return (
                  <div
                    key={`${item.ticket_id}-${idx}`}
                    className={`transition-all duration-500 ${
                      animatingOperation === 'push' && isTop
                        ? 'animate-in slide-in-from-top-4 fade-in'
                        : animatingOperation === 'pop' && isTop
                        ? 'animate-out slide-out-to-top-4 fade-out'
                        : ''
                    }`}
                    style={{ 
                      marginLeft: `${idx * 12}px`,
                      transform: isHighlighted ? 'scale(1.02)' : 'scale(1)'
                    }}
                  >
                    <Card className={`p-5 relative transition-all duration-300 ${
                      isTop 
                        ? 'bg-dsa-stack/20 border-3 border-dsa-stack shadow-lg shadow-dsa-stack/30'
                        : 'bg-aviation-surface border-2 border-aviation-border'
                    } ${
                      isHighlighted ? 'ring-2 ring-aviation-accent' : ''
                    }`}>
                      {/* Stack level indicator */}
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-dsa-stack rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {idx}
                      </div>

                      {/* Top badge */}
                      {isTop && (
                        <div className="absolute -top-3 -left-3 px-3 py-1 bg-dsa-stack rounded-full text-white text-xs font-mono font-bold">
                          TOP
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-xs text-aviation-text-secondary mb-1">Ticket ID</div>
                          <div className={`font-mono font-bold ${
                            isTop ? 'text-dsa-stack' : 'text-aviation-text-primary'
                          }`}>
                            {item.ticket_id}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-aviation-text-secondary mb-1">Passenger</div>
                          <div className="text-aviation-text-primary font-medium">
                            {item.passenger_name}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-aviation-text-secondary mb-1">Flight</div>
                          <div className="font-mono text-aviation-text-primary">
                            {item.flight_id}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-aviation-text-secondary mb-1">Cancelled At</div>
                          <div className="text-xs font-mono text-aviation-text-secondary">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>

            {stack.length > maxDisplay && (
              <div className="text-center text-sm text-aviation-text-secondary font-mono mt-4 p-3 bg-aviation-surface rounded-lg border border-aviation-border">
                + {stack.length - maxDisplay} more cancellations below
              </div>
            )}

            {/* BOTTOM marker */}
            <div className="flex items-center justify-center mt-6 gap-3">
              <div className="flex-1 h-px bg-aviation-border"></div>
              <div className="px-4 py-2 bg-aviation-surface border border-aviation-border rounded font-mono text-xs text-aviation-text-secondary">
                ▲ BOTTOM (Oldest)
              </div>
              <div className="flex-1 h-px bg-aviation-border"></div>
            </div>
          </div>
        )}
      </div>

      {/* Operation indicator */}
      {animatingOperation && (
        <div className={`text-center px-4 py-2 rounded-lg font-mono text-sm animate-in fade-in slide-in-from-bottom-2 ${
          animatingOperation === 'push'
            ? 'bg-green-500/20 border border-green-500 text-green-400'
            : 'bg-red-500/20 border border-red-500 text-red-400'
        }`}>
          {animatingOperation === 'push' ? '⬆ Push Operation - Adding to top' : '⬇ Pop Operation - Removing from top'}
        </div>
      )}

      {/* Stack properties */}
      {showSteps && (
        <div className="text-xs text-aviation-text-secondary font-mono space-y-1 bg-aviation-surface p-4 rounded-lg">
          <div className="text-sm font-bold text-aviation-text-primary mb-2">Stack Properties (LIFO):</div>
          <div>• LIFO (Last In, First Out) - most recent cancellation on top</div>
          <div>• Push: O(1) - add to top</div>
          <div>• Pop: O(1) - remove from top</div>
          <div>• Peek: O(1) - view top without removing</div>
          <div className="mt-3">
            <span className="text-dsa-stack">✓ Current size: </span>
            {stack.length} cancellations
          </div>
        </div>
      )}
    </div>
  );
};
