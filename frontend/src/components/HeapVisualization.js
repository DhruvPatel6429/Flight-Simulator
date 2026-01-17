import React from 'react';

export const HeapVisualization = ({ flights }) => {
  const sortedFlights = [...flights].sort((a, b) => a.departure_time.localeCompare(b.departure_time));
  
  const getNodePosition = (index, level, totalAtLevel) => {
    const levelWidth = 100;
    const nodeWidth = levelWidth / (totalAtLevel + 1);
    const position = (index % totalAtLevel + 1) * nodeWidth;
    return { x: position, y: level * 100 + 50 };
  };
  
  const renderNode = (flight, index, level) => {
    if (index >= sortedFlights.length) return null;
    
    const totalAtLevel = Math.pow(2, level);
    const indexInLevel = index - (Math.pow(2, level) - 1);
    const pos = getNodePosition(indexInLevel, level, totalAtLevel);
    
    return (
      <g key={index}>
        {/* Lines to children */}
        {index * 2 + 1 < sortedFlights.length && (
          <line
            x1={`${pos.x}%`}
            y1={pos.y}
            x2={`${getNodePosition((index * 2 + 1) - (Math.pow(2, level + 1) - 1), level + 1, Math.pow(2, level + 1)).x}%`}
            y2={pos.y + 100}
            stroke="#475569"
            strokeWidth="2"
          />
        )}
        {index * 2 + 2 < sortedFlights.length && (
          <line
            x1={`${pos.x}%`}
            y1={pos.y}
            x2={`${getNodePosition((index * 2 + 2) - (Math.pow(2, level + 1) - 1), level + 1, Math.pow(2, level + 1)).x}%`}
            y2={pos.y + 100}
            stroke="#475569"
            strokeWidth="2"
          />
        )}
        
        {/* Node */}
        <g transform={`translate(${pos.x}%, ${pos.y})`}>
          <circle
            r="40"
            fill="#8B5CF6"
            stroke="#7C3AED"
            strokeWidth="3"
            className="heap-node"
          />
          <text
            textAnchor="middle"
            dy="-10"
            fill="#F8FAFC"
            fontSize="12"
            fontFamily="JetBrains Mono, monospace"
            fontWeight="bold"
          >
            {flight.flight_id}
          </text>
          <text
            textAnchor="middle"
            dy="10"
            fill="#E9D5FF"
            fontSize="10"
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
  const svgHeight = maxLevels * 100 + 100;
  
  return (
    <div className="w-full overflow-x-auto" data-testid="heap-visualization">
      <svg 
        width="100%" 
        height={svgHeight}
        viewBox="0 0 100 100"
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
