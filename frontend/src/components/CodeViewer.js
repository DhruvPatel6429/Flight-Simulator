import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Code, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export const CodeViewer = ({ algorithm, language = 'c' }) => {
  const [copied, setCopied] = useState(false);
  const [selectedLang, setSelectedLang] = useState(language);

  const codeSnippets = {
    bfs: {
      c: `#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#define MAX 100

// Queue structure for BFS
typedef struct {
    int items[MAX];
    int front, rear;
} Queue;

void initQueue(Queue* q) {
    q->front = -1;
    q->rear = -1;
}

bool isEmpty(Queue* q) {
    return q->front == -1;
}

void enqueue(Queue* q, int value) {
    if (q->front == -1) q->front = 0;
    q->rear++;
    q->items[q->rear] = value;
}

int dequeue(Queue* q) {
    int item = q->items[q->front];
    q->front++;
    if (q->front > q->rear) {
        q->front = q->rear = -1;
    }
    return item;
}

// BFS implementation
void bfs(int graph[MAX][MAX], int n, int start) {
    bool visited[MAX] = {false};
    Queue q;
    initQueue(&q);
    
    visited[start] = true;
    enqueue(&q, start);
    
    printf("BFS Traversal: ");
    while (!isEmpty(&q)) {
        int current = dequeue(&q);
        printf("%d ", current);
        
        for (int i = 0; i < n; i++) {
            if (graph[current][i] && !visited[i]) {
                visited[i] = true;
                enqueue(&q, i);
            }
        }
    }
    printf("\\n");
}`,
      python: `def bfs(graph, start, end):
    """Breadth-First Search implementation"""
    visited = set([start])
    queue = [(start, [start])]
    
    while queue:
        current, path = queue.pop(0)
        
        if current == end:
            return path
        
        for neighbor in graph[current]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))
    
    return []  # No path found`,
      javascript: `function bfs(graph, start, end) {
  // Breadth-First Search implementation
  const visited = new Set([start]);
  const queue = [[start, [start]]];
  
  while (queue.length > 0) {
    const [current, path] = queue.shift();
    
    if (current === end) {
      return path;
    }
    
    for (const neighbor of graph[current] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([neighbor, [...path, neighbor]]);
      }
    }
  }
  
  return [];  // No path found
}`
    },
    dfs: {
      python: `def dfs(graph, start, end):
    """Depth-First Search implementation"""
    visited = set()
    
    def dfs_helper(current, path):
        if current == end:
            return path
        
        visited.add(current)
        
        for neighbor in graph[current]:
            if neighbor not in visited:
                result = dfs_helper(neighbor, path + [neighbor])
                if result:
                    return result
        
        return None
    
    result = dfs_helper(start, [start])
    return result if result else []`,
      javascript: `function dfs(graph, start, end) {
  // Depth-First Search implementation
  const visited = new Set();
  
  function dfsHelper(current, path) {
    if (current === end) {
      return path;
    }
    
    visited.add(current);
    
    for (const neighbor of graph[current] || []) {
      if (!visited.has(neighbor)) {
        const result = dfsHelper(neighbor, [...path, neighbor]);
        if (result) {
          return result;
        }
      }
    }
    
    return null;
  }
  
  const result = dfsHelper(start, [start]);
  return result || [];
}`
    },
    hashtable: {
      python: `class HashTable:
    def __init__(self, size=10):
        self.size = size
        self.table = [[] for _ in range(size)]
    
    def hash_function(self, key):
        """Custom hash function"""
        hash_val = 0
        for char in str(key):
            hash_val = (hash_val * 31 + ord(char)) % self.size
        return hash_val
    
    def insert(self, key, value):
        """Insert with separate chaining"""
        index = self.hash_function(key)
        # Check if key exists
        for i, (k, v) in enumerate(self.table[index]):
            if k == key:
                self.table[index][i] = (key, value)
                return
        # Add new entry
        self.table[index].append((key, value))
    
    def search(self, key):
        """Search for a key"""
        index = self.hash_function(key)
        for k, v in self.table[index]:
            if k == key:
                return v
        return None`,
      javascript: `class HashTable {
  constructor(size = 10) {
    this.size = size;
    this.table = Array.from({ length: size }, () => []);
  }
  
  hashFunction(key) {
    // Custom hash function
    let hashVal = 0;
    for (const char of String(key)) {
      hashVal = (hashVal * 31 + char.charCodeAt(0)) % this.size;
    }
    return hashVal;
  }
  
  insert(key, value) {
    // Insert with separate chaining
    const index = this.hashFunction(key);
    // Check if key exists
    const existing = this.table[index].findIndex(([k]) => k === key);
    if (existing !== -1) {
      this.table[index][existing] = [key, value];
    } else {
      this.table[index].push([key, value]);
    }
  }
  
  search(key) {
    // Search for a key
    const index = this.hashFunction(key);
    const entry = this.table[index].find(([k]) => k === key);
    return entry ? entry[1] : null;
  }
}`
    },
    heap: {
      python: `class MinHeap:
    def __init__(self):
        self.heap = []
    
    def parent(self, i):
        return (i - 1) // 2
    
    def left_child(self, i):
        return 2 * i + 1
    
    def right_child(self, i):
        return 2 * i + 2
    
    def insert(self, key):
        """Insert and maintain heap property"""
        self.heap.append(key)
        self._heapify_up(len(self.heap) - 1)
    
    def extract_min(self):
        """Remove and return minimum element"""
        if not self.heap:
            return None
        
        if len(self.heap) == 1:
            return self.heap.pop()
        
        min_val = self.heap[0]
        self.heap[0] = self.heap.pop()
        self._heapify_down(0)
        return min_val
    
    def _heapify_up(self, i):
        while i > 0 and self.heap[i] < self.heap[self.parent(i)]:
            self.heap[i], self.heap[self.parent(i)] = \
                self.heap[self.parent(i)], self.heap[i]
            i = self.parent(i)
    
    def _heapify_down(self, i):
        min_index = i
        left = self.left_child(i)
        right = self.right_child(i)
        
        if left < len(self.heap) and self.heap[left] < self.heap[min_index]:
            min_index = left
        
        if right < len(self.heap) and self.heap[right] < self.heap[min_index]:
            min_index = right
        
        if i != min_index:
            self.heap[i], self.heap[min_index] = \
                self.heap[min_index], self.heap[i]
            self._heapify_down(min_index)`,
      javascript: `class MinHeap {
  constructor() {
    this.heap = [];
  }
  
  parent(i) {
    return Math.floor((i - 1) / 2);
  }
  
  leftChild(i) {
    return 2 * i + 1;
  }
  
  rightChild(i) {
    return 2 * i + 2;
  }
  
  insert(key) {
    // Insert and maintain heap property
    this.heap.push(key);
    this.heapifyUp(this.heap.length - 1);
  }
  
  extractMin() {
    // Remove and return minimum element
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();
    
    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.heapifyDown(0);
    return min;
  }
  
  heapifyUp(i) {
    while (i > 0 && this.heap[i] < this.heap[this.parent(i)]) {
      [this.heap[i], this.heap[this.parent(i)]] = 
        [this.heap[this.parent(i)], this.heap[i]];
      i = this.parent(i);
    }
  }
  
  heapifyDown(i) {
    let minIndex = i;
    const left = this.leftChild(i);
    const right = this.rightChild(i);
    
    if (left < this.heap.length && this.heap[left] < this.heap[minIndex]) {
      minIndex = left;
    }
    
    if (right < this.heap.length && this.heap[right] < this.heap[minIndex]) {
      minIndex = right;
    }
    
    if (i !== minIndex) {
      [this.heap[i], this.heap[minIndex]] = 
        [this.heap[minIndex], this.heap[i]];
      this.heapifyDown(minIndex);
    }
  }
}`
    }
  };

  const code = codeSnippets[algorithm]?.[language] || 'Code not available';

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-aviation-surface border-aviation-border">
      <div className="flex items-center justify-between p-4 border-b border-aviation-border">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-aviation-accent" />
          <h4 className="font-bold text-aviation-text-primary">
            Implementation: {algorithm.toUpperCase()}
          </h4>
          <span className="px-2 py-1 bg-aviation-accent/20 rounded text-xs font-mono text-aviation-accent">
            {language}
          </span>
        </div>
        <Button
          onClick={copyCode}
          variant="outline"
          size="sm"
          className="border-aviation-border"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </>
          )}
        </Button>
      </div>
      <div className="p-4">
        <pre className="text-xs font-mono text-aviation-text-secondary bg-aviation-bg p-4 rounded overflow-x-auto">
          <code>{code}</code>
        </pre>
      </div>
    </Card>
  );
};
