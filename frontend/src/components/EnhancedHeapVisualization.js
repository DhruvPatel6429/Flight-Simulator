import React, { useState, useEffect } from 'react';

const ANIMATION_SPEEDS = {
  slow: 2000,
  normal: 1000,
  fast: 500
};

export const EnhancedHeapVisualization = ({ 
  flights, 
  animationSpeed = 'normal',
  showSteps = false,
  showArrayRepresentation = true 
}) => {
  const [sortedFlights, setSortedFlights] = useState([]);
  const [comparingNodes, setComparingNodes] = useState([]);
  const [swappingNodes, setSwappingNodes] = useState([]);
  const [highlightedPath, setHighlightedPath] = useState([]);

  useEffect(() => {
    const sorted = [...flights].sort((a, b) => 
      a.departure_time.localeCompare(b.departure_time)
    );
    setSortedFlights(sorted);
  }, [flights]);

  const getNodePosition = (index, level) => {
    const svgWidth = 1000;
    const levelWidth = Math.pow(2, level);
    const nodeSpacing = svgWidth / (levelWidth + 1);
    const positionInLevel = index - (Math.pow(2, level) - 1);
    const x = (positionInLevel + 1) * nodeSpacing;
    const y = level * 140 + 80;
    return { x, y };
  };

  const animateBubbleUp = async (index) => {
    const path = [];
    let current = index;
    
    while (current > 0) {
      const parent = Math.floor((current - 1) / 2);
      path.push(current);
      setHighlightedPath([...path]);
      setComparingNodes([current, parent]);
      
      await new Promise(resolve => 
        setTimeout(resolve, ANIMATION_SPEEDS[animationSpeed])
      );
      
      if (sortedFlights[current]?.departure_time < sortedFlights[parent]?.departure_time) {
        setSwappingNodes([current, parent]);
        await new Promise(resolve => 
          setTimeout(resolve, ANIMATION_SPEEDS[animationSpeed])
        );
        current = parent;
      } else {
        break;
      }
    }
    
    setComparingNodes([]);
    setSwappingNodes([]);
    setHighlightedPath([]);
  };

  const renderNode = (flight, index) => {
    if (index >= sortedFlights.length) return null;
    
    const level = Math.floor(Math.log2(index + 1));
    const pos = getNodePosition(index, level);
    
    const isComparing = comparingNodes.includes(index);
    const isSwapping = swappingNodes.includes(index);
    const isHighlighted = highlightedPath.includes(index);
    const isRoot = index === 0;
    
    const leftChildIndex = index * 2 + 1;
    const rightChildIndex = index * 2 + 2;
    
    return (
      <g key={index}>
        {/* Lines to children */}
        {leftChildIndex < sortedFlights.length && (() => {
          const childLevel = Math.floor(Math.log2(leftChildIndex + 1));
          const childPos = getNodePosition(leftChildIndex, childLevel);
          return (
            <line
              x1={pos.x}
              y1={pos.y}
              x2={childPos.x}
              y2={childPos.y}
              stroke="#475569"
              strokeWidth="3"
              className="transition-all duration-300"
            />
          );
        })()}
        {rightChildIndex < sortedFlights.length && (() => {
          const childLevel = Math.floor(Math.log2(rightChildIndex + 1));
          const childPos = getNodePosition(rightChildIndex, childLevel);
          return (
            <line
              x1={pos.x}
              y1={pos.y}
              x2={childPos.x}
              y2={childPos.y}
              stroke="#475569"
              strokeWidth="3"
              className="transition-all duration-300"
            />
          );
        })()}
        
        {/* Node */}
        <g 
          transform={`translate(${pos.x}, ${pos.y})`}
          className="transition-all duration-500"
        >
          {/* Glow effect for root */}
          {isRoot && (
            <circle
              r="48"
              fill="none"
              stroke="#8B5CF6"
              strokeWidth="2"
              opacity="0.3"
              className="animate-pulse"
            />
          )}
          
          {/* Main circle */}
          <circle
            r="40"
            fill={isComparing ? '#F59E0B' : isSwapping ? '#EF4444' : isRoot ? '#8B5CF6' : '#7C3AED'}
            stroke={isRoot ? '#A78BFA' : '#6D28D9'}
            strokeWidth="3"
            className="transition-all duration-300"
            style={{
              transform: isSwapping ? 'scale(1.2)' : isComparing ? 'scale(1.1)' : 'scale(1)',
              transformOrigin: 'center'
            }}
          />
          
          {/* Flight ID */}
          <text
            textAnchor="middle"
            dy="-10"
            fill="#F8FAFC"
            fontSize="16"
            fontFamily="JetBrains Mono, monospace"
            fontWeight="bold"
          >
            {flight.flight_id}
          </text>
          
          {/* Departure Time */}
          <text
            textAnchor="middle"
            dy="10"
            fill="#E9D5FF"
            fontSize="13"
            fontFamily="JetBrains Mono, monospace"
          >
            {flight.departure_time}
          </text>
          
          {/* Route info */}
          <text
            textAnchor="middle"
            dy="26"
            fill="#C4B5FD"
            fontSize="10"
            fontFamily="JetBrains Mono, monospace"
          >
            {flight.source_code}→{flight.destination_code}
          </text>
          
          {/* Root indicator */}
          {isRoot && (
            <text
              textAnchor="middle"
              dy="-52"
              fill="#A78BFA"
              fontSize="12"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="bold"
            >
              ⭐ NEXT FLIGHT
            </text>
          )}
          
          {/* Index label */}
          <text
            textAnchor="middle"
            dy="52"
            fill="#64748B"
            fontSize="10"
            fontFamily="JetBrains Mono, monospace"
          >
            [{index}]
          </text>
        </g>
      </g>
    );
  };
  
  if (sortedFlights.length === 0) {
    return (
      <div className="text-center py-12 text-aviation-text-secondary" data-testid="enhanced-heap">
        <div className="text-6xl mb-4">⏰</div>
        <div className="text-lg">No flights scheduled</div>
      </div>
    );
  }
  
  const maxLevels = Math.ceil(Math.log2(sortedFlights.length + 1));
  const svgHeight = maxLevels * 140 + 140;
  
  return (
    <div className="space-y-6" data-testid="enhanced-heap">
      {/* Binary Tree Visualization */}
      <div className="w-full overflow-x-auto bg-aviation-surface rounded-lg p-6">
        <svg 
          width="100%" 
          height={svgHeight}
          viewBox={`0 0 1000 ${svgHeight}`}
          preserveAspectRatio="xMidYMid meet"
          className="min-w-[800px]"
        >
          {sortedFlights.map((flight, index) => renderNode(flight, index))}
        </svg>
      </div>

      {/* Array Representation */}
      {showArrayRepresentation && sortedFlights.length > 0 && (
        <div className="bg-aviation-surface rounded-lg p-4">
          <h3 className="text-sm font-mono text-aviation-text-secondary mb-3">
            Array Representation (Level-order traversal)
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {sortedFlights.map((flight, index) => (
              <div 
                key={index}
                className={`flex-shrink-0 p-3 rounded border-2 transition-all duration-300 ${
                  index === 0 
                    ? 'bg-purple-500/20 border-purple-500' 
                    : 'bg-aviation-bg border-aviation-border'
                }`}
              >
                <div className="text-xs font-mono text-aviation-text-secondary mb-1">
                  [{index}]
                </div>
                <div className="text-sm font-mono font-bold text-aviation-text-primary">
                  {flight.flight_id}
                </div>
                <div className="text-xs font-mono text-aviation-text-secondary">
                  {flight.departure_time}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Heap Properties */}
      {showSteps && (
        <div className="text-xs text-aviation-text-secondary font-mono space-y-1 bg-aviation-surface p-4 rounded-lg">
          <div className="text-sm font-bold text-aviation-text-primary mb-2">Min Heap Properties:</div>
          <div>• Parent node ≤ Children nodes (earliest time at root)</div>
          <div>• Complete binary tree (filled left to right)</div>
          <div>• Insert: O(log n) - bubble up</div>
          <div>• Extract Min: O(log n) - bubble down</div>
          <div>• Get Min: O(1) - always at root</div>
          <div className="mt-3 text-aviation-accent">✓ Next departure is always accessible at root</div>
        </div>
      )}

      {/* Comparison indicator */}
      {comparingNodes.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500 rounded-lg p-3 text-sm font-mono text-amber-400 animate-in fade-in slide-in-from-bottom-2">
          ⚡ Comparing nodes {comparingNodes.join(' and ')}
        </div>
      )}
      
      {swappingNodes.length > 0 && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 text-sm font-mono text-red-400 animate-in fade-in slide-in-from-bottom-2">
          🔄 Swapping nodes {swappingNodes.join(' and ')}
        </div>
      )}
    </div>
  );
};
