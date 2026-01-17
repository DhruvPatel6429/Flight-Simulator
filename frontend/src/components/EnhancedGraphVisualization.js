import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

cytoscape.use(dagre);

const ANIMATION_SPEEDS = {
  slow: 1500,
  normal: 800,
  fast: 400
};

export const EnhancedGraphVisualization = ({ 
  airports, 
  flights, 
  selectedNode, 
  onNodeClick,
  animationSpeed = 'normal',
  showSteps = false 
}) => {
  const cyRef = useRef(null);
  const [cy, setCy] = useState(null);
  const [traversalMode, setTraversalMode] = useState(null);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [traversalQueue, setTraversalQueue] = useState([]);

  useEffect(() => {
    if (!cyRef.current || airports.length === 0) return;

    const elements = [
      ...airports.map(airport => ({
        data: { 
          id: airport.code, 
          label: `${airport.code}\n${airport.city}`,
          name: airport.name,
          type: 'airport'
        },
        classes: 'airport-node'
      })),
      ...flights.map(flight => ({
        data: {
          id: flight.id,
          source: flight.source_code,
          target: flight.destination_code,
          label: flight.flight_id,
          departure_time: flight.departure_time,
          type: 'flight'
        },
        classes: 'flight-edge'
      }))
    ];

    const cyInstance = cytoscape({
      container: cyRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#0EA5E9',
            'label': 'data(label)',
            'color': '#F8FAFC',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-family': 'JetBrains Mono, monospace',
            'font-size': '12px',
            'width': '70px',
            'height': '70px',
            'border-width': '3px',
            'border-color': '#0284C7',
            'text-wrap': 'wrap',
            'text-max-width': '90px',
            'transition-property': 'background-color, border-color, border-width',
            'transition-duration': '0.3s'
          }
        },
        {
          selector: 'node.animating',
          style: {
            'background-color': '#F59E0B',
            'border-color': '#F59E0B',
            'border-width': '5px'
          }
        },
        {
          selector: 'node.visited',
          style: {
            'background-color': '#10B981',
            'border-color': '#059669'
          }
        },
        {
          selector: 'node.current',
          style: {
            'background-color': '#F59E0B',
            'border-color': '#D97706',
            'border-width': '5px'
          }
        },
        {
          selector: 'node:selected',
          style: {
            'background-color': '#8B5CF6',
            'border-color': '#7C3AED',
            'border-width': '4px'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#475569',
            'target-arrow-color': '#475569',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'color': '#94A3B8',
            'text-background-color': '#0B1120',
            'text-background-opacity': 0.9,
            'text-background-padding': '4px',
            'font-family': 'JetBrains Mono, monospace',
            'font-size': '11px',
            'font-weight': 'bold',
            'transition-property': 'line-color, target-arrow-color, width',
            'transition-duration': '0.3s'
          }
        },
        {
          selector: 'edge.highlighted',
          style: {
            'line-color': '#F59E0B',
            'target-arrow-color': '#F59E0B',
            'width': 5
          }
        },
        {
          selector: 'edge.traversed',
          style: {
            'line-color': '#10B981',
            'target-arrow-color': '#10B981',
            'width': 4
          }
        },
        {
          selector: 'edge:selected',
          style: {
            'line-color': '#8B5CF6',
            'target-arrow-color': '#8B5CF6',
            'width': 4
          }
        }
      ],
      layout: {
        name: 'dagre',
        rankDir: 'LR',
        nodeSep: 120,
        rankSep: 180,
        animate: true,
        animationDuration: 500
      }
    });

    // Node click handler
    cyInstance.on('tap', 'node', (evt) => {
      const node = evt.target;
      if (onNodeClick) {
        onNodeClick(node.data('id'));
      }
    });

    // Edge hover handler
    cyInstance.on('mouseover', 'edge', (evt) => {
      const edge = evt.target;
      edge.addClass('highlighted');
    });

    cyInstance.on('mouseout', 'edge', (evt) => {
      const edge = evt.target;
      if (!edge.hasClass('traversed')) {
        edge.removeClass('highlighted');
      }
    });

    setCy(cyInstance);

    return () => {
      cyInstance.destroy();
    };
  }, [airports, flights]);

  useEffect(() => {
    if (cy && selectedNode) {
      cy.nodes().removeClass('selected');
      cy.$(`#${selectedNode}`).addClass('selected');
      
      // Highlight connected edges
      cy.edges().removeClass('highlighted');
      const connectedEdges = cy.$(`#${selectedNode}`).connectedEdges();
      connectedEdges.forEach(edge => {
        if (!edge.hasClass('traversed')) {
          edge.addClass('highlighted');
        }
      });
    }
  }, [cy, selectedNode]);

  const performBFS = async (startNode) => {
    if (!cy || !startNode) return;
    
    setTraversalMode('bfs');
    cy.nodes().removeClass('visited current animating');
    cy.edges().removeClass('traversed highlighted');
    
    const visited = new Set();
    const queue = [startNode];
    const visitOrder = [];
    
    while (queue.length > 0) {
      const current = queue.shift();
      
      if (visited.has(current)) continue;
      
      visited.add(current);
      visitOrder.push(current);
      setVisitedNodes([...visitOrder]);
      setCurrentNode(current);
      setTraversalQueue([...queue]);
      
      // Animate current node
      cy.$(`#${current}`).addClass('current animating');
      await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEEDS[animationSpeed]));
      
      // Get neighbors
      const neighbors = cy.$(`#${current}`).neighborhood('node');
      const connectedEdges = cy.$(`#${current}`).connectedEdges();
      
      neighbors.forEach((neighbor) => {
        const neighborId = neighbor.data('id');
        if (!visited.has(neighborId) && !queue.includes(neighborId)) {
          queue.push(neighborId);
          
          // Highlight edge to neighbor
          connectedEdges.forEach(edge => {
            if (edge.source().id() === current && edge.target().id() === neighborId ||
                edge.target().id() === current && edge.source().id() === neighborId) {
              edge.addClass('traversed');
            }
          });
        }
      });
      
      cy.$(`#${current}`).removeClass('current animating').addClass('visited');
      await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEEDS[animationSpeed] / 2));
    }
    
    setTraversalMode(null);
    setCurrentNode(null);
    setTraversalQueue([]);
  };

  const performDFS = async (startNode) => {
    if (!cy || !startNode) return;
    
    setTraversalMode('dfs');
    cy.nodes().removeClass('visited current animating');
    cy.edges().removeClass('traversed highlighted');
    
    const visited = new Set();
    const visitOrder = [];
    
    const dfsRecursive = async (node) => {
      if (visited.has(node)) return;
      
      visited.add(node);
      visitOrder.push(node);
      setVisitedNodes([...visitOrder]);
      setCurrentNode(node);
      
      // Animate current node
      cy.$(`#${node}`).addClass('current animating');
      await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEEDS[animationSpeed]));
      
      // Get neighbors
      const neighbors = cy.$(`#${node}`).neighborhood('node');
      const connectedEdges = cy.$(`#${node}`).connectedEdges();
      
      for (const neighbor of neighbors) {
        const neighborId = neighbor.data('id');
        if (!visited.has(neighborId)) {
          // Highlight edge to neighbor
          connectedEdges.forEach(edge => {
            if (edge.source().id() === node && edge.target().id() === neighborId ||
                edge.target().id() === node && edge.source().id() === neighborId) {
              edge.addClass('traversed');
            }
          });
          
          await dfsRecursive(neighborId);
        }
      }
      
      cy.$(`#${node}`).removeClass('current animating').addClass('visited');
      await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEEDS[animationSpeed] / 2));
    };
    
    await dfsRecursive(startNode);
    setTraversalMode(null);
    setCurrentNode(null);
  };

  const resetTraversal = () => {
    if (cy) {
      cy.nodes().removeClass('visited current animating');
      cy.edges().removeClass('traversed highlighted');
    }
    setVisitedNodes([]);
    setCurrentNode(null);
    setTraversalQueue([]);
    setTraversalMode(null);
  };

  if (airports.length === 0) {
    return (
      <div className="text-center py-12 text-aviation-text-secondary" data-testid="enhanced-graph">
        <div className="text-6xl mb-4">✈️</div>
        <div className="text-lg font-mono">No airports in network</div>
        <div className="text-sm mt-2">Add airports to visualize the graph</div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="enhanced-graph">
      {/* Traversal Controls */}
      {airports.length > 0 && selectedNode && (
        <div className="flex gap-3 items-center flex-wrap">
          <button
            onClick={() => performBFS(selectedNode)}
            disabled={traversalMode !== null}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-mono text-sm transition-colors"
          >
            🔍 BFS from {selectedNode}
          </button>
          <button
            onClick={() => performDFS(selectedNode)}
            disabled={traversalMode !== null}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-mono text-sm transition-colors"
          >
            🌳 DFS from {selectedNode}
          </button>
          <button
            onClick={resetTraversal}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-mono text-sm transition-colors"
          >
            🔄 Reset
          </button>
        </div>
      )}

      {/* Traversal Info */}
      {traversalMode && (
        <div className="bg-aviation-surface border border-aviation-accent rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
          <div className="font-mono text-sm space-y-2">
            <div className="text-aviation-accent font-bold">
              {traversalMode === 'bfs' ? '🔍 Breadth-First Search' : '🌳 Depth-First Search'} in progress...
            </div>
            <div className="text-aviation-text-secondary">
              Current: <span className="text-aviation-accent font-bold">{currentNode || 'None'}</span>
            </div>
            <div className="text-aviation-text-secondary">
              Visited: <span className="text-green-400 font-bold">{visitedNodes.join(' → ')}</span>
            </div>
            {traversalMode === 'bfs' && traversalQueue.length > 0 && (
              <div className="text-aviation-text-secondary">
                Queue: <span className="text-blue-400 font-bold">[{traversalQueue.join(', ')}]</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Graph Canvas */}
      <div 
        ref={cyRef} 
        className="cytoscape-container w-full h-full min-h-[600px] bg-aviation-bg rounded-lg border-2 border-aviation-border"
        data-testid="graph-canvas"
      />

      {/* Graph legend */}
      <div className="flex gap-4 text-xs font-mono flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#0EA5E9] border-2 border-[#0284C7] rounded"></div>
          <span className="text-aviation-text-secondary">Airport Node</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#8B5CF6] border-2 border-[#7C3AED] rounded"></div>
          <span className="text-aviation-text-secondary">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#10B981] border-2 border-[#059669] rounded"></div>
          <span className="text-aviation-text-secondary">Visited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#F59E0B] border-2 border-[#D97706] rounded"></div>
          <span className="text-aviation-text-secondary">Current</span>
        </div>
      </div>

      {/* Graph properties */}
      {showSteps && (
        <div className="text-xs text-aviation-text-secondary font-mono space-y-1 bg-aviation-surface p-4 rounded-lg">
          <div className="text-sm font-bold text-aviation-text-primary mb-2">Graph Properties (Adjacency List):</div>
          <div>• Vertices (Airports): {airports.length}</div>
          <div>• Edges (Routes): {flights.length}</div>
          <div>• Add Vertex: O(1)</div>
          <div>• Add Edge: O(1)</div>
          <div>• BFS/DFS Traversal: O(V + E)</div>
          <div className="mt-3 text-aviation-accent">✓ Click on an airport to highlight its connections</div>
        </div>
      )}
    </div>
  );
};
