import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Play, SkipForward, RotateCcw, TrendingDown, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ANIMATION_SPEEDS = {
  slow: 1500,
  normal: 800,
  fast: 400
};

export const AdvancedHeapVisualization = ({
  animationSpeed = 'normal',
  showSteps = false,
  stepMode = false,
  showArrayRepresentation = true
}) => {
  const [heapType, setHeapType] = useState('min');
  const [dualMode, setDualMode] = useState(false);
  const [minHeap, setMinHeap] = useState(null);
  const [maxHeap, setMaxHeap] = useState(null);
  const [heapifyData, setHeapifyData] = useState(null);
  const [currentHeapifyStep, setCurrentHeapifyStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [highlightedIndices, setHighlightedIndices] = useState([]);

  useEffect(() => {
    loadHeapData();
  }, [heapType, dualMode]);

  const loadHeapData = async () => {
    try {
      if (dualMode) {
        const res = await axios.get(`${API}/scheduler/dual-heap`);
        setMinHeap(res.data.min_heap);
        setMaxHeap(res.data.max_heap);
      } else {
        const res = await axios.get(`${API}/scheduler/heap?heap_type=${heapType}`);
        if (heapType === 'min') {
          setMinHeap({ flights: res.data.flights, type: 'min' });
          setMaxHeap(null);
        } else {
          setMaxHeap({ flights: res.data.flights, type: 'max' });
          setMinHeap(null);
        }
      }
    } catch (error) {
      console.error('Error loading heap data:', error);
      toast.error('Failed to load heap data');
    }
  };

  const startHeapify = async () => {
    try {
      const res = await axios.post(`${API}/scheduler/heapify`);
      setHeapifyData(res.data);
      setCurrentHeapifyStep(0);
      toast.success(`Heapify process: ${res.data.total_steps} steps`);
    } catch (error) {
      toast.error('Failed to start heapify');
    }
  };

  const animateHeapify = async () => {
    if (!heapifyData || isAnimating) return;
    
    setIsAnimating(true);
    const speed = ANIMATION_SPEEDS[animationSpeed];
    
    for (let i = 0; i < heapifyData.steps.length; i++) {
      setCurrentHeapifyStep(i);
      const step = heapifyData.steps[i];
      
      if (step.swapped_indices) {
        setHighlightedIndices(step.swapped_indices);
        await new Promise(resolve => setTimeout(resolve, speed));
      }
      
      await new Promise(resolve => setTimeout(resolve, speed / 2));
      setHighlightedIndices([]);
    }
    
    setIsAnimating(false);
    toast.success('Heapify complete!');
  };

  const nextHeapifyStep = () => {
    if (heapifyData && currentHeapifyStep < heapifyData.steps.length - 1) {
      setCurrentHeapifyStep(prev => prev + 1);
      const step = heapifyData.steps[currentHeapifyStep + 1];
      if (step.swapped_indices) {
        setHighlightedIndices(step.swapped_indices);
        setTimeout(() => setHighlightedIndices([]), 1000);
      }
    }
  };

  const previousHeapifyStep = () => {
    if (heapifyData && currentHeapifyStep > 0) {
      setCurrentHeapifyStep(prev => prev - 1);
    }
  };

  const resetHeapify = () => {
    setCurrentHeapifyStep(0);
    setHighlightedIndices([]);
    setIsAnimating(false);
  };

  const renderHeapTree = (flights, type) => {
    if (!flights || flights.length === 0) {
      return <div className="text-center text-aviation-text-secondary">No flights available</div>;
    }

    const maxLevels = Math.floor(Math.log2(flights.length)) + 1;
    const levels = [];
    
    for (let level = 0; level < maxLevels; level++) {
      const startIdx = Math.pow(2, level) - 1;
      const endIdx = Math.min(Math.pow(2, level + 1) - 1, flights.length);
      const nodesInLevel = [];
      
      for (let i = startIdx; i < endIdx; i++) {
        if (i < flights.length) {
          nodesInLevel.push({ flight: flights[i], index: i });
        }
      }
      
      if (nodesInLevel.length > 0) {
        levels.push(nodesInLevel);
      }
    }

    const typeColor = type === 'min' ? 'border-blue-400' : 'border-red-400';
    const typeBg = type === 'min' ? 'bg-gradient-to-br from-blue-500/30 to-blue-600/20' : 'bg-gradient-to-br from-red-500/30 to-red-600/20';
    const typeText = type === 'min' ? 'text-blue-300' : 'text-red-300';
    const lineGradient = type === 'min' ? 'url(#blueGradient)' : 'url(#redGradient)';
    const glowColor = type === 'min' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(239, 68, 68, 0.5)';

    // Enhanced layout with better spacing
    const nodeWidth = 140;
    const nodeHeight = 90;
    const baseHorizontalSpacing = 180;
    const verticalSpacing = 140;
    const svgHeight = maxLevels * verticalSpacing + nodeHeight + 100;
    const svgWidth = Math.pow(2, maxLevels - 1) * baseHorizontalSpacing + 300;

    const getNodePosition = (level, posInLevel, nodesInLevel) => {
      const totalWidth = svgWidth - 300;
      const spacingForLevel = totalWidth / Math.pow(2, level);
      const offset = spacingForLevel / 2;
      return {
        x: offset + (posInLevel * spacingForLevel) + 150,
        y: level * verticalSpacing + 80
      };
    };

    // Generate curved SVG paths with better styling
    const connections = [];
    levels.forEach((level, levelIdx) => {
      level.forEach(({ index }, posInLevel) => {
        const leftChildIdx = 2 * index + 1;
        const rightChildIdx = 2 * index + 2;
        
        const parentPos = getNodePosition(levelIdx, posInLevel, level.length);
        const nextLevel = levels[levelIdx + 1];
        
        if (leftChildIdx < flights.length && nextLevel) {
          const childPosInLevel = nextLevel.findIndex(n => n.index === leftChildIdx);
          if (childPosInLevel !== -1) {
            const childPos = getNodePosition(levelIdx + 1, childPosInLevel, nextLevel.length);
            const midY = (parentPos.y + childPos.y) / 2;
            const curve = Math.abs(parentPos.x - childPos.x) * 0.3;
            const path = `M ${parentPos.x} ${parentPos.y + nodeHeight/2} 
                         Q ${parentPos.x - curve} ${midY}, ${childPos.x} ${childPos.y - nodeHeight/2}`;
            connections.push({ path, type: 'left', highlighted: highlightedIndices.includes(index) || highlightedIndices.includes(leftChildIdx) });
          }
        }
        
        if (rightChildIdx < flights.length && nextLevel) {
          const childPosInLevel = nextLevel.findIndex(n => n.index === rightChildIdx);
          if (childPosInLevel !== -1) {
            const childPos = getNodePosition(levelIdx + 1, childPosInLevel, nextLevel.length);
            const midY = (parentPos.y + childPos.y) / 2;
            const curve = Math.abs(parentPos.x - childPos.x) * 0.3;
            const path = `M ${parentPos.x} ${parentPos.y + nodeHeight/2} 
                         Q ${parentPos.x + curve} ${midY}, ${childPos.x} ${childPos.y - nodeHeight/2}`;
            connections.push({ path, type: 'right', highlighted: highlightedIndices.includes(index) || highlightedIndices.includes(rightChildIdx) });
          }
        }
      });
    });

    return (
      <div className="relative overflow-x-auto py-12 px-8">
        {/* Enhanced SVG with gradients and better lines */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ height: svgHeight }}>
          <defs>
            {/* Gradient definitions */}
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.6" />
            </linearGradient>
            {/* Shadow filter */}
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
              <feOffset dx="0" dy="2" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Draw connection lines with curves */}
          {connections.map((conn, idx) => (
            <g key={idx}>
              {/* Glow effect for highlighted connections */}
              {conn.highlighted && (
                <path
                  d={conn.path}
                  stroke="#fbbf24"
                  strokeWidth="6"
                  fill="none"
                  opacity="0.4"
                  filter="url(#shadow)"
                />
              )}
              {/* Main connection line */}
              <path
                d={conn.path}
                stroke={conn.highlighted ? '#fbbf24' : lineGradient}
                strokeWidth={conn.highlighted ? "4" : "3"}
                fill="none"
                opacity={conn.highlighted ? "1" : "0.7"}
                strokeLinecap="round"
                style={{
                  transition: 'all 0.3s ease',
                  filter: conn.highlighted ? `drop-shadow(0 0 8px ${glowColor})` : 'none'
                }}
              />
            </g>
          ))}
        </svg>
        
        {/* Enhanced Nodes with better styling */}
        <div className="relative" style={{ minHeight: svgHeight }}>
          {levels.map((level, levelIdx) => {
            const positions = level.map((_, posInLevel) => 
              getNodePosition(levelIdx, posInLevel, level.length)
            );
            
            return (
              <div key={levelIdx} className="absolute w-full" style={{ top: `${levelIdx * verticalSpacing + 80}px` }}>
                {level.map(({ flight, index }, posInLevel) => {
                  const isHighlighted = highlightedIndices.includes(index);
                  const isRoot = index === 0;
                  const position = positions[posInLevel];
                  
                  return (
                    <div 
                      key={index} 
                      className="absolute transition-all duration-300 ease-in-out"
                      style={{ 
                        left: `${position.x}px`, 
                        transform: `translateX(-50%) ${isHighlighted ? 'scale(1.15)' : 'scale(1)'}`
                      }}
                    >
                      <div className={`relative border-3 rounded-xl p-4 transition-all duration-300 ${
                        isHighlighted ? 'bg-gradient-to-br from-yellow-500/40 to-amber-600/30 border-yellow-400 shadow-2xl' :
                        isRoot ? `${typeBg} ${typeColor} shadow-xl ring-2 ring-offset-2 ring-offset-aviation-bg ${type === 'min' ? 'ring-blue-400/50' : 'ring-red-400/50'}` :
                        `bg-gradient-to-br ${type === 'min' ? 'from-aviation-surface to-blue-900/20' : 'from-aviation-surface to-red-900/20'} ${typeColor} shadow-lg hover:shadow-xl`
                      }`} 
                      style={{ 
                        width: nodeWidth - 20,
                        boxShadow: isHighlighted 
                          ? `0 0 30px ${type === 'min' ? 'rgba(251, 191, 36, 0.6)' : 'rgba(251, 191, 36, 0.6)'}, 0 10px 25px rgba(0,0,0,0.3)` 
                          : isRoot
                          ? `0 0 20px ${glowColor}, 0 8px 20px rgba(0,0,0,0.3)`
                          : '0 4px 12px rgba(0,0,0,0.2)'
                      }}>
                        {/* Flight Info */}
                        <div className="text-sm font-mono font-bold text-aviation-text-primary text-center mb-1">
                          {flight.flight_id}
                        </div>
                        <div className={`text-xs font-mono ${typeText} text-center font-semibold`}>
                          {flight.departure_time}
                        </div>
                        <div className={`text-xs ${type === 'min' ? 'text-blue-400/70' : 'text-red-400/70'} mt-2 text-center font-mono`}>
                          Index: [{index}]
                        </div>
                        
                        {/* Root badge */}
                        {isRoot && (
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs px-3 py-1 rounded-full font-bold whitespace-nowrap shadow-lg">
                            {type === 'min' ? '⏰ Next Flight' : '📅 Latest Flight'}
                          </div>
                        )}
                        
                        {/* Level indicator */}
                        <div className={`absolute -top-2 -right-2 ${type === 'min' ? 'bg-blue-500' : 'bg-red-500'} text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-md`}>
                          L{levelIdx}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderArrayRepresentation = (flights, type) => {
    if (!flights || flights.length === 0) return null;

    const typeColor = type === 'min' ? 'border-blue-500' : 'border-red-500';

    return (
      <div className="mt-6">
        <h4 className="text-sm font-bold text-aviation-text-primary mb-3">Array Representation</h4>
        <div className="flex flex-wrap gap-2">
          {flights.map((flight, idx) => {
            const isHighlighted = highlightedIndices.includes(idx);
            const parent = Math.floor((idx - 1) / 2);
            const leftChild = 2 * idx + 1;
            const rightChild = 2 * idx + 2;
            
            return (
              <div key={idx} className="flex flex-col items-center">
                <div className={`border-2 rounded p-2 text-xs font-mono transition-all ${
                  isHighlighted ? 'bg-yellow-500/30 border-yellow-500' :
                  `bg-aviation-surface ${typeColor}`
                }`}>
                  <div className="font-bold text-aviation-text-primary">[{idx}]</div>
                  <div className="text-aviation-text-secondary">{flight.flight_id}</div>
                </div>
                {showSteps && (
                  <div className="text-xs text-aviation-text-secondary mt-1">
                    {idx > 0 && `P:${parent}`}
                    {leftChild < flights.length && ` L:${leftChild}`}
                    {rightChild < flights.length && ` R:${rightChild}`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderHeapifyAnimation = () => {
    if (!heapifyData) return null;

    const currentStep = heapifyData.steps[currentHeapifyStep];
    const flights = currentStep.array;

    return (
      <Card className="bg-aviation-surface border-aviation-border p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-aviation-text-primary">
            Heapify Process (Build Heap)
          </h3>
          <div className="flex gap-2">
            <Button onClick={previousHeapifyStep} disabled={currentHeapifyStep === 0 || isAnimating} size="sm" variant="outline">
              Previous
            </Button>
            <Button onClick={nextHeapifyStep} disabled={currentHeapifyStep >= heapifyData.steps.length - 1 || isAnimating} size="sm" variant="outline">
              Next
            </Button>
            <Button onClick={animateHeapify} disabled={isAnimating} size="sm">
              <Play className="w-4 h-4 mr-1" /> Animate
            </Button>
            <Button onClick={resetHeapify} size="sm" variant="outline">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="bg-aviation-bg border border-aviation-border rounded-lg p-4 mb-4">
          <div className="text-sm font-mono text-aviation-text-primary">
            Step {currentHeapifyStep + 1} of {heapifyData.steps.length}: {currentStep.description}
          </div>
        </div>

        {renderHeapTree(flights, 'min')}
        {renderArrayRepresentation(flights, 'min')}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-aviation-bg border border-aviation-border rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Dual Mode Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="dualMode"
              checked={dualMode}
              onChange={(e) => setDualMode(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="dualMode" className="text-sm text-aviation-text-primary">
              Dual Heap View (Min + Max)
            </label>
          </div>

          {/* Heap Type Selector (when not in dual mode) */}
          {!dualMode && (
            <div className="flex gap-2">
              <Button
                onClick={() => setHeapType('min')}
                variant={heapType === 'min' ? 'default' : 'outline'}
                size="sm"
              >
                <TrendingDown className="w-4 h-4 mr-1" /> Min Heap
              </Button>
              <Button
                onClick={() => setHeapType('max')}
                variant={heapType === 'max' ? 'default' : 'outline'}
                size="sm"
              >
                <TrendingUp className="w-4 h-4 mr-1" /> Max Heap
              </Button>
            </div>
          )}

          {/* Heapify Button */}
          <Button onClick={startHeapify} variant="outline" size="sm">
            <SkipForward className="w-4 h-4 mr-1" /> Start Heapify
          </Button>

          <Button onClick={loadHeapData} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Dual Heap View */}
      {dualMode && minHeap && maxHeap ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Min Heap */}
          <Card className="bg-aviation-surface border-blue-500 p-6">
            <h3 className="font-heading font-bold text-blue-400 mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5" /> Min Heap (Earliest Flights)
            </h3>
            {renderHeapTree(minHeap.flights, 'min')}
            {showArrayRepresentation && renderArrayRepresentation(minHeap.flights, 'min')}
          </Card>

          {/* Max Heap */}
          <Card className="bg-aviation-surface border-red-500 p-6">
            <h3 className="font-heading font-bold text-red-400 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Max Heap (Latest Flights)
            </h3>
            {renderHeapTree(maxHeap.flights, 'max')}
            {showArrayRepresentation && renderArrayRepresentation(maxHeap.flights, 'max')}
          </Card>
        </div>
      ) : (
        /* Single Heap View */
        <Card className={`bg-aviation-surface p-6 ${heapType === 'min' ? 'border-blue-500' : 'border-red-500'}`}>
          <h3 className={`font-heading font-bold mb-4 flex items-center gap-2 ${heapType === 'min' ? 'text-blue-400' : 'text-red-400'}`}>
            {heapType === 'min' ? (
              <><TrendingDown className="w-5 h-5" /> Min Heap (Earliest Flights)</>
            ) : (
              <><TrendingUp className="w-5 h-5" /> Max Heap (Latest Flights)</>
            )}
          </h3>
          {heapType === 'min' && minHeap && renderHeapTree(minHeap.flights, 'min')}
          {heapType === 'max' && maxHeap && renderHeapTree(maxHeap.flights, 'max')}
          {heapType === 'min' && minHeap && showArrayRepresentation && renderArrayRepresentation(minHeap.flights, 'min')}
          {heapType === 'max' && maxHeap && showArrayRepresentation && renderArrayRepresentation(maxHeap.flights, 'max')}
        </Card>
      )}

      {/* Heapify Animation */}
      {heapifyData && renderHeapifyAnimation()}

      {/* Educational Info */}
      {showSteps && (
        <Card className="bg-aviation-bg border border-dsa-heap rounded-lg p-4">
          <h3 className="font-heading font-bold text-dsa-heap mb-3">Heap Operations Complexity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-bold text-aviation-text-primary mb-2">Time Complexity</h4>
              <div className="text-xs font-mono text-aviation-text-secondary space-y-1">
                <div>• Insert: O(log n)</div>
                <div>• Extract Min/Max: O(log n)</div>
                <div>• Peek: O(1)</div>
                <div>• Heapify (Build): O(n)</div>
                <div>• Search: O(n)</div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-aviation-text-primary mb-2">Properties</h4>
              <div className="text-xs text-aviation-text-secondary space-y-1">
                <div>• Complete binary tree</div>
                <div>• Parent-child relationship</div>
                <div>• Min: parent ≤ children</div>
                <div>• Max: parent ≥ children</div>
                <div>• Array indices: parent=⌊(i-1)/2⌋</div>
                <div>• Left child: 2i+1, Right: 2i+2</div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
