import React from 'react';

export const HeapVisualization = ({ flights }) => {
  const sortedFlights = [...flights].sort((a, b) => a.departure_time.localeCompare(b.departure_time));
  
  const getNodePosition = (index, level, totalAtLevel) => {
    const svgWidth = 800;
    const nodeSpacing = svgWidth / (totalAtLevel + 1);
    const x = (index % totalAtLevel + 1) * nodeSpacing;
    const y = level * 120 + 60;
    return { x, y };
  };
  
  const renderNode = (flight, index, level) => {
    if (index >= sortedFlights.length) return null;
    
    const totalAtLevel = Math.pow(2, level);
    const indexInLevel = index - (Math.pow(2, level) - 1);
    const pos = getNodePosition(indexInLevel, level, totalAtLevel);
    
    const leftChildIndex = index * 2 + 1;
    const rightChildIndex = index * 2 + 2;
    
    return (
      <g key={index}>
        {/* Lines to children */}
        {leftChildIndex < sortedFlights.length && (() => {
          const leftChildLevel = level + 1;
          const leftTotalAtLevel = Math.pow(2, leftChildLevel);
          const leftIndexInLevel = leftChildIndex - (Math.pow(2, leftChildLevel) - 1);
          const leftPos = getNodePosition(leftIndexInLevel, leftChildLevel, leftTotalAtLevel);
          return (
            <line
              x1={pos.x}
              y1={pos.y}
              x2={leftPos.x}
              y2={leftPos.y}
              stroke="#475569"
              strokeWidth="2"
            />
          );
        })()}
        {rightChildIndex < sortedFlights.length && (() => {
          const rightChildLevel = level + 1;
          const rightTotalAtLevel = Math.pow(2, rightChildLevel);
          const rightIndexInLevel = rightChildIndex - (Math.pow(2, rightChildLevel) - 1);
          const rightPos = getNodePosition(rightIndexInLevel, rightChildLevel, rightTotalAtLevel);
          return (
            <line
              x1={pos.x}
              y1={pos.y}
              x2={rightPos.x}
              y2={rightPos.y}
              stroke="#475569"
              strokeWidth="2"
            />
          );
        })()}
        
        {/* Node */}
        <g transform={`translate(${pos.x}, ${pos.y})`}>
          <circle
            r="35"
            fill="#8B5CF6"
            stroke="#7C3AED"
            strokeWidth="3"
            className="heap-node"
          />
          <text
            textAnchor="middle"
            dy="-8"
            fill="#F8FAFC"
            fontSize="14"
            fontFamily="JetBrains Mono, monospace"
            fontWeight="bold"
          >
            {flight.flight_id}
          </text>
          <text
            textAnchor="middle"
            dy="12"
            fill="#E9D5FF"
            fontSize="11"
            fontFamily="JetBrains Mono, monospace"
          >
            {flight.departure_time}
          </text>
        </g>
      </g>
    );
  };
  
  if (sortedFlights.length === 0) {
    return (
      <div className="text-center py-12 text-aviation-text-secondary" data-testid="heap-visualization">
        <div className="text-4xl mb-2">⏰</div>
        <div>No flights scheduled</div>
      </div>
    );
  }
  
  const maxLevels = Math.ceil(Math.log2(sortedFlights.length + 1));
  const svgHeight = maxLevels * 120 + 100;
  
  return (
    <div className="w-full overflow-x-auto" data-testid="heap-visualization">
      <svg 
        width="100%" 
        height={svgHeight}
        viewBox={`0 0 800 ${svgHeight}`}
        preserveAspectRatio="xMidYMid meet"
        className="min-w-[600px]"
      >
        {sortedFlights.map((flight, index) => {
          const level = Math.floor(Math.log2(index + 1));
          return renderNode(flight, index, level);
        })}
      </svg>
    </div>
  );
};
