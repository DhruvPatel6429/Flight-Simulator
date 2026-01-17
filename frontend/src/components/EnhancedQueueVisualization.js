import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';

const ANIMATION_SPEEDS = {
  slow: 1500,
  normal: 800,
  fast: 400
};

const QUEUE_SIZE = 10;

export const EnhancedQueueVisualization = ({ 
  queue = [],
  flightId,
  animationSpeed = 'normal',
  showSteps = false 
}) => {
  const [circularArray, setCircularArray] = useState([]);
  const [front, setFront] = useState(0);
  const [rear, setRear] = useState(-1);
  const [animatingOperation, setAnimatingOperation] = useState(null);

  useEffect(() => {
    buildCircularQueue();
  }, [queue]);

  const buildCircularQueue = () => {
    const arr = new Array(QUEUE_SIZE).fill(null);
    const queueSize = queue.length;
    
    if (queueSize > 0) {
      queue.forEach((item, idx) => {
        const pos = idx % QUEUE_SIZE;
        arr[pos] = item;
      });
      setFront(0);
      setRear((queueSize - 1) % QUEUE_SIZE);
    } else {
      setFront(0);
      setRear(-1);
    }
    
    setCircularArray(arr);
  };

  const animateEnqueue = async (item) => {
    setAnimatingOperation('enqueue');
    await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEEDS[animationSpeed]));
    setAnimatingOperation(null);
  };

  const animateDequeue = async () => {
    setAnimatingOperation('dequeue');
    await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEEDS[animationSpeed]));
    setAnimatingOperation(null);
  };

  const isPointerPosition = (index) => {
    if (queue.length === 0) return { isFront: false, isRear: false };
    return {
      isFront: index === front,
      isRear: index === rear
    };
  };

  const getPositionAngle = (index) => {
    return (index * 36) - 90; // 360/10 = 36 degrees per slot, -90 to start at top
  };

  return (
    <div className="space-y-6" data-testid="enhanced-queue">
      {/* Circular Queue Visualization */}
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative w-[500px] h-[500px]">
          <svg viewBox="0 0 500 500" className="w-full h-full">
            {/* Background circle */}
            <circle
              cx="250"
              cy="250"
              r="180"
              fill="none"
              stroke="#334155"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            
            {/* Circular array slots */}
            {circularArray.map((item, index) => {
              const angle = getPositionAngle(index);
              const rad = (angle * Math.PI) / 180;
              const x = 250 + 180 * Math.cos(rad);
              const y = 250 + 180 * Math.sin(rad);
              const pointers = isPointerPosition(index);
              
              return (
                <g key={index}>
                  {/* Slot container */}
                  <g transform={`translate(${x}, ${y})`}>
                    <circle
                      r="35"
                      fill={item ? '#10B981' : '#1E293B'}
                      stroke={pointers.isFront || pointers.isRear ? '#F59E0B' : '#475569'}
                      strokeWidth={pointers.isFront || pointers.isRear ? '4' : '2'}
                      className="transition-all duration-300"
                    />
                    
                    {/* Index */}
                    <text
                      textAnchor="middle"
                      dy="-40"
                      fill="#64748B"
                      fontSize="12"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="bold"
                    >
                      [{index}]
                    </text>
                    
                    {/* Content or Empty */}
                    {item ? (
                      <>
                        <text
                          textAnchor="middle"
                          dy="-5"
                          fill="#F8FAFC"
                          fontSize="10"
                          fontFamily="JetBrains Mono, monospace"
                          fontWeight="bold"
                        >
                          {item.ticket_id.substring(0, 8)}
                        </text>
                        <text
                          textAnchor="middle"
                          dy="10"
                          fill="#D1FAE5"
                          fontSize="9"
                          fontFamily="IBM Plex Sans, sans-serif"
                        >
                          {item.passenger_name.split(' ')[0]}
                        </text>
                      </>
                    ) : (
                      <text
                        textAnchor="middle"
                        dy="5"
                        fill="#475569"
                        fontSize="10"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        —
                      </text>
                    )}
                    
                    {/* Front pointer */}
                    {pointers.isFront && queue.length > 0 && (
                      <g>
                        <path
                          d="M 0,-50 L 0,-65 L 10,-55 Z"
                          fill="#F59E0B"
                          className="animate-bounce"
                        />
                        <text
                          textAnchor="middle"
                          dy="-70"
                          fill="#F59E0B"
                          fontSize="11"
                          fontFamily="JetBrains Mono, monospace"
                          fontWeight="bold"
                        >
                          FRONT
                        </text>
                      </g>
                    )}
                    
                    {/* Rear pointer */}
                    {pointers.isRear && queue.length > 0 && (
                      <g>
                        <path
                          d="M 0,50 L 0,65 L 10,55 Z"
                          fill="#10B981"
                          className="animate-bounce"
                        />
                        <text
                          textAnchor="middle"
                          dy="78"
                          fill="#10B981"
                          fontSize="11"
                          fontFamily="JetBrains Mono, monospace"
                          fontWeight="bold"
                        >
                          REAR
                        </text>
                      </g>
                    )}
                  </g>
                </g>
              );
            })}
            
            {/* Center info */}
            <g transform="translate(250, 250)">
              <circle r="70" fill="#151E32" stroke="#334155" strokeWidth="2" />
              <text
                textAnchor="middle"
                dy="-15"
                fill="#94A3B8"
                fontSize="12"
                fontFamily="JetBrains Mono, monospace"
              >
                Queue Size
              </text>
              <text
                textAnchor="middle"
                dy="10"
                fill="#10B981"
                fontSize="28"
                fontFamily="Rajdhani, sans-serif"
                fontWeight="bold"
              >
                {queue.length}
              </text>
              <text
                textAnchor="middle"
                dy="30"
                fill="#64748B"
                fontSize="11"
                fontFamily="JetBrains Mono, monospace"
              >
                / {QUEUE_SIZE}
              </text>
            </g>
          </svg>
        </div>

        {/* Operation indicator */}
        {animatingOperation && (
          <div className={`mt-4 px-4 py-2 rounded-lg font-mono text-sm animate-in fade-in slide-in-from-bottom-2 ${
            animatingOperation === 'enqueue' 
              ? 'bg-green-500/20 border border-green-500 text-green-400'
              : 'bg-red-500/20 border border-red-500 text-red-400'
          }`}>
            {animatingOperation === 'enqueue' ? '➕ Enqueue Operation' : '➖ Dequeue Operation'}
          </div>
        )}
      </div>

      {/* Linear representation */}
      {queue.length > 0 && (
        <div className="bg-aviation-surface rounded-lg p-4">
          <h3 className="text-sm font-mono text-aviation-text-secondary mb-3">
            Linear View (FIFO Order)
          </h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <div className="text-xs font-mono text-aviation-accent font-bold">
              FRONT →
            </div>
            {queue.slice(0, 10).map((item, idx) => (
              <React.Fragment key={item.ticket_id}>
                <Card className="flex-shrink-0 p-3 bg-aviation-bg border-2 border-dsa-queue">
                  <div className="text-xs font-mono text-aviation-text-secondary mb-1">
                    Position: {idx}
                  </div>
                  <div className="text-sm font-mono font-bold text-dsa-queue">
                    {item.ticket_id}
                  </div>
                  <div className="text-xs text-aviation-text-primary">
                    {item.passenger_name}
                  </div>
                </Card>
                {idx < Math.min(queue.length - 1, 9) && (
                  <div className="text-dsa-queue text-xl">→</div>
                )}
              </React.Fragment>
            ))}
            <div className="text-xs font-mono text-dsa-queue font-bold">
              ← REAR
            </div>
          </div>
          {queue.length > 10 && (
            <div className="text-center text-xs text-aviation-text-secondary font-mono mt-2">
              + {queue.length - 10} more passengers
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {queue.length === 0 && (
        <div className="text-center py-8 text-aviation-text-secondary">
          <div className="text-5xl mb-3">📬</div>
          <div className="text-lg font-mono">Queue is Empty</div>
          <div className="text-sm mt-2">Add passengers to the boarding queue</div>
        </div>
      )}

      {/* Queue properties */}
      {showSteps && (
        <div className="text-xs text-aviation-text-secondary font-mono space-y-1 bg-aviation-surface p-4 rounded-lg">
          <div className="text-sm font-bold text-aviation-text-primary mb-2">Circular Queue Properties:</div>
          <div>• FIFO (First In, First Out) - passengers board in order</div>
          <div>• Circular: Rear wraps to index 0 when reaching end</div>
          <div>• Enqueue: O(1) - add at rear</div>
          <div>• Dequeue: O(1) - remove from front</div>
          <div>• Prevents memory wastage from linear queue</div>
          <div className="mt-3">
            <span className="text-aviation-accent">✓ Current capacity: </span>
            {queue.length} / {QUEUE_SIZE}
          </div>
        </div>
      )}
    </div>
  );
};
