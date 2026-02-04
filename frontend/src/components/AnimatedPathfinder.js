import React, { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import { Play, Pause, RotateCcw, Zap, Info } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ANIMATION_SPEEDS = {
  slow: 1000,
  normal: 500,
  fast: 200
};

export const AnimatedPathfinder = ({ airports, flights, animationSpeed = 'normal', showEducational = false, stepMode = false }) => {
  const [startAirport, setStartAirport] = useState('');
  const [endAirport, setEndAirport] = useState('');
  const [algorithm, setAlgorithm] = useState('bfs');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [path, setPath] = useState([]);
  const [queue, setQueue] = useState([]);
  const [adjacencyList, setAdjacencyList] = useState({});
  const [allSteps, setAllSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const animationRef = useRef(null);
  const isPausedRef = useRef(false);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    isAnimatingRef.current = isAnimating;
  }, [isAnimating]);

  useEffect(() => {
    // Build adjacency list
    const adjList = {};
    airports.forEach(airport => {
      adjList[airport.code] = [];
    });
    flights.forEach(flight => {
      if (adjList[flight.source_code]) {
        adjList[flight.source_code].push(flight.destination_code);
      }
      if (adjList[flight.destination_code]) {
        adjList[flight.destination_code].push(flight.source_code);
      }
    });
    setAdjacencyList(adjList);
  }, [airports, flights]);

  const resetAnimation = () => {
    setIsAnimating(false);
    setIsPaused(false);
    setCurrentStep(0);
    setVisitedNodes([]);
    setCurrentNode(null);
    setPath([]);
    setQueue([]);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
  };

  const startAnimation = async () => {
    if (!startAirport || !endAirport) {
      toast.error('Please select both start and end airports');
      return;
    }

    if (startAirport === endAirport) {
      toast.error('Start and end airports must be different');
      return;
    }

    resetAnimation();
    setIsAnimating(true);

    if (algorithm === 'bfs') {
      await animateBFS();
    } else {
      await animateDFS();
    }
  };

  const animateBFS = async () => {
    const visited = new Set([startAirport]);
    const q = [[startAirport, [startAirport]]];
    const visitOrder = [];
    let foundPath = null;

    while (q.length > 0) {
      const [current, currentPath] = q.shift();
      visitOrder.push({ node: current, queue: [...q.map(item => item[0])], path: [...currentPath] });

      if (current === endAirport) {
        foundPath = currentPath;
        break;
      }

      const neighbors = adjacencyList[current] || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          q.push([neighbor, [...currentPath, neighbor]]);
        }
      }
    }

    // Animate the steps
    for (let i = 0; i < visitOrder.length && isAnimating; i++) {
      if (isPaused) {
        await new Promise(resolve => {
          const checkPause = setInterval(() => {
            if (!isPaused) {
              clearInterval(checkPause);
              resolve();
            }
          }, 100);
        });
      }

      await new Promise(resolve => {
        animationRef.current = setTimeout(() => {
          setCurrentStep(i + 1);
          setCurrentNode(visitOrder[i].node);
          setQueue(visitOrder[i].queue);
          setVisitedNodes(prev => [...prev, visitOrder[i].node]);
          if (visitOrder[i].node === endAirport) {
            setPath(visitOrder[i].path);
            toast.success(`Path found! ${visitOrder[i].path.length - 1} hops using BFS`);
          }
          resolve();
        }, ANIMATION_SPEEDS[animationSpeed]);
      });
    }

    if (!foundPath) {
      toast.warning('No path found between selected airports');
    }
    setIsAnimating(false);
  };

  const animateDFS = async () => {
    const visited = new Set();
    const visitOrder = [];
    let foundPath = null;

    const dfs = (current, currentPath) => {
      if (foundPath) return;
      
      visited.add(current);
      visitOrder.push({ node: current, path: [...currentPath] });

      if (current === endAirport) {
        foundPath = currentPath;
        return;
      }

      const neighbors = adjacencyList[current] || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, [...currentPath, neighbor]);
        }
      }
    };

    dfs(startAirport, [startAirport]);

    // Animate the steps
    for (let i = 0; i < visitOrder.length && isAnimating; i++) {
      if (isPaused) {
        await new Promise(resolve => {
          const checkPause = setInterval(() => {
            if (!isPaused) {
              clearInterval(checkPause);
              resolve();
            }
          }, 100);
        });
      }

      await new Promise(resolve => {
        animationRef.current = setTimeout(() => {
          setCurrentStep(i + 1);
          setCurrentNode(visitOrder[i].node);
          setVisitedNodes(prev => [...prev, visitOrder[i].node]);
          if (visitOrder[i].node === endAirport) {
            setPath(visitOrder[i].path);
            toast.success(`Path found! ${visitOrder[i].path.length - 1} hops using DFS`);
          }
          resolve();
        }, ANIMATION_SPEEDS[animationSpeed]);
      });
    }

    if (!foundPath) {
      toast.warning('No path found between selected airports');
    }
    setIsAnimating(false);
  };

  return (
    <Card className="bg-aviation-surface border-aviation-border p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-heading font-bold text-aviation-text-primary mb-1">
              🎯 Animated Pathfinding
            </h3>
            <p className="text-sm text-aviation-text-secondary">
              Watch BFS and DFS algorithms find paths in real-time
            </p>
          </div>
          {showEducational && (
            <div className="flex items-center gap-2 px-3 py-2 bg-aviation-accent/10 border border-aviation-accent rounded-lg">
              <Info className="w-4 h-4 text-aviation-accent" />
              <span className="text-xs text-aviation-accent font-mono">
                {algorithm === 'bfs' ? 'O(V + E) Time' : 'O(V + E) Time'}
              </span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-aviation-text-secondary mb-2 block">Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              disabled={isAnimating}
              className="w-full h-10 px-3 bg-aviation-bg border border-aviation-border text-aviation-text-primary rounded"
            >
              <option value="bfs">BFS (Breadth-First)</option>
              <option value="dfs">DFS (Depth-First)</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-aviation-text-secondary mb-2 block">Start Airport</label>
            <select
              value={startAirport}
              onChange={(e) => setStartAirport(e.target.value)}
              disabled={isAnimating}
              className="w-full h-10 px-3 bg-aviation-bg border border-aviation-border text-aviation-text-primary rounded"
            >
              <option value="">Select Start</option>
              {airports.map(a => (
                <option key={a.code} value={a.code}>
                  {a.code} - {a.city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-aviation-text-secondary mb-2 block">End Airport</label>
            <select
              value={endAirport}
              onChange={(e) => setEndAirport(e.target.value)}
              disabled={isAnimating}
              className="w-full h-10 px-3 bg-aviation-bg border border-aviation-border text-aviation-text-primary rounded"
            >
              <option value="">Select End</option>
              {airports.map(a => (
                <option key={a.code} value={a.code}>
                  {a.code} - {a.city}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            {!isAnimating ? (
              <Button
                onClick={startAnimation}
                disabled={!startAirport || !endAirport}
                className="flex-1 bg-dsa-graph hover:bg-dsa-graph/80"
              >
                <Play className="w-4 h-4 mr-2" />
                Start
              </Button>
            ) : (
              <Button
                onClick={() => setIsPaused(!isPaused)}
                className="flex-1 bg-aviation-accent hover:bg-aviation-accent/80"
              >
                {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
            )}
            <Button
              onClick={resetAnimation}
              variant="outline"
              className="border-aviation-border"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Visited Nodes */}
          <Card className="bg-aviation-bg border-aviation-border p-4">
            <h4 className="text-sm font-bold text-aviation-text-primary mb-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Visited Nodes ({visitedNodes.length})
            </h4>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {visitedNodes.map((node, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1 bg-green-500/20 border border-green-500 rounded text-sm font-mono text-green-400"
                >
                  {node}
                </div>
              ))}
              {visitedNodes.length === 0 && (
                <div className="text-xs text-aviation-text-secondary">No nodes visited yet</div>
              )}
            </div>
          </Card>

          {/* Current Node & Queue */}
          <Card className="bg-aviation-bg border-aviation-border p-4">
            <h4 className="text-sm font-bold text-aviation-text-primary mb-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              Current Node & Queue
            </h4>
            {currentNode && (
              <div className="mb-3">
                <div className="text-xs text-aviation-text-secondary mb-1">Current:</div>
                <div className="px-4 py-2 bg-orange-500/20 border-2 border-orange-500 rounded text-lg font-mono text-orange-400 font-bold text-center">
                  {currentNode}
                </div>
              </div>
            )}
            {algorithm === 'bfs' && queue.length > 0 && (
              <div>
                <div className="text-xs text-aviation-text-secondary mb-1">Queue:</div>
                <div className="flex flex-wrap gap-2">
                  {queue.map((node, idx) => (
                    <div key={idx} className="px-2 py-1 bg-blue-500/20 border border-blue-500 rounded text-xs font-mono text-blue-400">
                      {node}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Final Path */}
          <Card className="bg-aviation-bg border-aviation-border p-4">
            <h4 className="text-sm font-bold text-aviation-text-primary mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-aviation-accent" />
              Final Path ({path.length > 0 ? path.length - 1 : 0} hops)
            </h4>
            <div className="space-y-2">
              {path.length > 0 ? (
                path.map((node, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-aviation-accent/20 border border-aviation-accent rounded text-sm font-mono text-aviation-accent font-bold">
                      {node}
                    </div>
                    {idx < path.length - 1 && (
                      <div className="text-aviation-accent">→</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-xs text-aviation-text-secondary">Path will appear here</div>
              )}
            </div>
          </Card>
        </div>

        {/* Stats */}
        {isAnimating && (
          <div className="flex items-center justify-between p-4 bg-aviation-bg border border-aviation-border rounded-lg">
            <div className="text-sm text-aviation-text-secondary">
              Step <span className="text-aviation-text-primary font-bold">{currentStep}</span>
            </div>
            <div className="text-sm text-aviation-text-secondary">
              Algorithm: <span className="text-aviation-accent font-bold">{algorithm.toUpperCase()}</span>
            </div>
            <div className="text-sm text-aviation-text-secondary">
              Speed: <span className="text-aviation-text-primary font-bold">{animationSpeed}</span>
            </div>
          </div>
        )}

        {/* Educational Info */}
        {showEducational && !isAnimating && (
          <Card className="bg-aviation-accent/5 border-aviation-accent p-4">
            <h4 className="text-sm font-bold text-aviation-accent mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Algorithm Explanation
            </h4>
            {algorithm === 'bfs' ? (
              <div className="text-sm text-aviation-text-secondary space-y-1">
                <p><strong className="text-aviation-text-primary">BFS (Breadth-First Search):</strong></p>
                <p>• Explores nodes level by level</p>
                <p>• Uses a queue (FIFO) data structure</p>
                <p>• Guarantees shortest path in unweighted graphs</p>
                <p>• Time Complexity: O(V + E)</p>
                <p>• Space Complexity: O(V)</p>
              </div>
            ) : (
              <div className="text-sm text-aviation-text-secondary space-y-1">
                <p><strong className="text-aviation-text-primary">DFS (Depth-First Search):</strong></p>
                <p>• Explores as far as possible along each branch</p>
                <p>• Uses a stack (recursion or explicit) data structure</p>
                <p>• Does not guarantee shortest path</p>
                <p>• Time Complexity: O(V + E)</p>
                <p>• Space Complexity: O(V)</p>
              </div>
            )}
          </Card>
        )}
      </div>
    </Card>
  );
};
