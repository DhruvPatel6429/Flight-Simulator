import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const PathfindingVisualizer = ({ airports }) => {
  const [startAirport, setStartAirport] = useState('');
  const [endAirport, setEndAirport] = useState('');
  const [bfsPath, setBfsPath] = useState(null);
  const [dfsPath, setDfsPath] = useState(null);
  const [loading, setLoading] = useState(false);

  const findPaths = async () => {
    if (!startAirport || !endAirport) {
      toast.error('Please select both start and end airports');
      return;
    }

    if (startAirport === endAirport) {
      toast.error('Start and end airports must be different');
      return;
    }

    setLoading(true);
    setBfsPath(null);
    setDfsPath(null);

    try {
      const [bfsRes, dfsRes] = await Promise.all([
        axios.get(`${API}/graph/bfs/${startAirport}/${endAirport}`),
        axios.get(`${API}/graph/dfs/${startAirport}/${endAirport}`)
      ]);

      setBfsPath(bfsRes.data);
      setDfsPath(dfsRes.data);

      if (bfsRes.data.path.length === 0) {
        toast.warning('No path found between the selected airports');
      } else {
        toast.success(`Path found! BFS: ${bfsRes.data.hops} hops, DFS: ${dfsRes.data.hops} hops`);
      }
    } catch (error) {
      toast.error('Pathfinding failed: ' + (error.response?.data?.detail || error.message));
    }

    setLoading(false);
  };

  return (
    <Card className="bg-aviation-surface border-aviation-border p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-heading font-bold text-aviation-text-primary mb-2">
            🔍 Pathfinding Algorithms
          </h3>
          <p className="text-sm text-aviation-text-secondary">
            Find routes between airports using BFS (Breadth-First Search) and DFS (Depth-First Search) algorithms
          </p>
        </div>

        {/* Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-aviation-text-secondary mb-2 block">Start Airport</label>
            <select
              value={startAirport}
              onChange={(e) => setStartAirport(e.target.value)}
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

          <div className="flex items-end">
            <Button
              onClick={findPaths}
              disabled={loading || !startAirport || !endAirport}
              className="w-full bg-dsa-graph hover:bg-dsa-graph/80"
            >
              {loading ? 'Finding Paths...' : 'Find Paths'}
            </Button>
          </div>
        </div>

        {/* Results */}
        {(bfsPath || dfsPath) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* BFS Result */}
            {bfsPath && (
              <Card className="bg-aviation-bg border-2 border-dsa-graph p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-dsa-graph rounded-full"></div>
                  <h4 className="font-heading font-bold text-dsa-graph">BFS (Breadth-First Search)</h4>
                </div>
                {bfsPath.path.length > 0 ? (
                  <>
                    <div className="text-sm text-aviation-text-secondary mb-2">
                      Shortest Path • {bfsPath.hops} hops
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {bfsPath.path.map((code, idx) => (
                        <React.Fragment key={idx}>
                          <div className="px-3 py-2 bg-dsa-graph/20 border border-dsa-graph rounded font-mono text-sm text-dsa-graph font-bold">
                            {code}
                          </div>
                          {idx < bfsPath.path.length - 1 && (
                            <div className="flex items-center text-dsa-graph text-xl">→</div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="mt-3 p-2 bg-aviation-surface rounded text-xs text-aviation-text-secondary">
                      <strong>Algorithm:</strong> Explores level by level, guarantees shortest path in unweighted graphs
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-aviation-text-secondary">No path found</div>
                )}
              </Card>
            )}

            {/* DFS Result */}
            {dfsPath && (
              <Card className="bg-aviation-bg border-2 border-dsa-heap p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-dsa-heap rounded-full"></div>
                  <h4 className="font-heading font-bold text-dsa-heap">DFS (Depth-First Search)</h4>
                </div>
                {dfsPath.path.length > 0 ? (
                  <>
                    <div className="text-sm text-aviation-text-secondary mb-2">
                      Found Path • {dfsPath.hops} hops
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {dfsPath.path.map((code, idx) => (
                        <React.Fragment key={idx}>
                          <div className="px-3 py-2 bg-dsa-heap/20 border border-dsa-heap rounded font-mono text-sm text-dsa-heap font-bold">
                            {code}
                          </div>
                          {idx < dfsPath.path.length - 1 && (
                            <div className="flex items-center text-dsa-heap text-xl">→</div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="mt-3 p-2 bg-aviation-surface rounded text-xs text-aviation-text-secondary">
                      <strong>Algorithm:</strong> Explores as deep as possible before backtracking, may not find shortest path
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-aviation-text-secondary">No path found</div>
                )}
              </Card>
            )}
          </div>
        )}

        {/* Complexity Info */}
        <div className="p-4 bg-aviation-bg border border-aviation-border rounded-lg text-xs font-mono text-aviation-text-secondary space-y-1">
          <div className="font-bold text-aviation-text-primary mb-2">Time & Space Complexity:</div>
          <div>• BFS: O(V + E) time, O(V) space - Best for shortest path</div>
          <div>• DFS: O(V + E) time, O(V) space - Memory efficient, explores depth first</div>
          <div className="text-aviation-accent mt-2">Where V = vertices (airports), E = edges (routes)</div>
        </div>
      </div>
    </Card>
  );
};
