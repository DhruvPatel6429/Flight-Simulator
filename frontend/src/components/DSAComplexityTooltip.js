import React from 'react';
import { Info, Clock, Database } from 'lucide-react';
import { Card } from './ui/card';

export const DSAComplexityTooltip = ({ dataStructure, operations, show }) => {
  if (!show) return null;

  const complexityData = {
    graph: {
      name: 'Graph (Adjacency List)',
      icon: '🗺️',
      operations: [
        { name: 'Add Vertex', time: 'O(1)', space: 'O(1)' },
        { name: 'Add Edge', time: 'O(1)', space: 'O(1)' },
        { name: 'Remove Vertex', time: 'O(V + E)', space: 'O(1)' },
        { name: 'Remove Edge', time: 'O(E)', space: 'O(1)' },
        { name: 'BFS Traversal', time: 'O(V + E)', space: 'O(V)' },
        { name: 'DFS Traversal', time: 'O(V + E)', space: 'O(V)' }
      ],
      description: 'Efficient for sparse graphs. Each vertex stores a list of adjacent vertices.'
    },
    hashtable: {
      name: 'Hash Table (Separate Chaining)',
      icon: '📦',
      operations: [
        { name: 'Insert', time: 'O(1) avg, O(n) worst', space: 'O(1)' },
        { name: 'Search', time: 'O(1) avg, O(n) worst', space: 'O(1)' },
        { name: 'Delete', time: 'O(1) avg, O(n) worst', space: 'O(1)' },
        { name: 'Hash Function', time: 'O(k)', space: 'O(1)' }
      ],
      description: 'Uses separate chaining to handle collisions. Multiple items can exist in same bucket.'
    },
    queue: {
      name: 'Circular Queue (Array-based)',
      icon: '🔄',
      operations: [
        { name: 'Enqueue', time: 'O(1)', space: 'O(1)' },
        { name: 'Dequeue', time: 'O(1)', space: 'O(1)' },
        { name: 'Peek', time: 'O(1)', space: 'O(1)' },
        { name: 'Is Empty', time: 'O(1)', space: 'O(1)' }
      ],
      description: 'FIFO (First In First Out). Uses circular array to efficiently utilize space.'
    },
    stack: {
      name: 'Stack (Array-based)',
      icon: '📚',
      operations: [
        { name: 'Push', time: 'O(1)', space: 'O(1)' },
        { name: 'Pop', time: 'O(1)', space: 'O(1)' },
        { name: 'Peek', time: 'O(1)', space: 'O(1)' },
        { name: 'Is Empty', time: 'O(1)', space: 'O(1)' }
      ],
      description: 'LIFO (Last In First Out). Used for undo operations, backtracking, and recursion.'
    },
    heap: {
      name: 'Min Heap (Binary Heap)',
      icon: '⚡',
      operations: [
        { name: 'Insert', time: 'O(log n)', space: 'O(1)' },
        { name: 'Extract Min', time: 'O(log n)', space: 'O(1)' },
        { name: 'Peek Min', time: 'O(1)', space: 'O(1)' },
        { name: 'Heapify', time: 'O(n)', space: 'O(1)' },
        { name: 'Decrease Key', time: 'O(log n)', space: 'O(1)' }
      ],
      description: 'Priority queue implementation. Parent is always smaller than children.'
    }
  };

  const data = complexityData[dataStructure];
  if (!data) return null;

  return (
    <Card className="bg-aviation-accent/10 border-aviation-accent p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{data.icon}</span>
        <div>
          <h4 className="text-sm font-bold text-aviation-accent">{data.name}</h4>
          <p className="text-xs text-aviation-text-secondary">{data.description}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-bold text-aviation-text-primary">Operation Complexities:</div>
        <div className="space-y-1">
          {data.operations.map((op, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs bg-aviation-bg/50 rounded px-2 py-1">
              <span className="text-aviation-text-secondary">{op.name}</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-400" />
                  <span className="text-blue-400 font-mono">{op.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Database className="w-3 h-3 text-green-400" />
                  <span className="text-green-400 font-mono">{op.space}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-aviation-text-secondary pt-2 border-t border-aviation-border">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-blue-400" />
          <span>Time Complexity</span>
        </div>
        <div className="flex items-center gap-1">
          <Database className="w-3 h-3 text-green-400" />
          <span>Space Complexity</span>
        </div>
      </div>
    </Card>
  );
};
