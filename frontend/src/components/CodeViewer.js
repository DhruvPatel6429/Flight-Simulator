import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Code, Copy, Check, Award, Zap, BookOpen, Target } from 'lucide-react';
import { toast } from 'sonner';

export const CodeViewer = ({ algorithm }) => {
  const [copied, setCopied] = useState(false);

  // Only C code - no other languages
  const codeSnippets = {
    bfs: `#include <stdio.h>
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
      c: `#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#define MAX 100

bool visited[MAX];

// DFS implementation using recursion
void dfs(int graph[MAX][MAX], int n, int vertex) {
    printf("%d ", vertex);
    visited[vertex] = true;
    
    for (int i = 0; i < n; i++) {
        if (graph[vertex][i] && !visited[i]) {
            dfs(graph, n, i);
        }
    }
}

// DFS with pathfinding
bool dfsPath(int graph[MAX][MAX], int n, int current, 
             int end, int path[], int* pathLen) {
    visited[current] = true;
    path[(*pathLen)++] = current;
    
    if (current == end) {
        return true;
    }
    
    for (int i = 0; i < n; i++) {
        if (graph[current][i] && !visited[i]) {
            if (dfsPath(graph, n, i, end, path, pathLen)) {
                return true;
            }
        }
    }
    
    (*pathLen)--;  // Backtrack
    return false;
}`,
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
      c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#define TABLE_SIZE 10

// Hash table node for separate chaining
typedef struct Node {
    char* key;
    char* value;
    struct Node* next;
} Node;

typedef struct {
    Node* table[TABLE_SIZE];
} HashTable;

// Hash function
unsigned int hash(char* key) {
    unsigned int hashVal = 0;
    while (*key) {
        hashVal = (hashVal * 31 + *key) % TABLE_SIZE;
        key++;
    }
    return hashVal;
}

// Initialize hash table
void initHashTable(HashTable* ht) {
    for (int i = 0; i < TABLE_SIZE; i++) {
        ht->table[i] = NULL;
    }
}

// Insert into hash table with separate chaining
void insert(HashTable* ht, char* key, char* value) {
    unsigned int index = hash(key);
    Node* newNode = (Node*)malloc(sizeof(Node));
    newNode->key = strdup(key);
    newNode->value = strdup(value);
    newNode->next = NULL;
    
    // Check if key exists
    Node* current = ht->table[index];
    while (current) {
        if (strcmp(current->key, key) == 0) {
            free(current->value);
            current->value = strdup(value);
            free(newNode->key);
            free(newNode->value);
            free(newNode);
            return;
        }
        current = current->next;
    }
    
    // Add at beginning of chain
    newNode->next = ht->table[index];
    ht->table[index] = newNode;
}

// Search in hash table
char* search(HashTable* ht, char* key) {
    unsigned int index = hash(key);
    Node* current = ht->table[index];
    
    while (current) {
        if (strcmp(current->key, key) == 0) {
            return current->value;
        }
        current = current->next;
    }
    return NULL;  // Not found
}`,
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
    stack: {
      c: `#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#define MAX 100

// Stack structure for cancellation management
typedef struct {
    char* data[MAX];
    int top;
} Stack;

void initStack(Stack* s) {
    s->top = -1;
}

bool isEmpty(Stack* s) {
    return s->top == -1;
}

bool isFull(Stack* s) {
    return s->top == MAX - 1;
}

// Push element to stack
void push(Stack* s, char* item) {
    if (isFull(s)) {
        printf("Stack Overflow!\\n");
        return;
    }
    s->data[++s->top] = item;
    printf("Pushed: %s\\n", item);
}

// Pop element from stack
char* pop(Stack* s) {
    if (isEmpty(s)) {
        printf("Stack Underflow!\\n");
        return NULL;
    }
    char* item = s->data[s->top--];
    printf("Popped: %s\\n", item);
    return item;
}

// Peek top element
char* peek(Stack* s) {
    if (isEmpty(s)) {
        return NULL;
    }
    return s->data[s->top];
}

// Display stack contents (LIFO order)
void displayStack(Stack* s) {
    if (isEmpty(s)) {
        printf("Stack is empty\\n");
        return;
    }
    
    printf("Stack (Top -> Bottom): ");
    for (int i = s->top; i >= 0; i--) {
        printf("%s ", s->data[i]);
    }
    printf("\\n");
}`,
      python: `class Stack:
    def __init__(self):
        self.items = []
    
    def is_empty(self):
        return len(self.items) == 0
    
    def push(self, item):
        """Add item to top of stack"""
        self.items.append(item)
    
    def pop(self):
        """Remove and return top item"""
        if self.is_empty():
            raise IndexError("Pop from empty stack")
        return self.items.pop()
    
    def peek(self):
        """Return top item without removing"""
        if self.is_empty():
            return None
        return self.items[-1]
    
    def size(self):
        return len(self.items)
    
    def display(self):
        """Display stack from top to bottom"""
        if self.is_empty():
            print("Stack is empty")
            return
        print("Stack (Top -> Bottom):", self.items[::-1])`,
      javascript: `class Stack {
  constructor() {
    this.items = [];
  }
  
  isEmpty() {
    return this.items.length === 0;
  }
  
  push(item) {
    // Add item to top of stack
    this.items.push(item);
  }
  
  pop() {
    // Remove and return top item
    if (this.isEmpty()) {
      throw new Error('Stack underflow');
    }
    return this.items.pop();
  }
  
  peek() {
    // Return top item without removing
    if (this.isEmpty()) {
      return null;
    }
    return this.items[this.items.length - 1];
  }
  
  size() {
    return this.items.length;
  }
  
  display() {
    // Display stack from top to bottom
    if (this.isEmpty()) {
      console.log('Stack is empty');
      return;
    }
    console.log('Stack (Top -> Bottom):', [...this.items].reverse());
  }
}`
    },
    queue: {
      c: `#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#define MAX 100

// Circular Queue structure for boarding management
typedef struct {
    char* data[MAX];
    int front;
    int rear;
    int size;
} CircularQueue;

void initQueue(CircularQueue* q) {
    q->front = -1;
    q->rear = -1;
    q->size = 0;
}

bool isEmpty(CircularQueue* q) {
    return q->size == 0;
}

bool isFull(CircularQueue* q) {
    return q->size == MAX;
}

// Enqueue element to circular queue
void enqueue(CircularQueue* q, char* item) {
    if (isFull(q)) {
        printf("Queue Overflow!\\n");
        return;
    }
    
    if (isEmpty(q)) {
        q->front = 0;
    }
    
    q->rear = (q->rear + 1) % MAX;
    q->data[q->rear] = item;
    q->size++;
    printf("Enqueued: %s\\n", item);
}

// Dequeue element from circular queue
char* dequeue(CircularQueue* q) {
    if (isEmpty(q)) {
        printf("Queue Underflow!\\n");
        return NULL;
    }
    
    char* item = q->data[q->front];
    if (q->front == q->rear) {
        // Last element
        q->front = -1;
        q->rear = -1;
    } else {
        q->front = (q->front + 1) % MAX;
    }
    q->size--;
    printf("Dequeued: %s\\n", item);
    return item;
}

// Peek front element
char* peek(CircularQueue* q) {
    if (isEmpty(q)) {
        return NULL;
    }
    return q->data[q->front];
}

// Display queue contents (FIFO order)
void displayQueue(CircularQueue* q) {
    if (isEmpty(q)) {
        printf("Queue is empty\\n");
        return;
    }
    
    printf("Queue (Front -> Rear): ");
    int i = q->front;
    for (int count = 0; count < q->size; count++) {
        printf("%s ", q->data[i]);
        i = (i + 1) % MAX;
    }
    printf("\\n");
}`,
      python: `class CircularQueue:
    def __init__(self, capacity=100):
        self.capacity = capacity
        self.queue = [None] * capacity
        self.front = -1
        self.rear = -1
        self.size = 0
    
    def is_empty(self):
        return self.size == 0
    
    def is_full(self):
        return self.size == self.capacity
    
    def enqueue(self, item):
        """Add item to rear of queue"""
        if self.is_full():
            raise OverflowError("Queue is full")
        
        if self.is_empty():
            self.front = 0
        
        self.rear = (self.rear + 1) % self.capacity
        self.queue[self.rear] = item
        self.size += 1
    
    def dequeue(self):
        """Remove and return front item"""
        if self.is_empty():
            raise IndexError("Queue is empty")
        
        item = self.queue[self.front]
        if self.front == self.rear:
            # Last element
            self.front = -1
            self.rear = -1
        else:
            self.front = (self.front + 1) % self.capacity
        self.size -= 1
        return item
    
    def peek(self):
        """Return front item without removing"""
        if self.is_empty():
            return None
        return self.queue[self.front]
    
    def display(self):
        """Display queue from front to rear"""
        if self.is_empty():
            print("Queue is empty")
            return
        
        items = []
        i = self.front
        for _ in range(self.size):
            items.append(self.queue[i])
            i = (i + 1) % self.capacity
        print("Queue (Front -> Rear):", items)`,
      javascript: `class CircularQueue {
  constructor(capacity = 100) {
    this.capacity = capacity;
    this.queue = new Array(capacity);
    this.front = -1;
    this.rear = -1;
    this.size = 0;
  }
  
  isEmpty() {
    return this.size === 0;
  }
  
  isFull() {
    return this.size === this.capacity;
  }
  
  enqueue(item) {
    // Add item to rear of queue
    if (this.isFull()) {
      throw new Error('Queue overflow');
    }
    
    if (this.isEmpty()) {
      this.front = 0;
    }
    
    this.rear = (this.rear + 1) % this.capacity;
    this.queue[this.rear] = item;
    this.size++;
  }
  
  dequeue() {
    // Remove and return front item
    if (this.isEmpty()) {
      throw new Error('Queue underflow');
    }
    
    const item = this.queue[this.front];
    if (this.front === this.rear) {
      // Last element
      this.front = -1;
      this.rear = -1;
    } else {
      this.front = (this.front + 1) % this.capacity;
    }
    this.size--;
    return item;
  }
  
  peek() {
    // Return front item without removing
    if (this.isEmpty()) {
      return null;
    }
    return this.queue[this.front];
  }
  
  display() {
    // Display queue from front to rear
    if (this.isEmpty()) {
      console.log('Queue is empty');
      return;
    }
    
    const items = [];
    let i = this.front;
    for (let count = 0; count < this.size; count++) {
      items.push(this.queue[i]);
      i = (i + 1) % this.capacity;
    }
    console.log('Queue (Front -> Rear):', items);
  }
}`
    },
    heap: {
      c: `#include <stdio.h>
#include <stdlib.h>
#define MAX 100

// Min Heap structure
typedef struct {
    int data[MAX];
    int size;
} MinHeap;

void initHeap(MinHeap* heap) {
    heap->size = 0;
}

int parent(int i) { return (i - 1) / 2; }
int leftChild(int i) { return 2 * i + 1; }
int rightChild(int i) { return 2 * i + 2; }

void swap(int* a, int* b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

// Heapify up (for insert)
void heapifyUp(MinHeap* heap, int i) {
    while (i > 0 && heap->data[i] < heap->data[parent(i)]) {
        swap(&heap->data[i], &heap->data[parent(i)]);
        i = parent(i);
    }
}

// Heapify down (for extract min)
void heapifyDown(MinHeap* heap, int i) {
    int minIndex = i;
    int left = leftChild(i);
    int right = rightChild(i);
    
    if (left < heap->size && 
        heap->data[left] < heap->data[minIndex]) {
        minIndex = left;
    }
    
    if (right < heap->size && 
        heap->data[right] < heap->data[minIndex]) {
        minIndex = right;
    }
    
    if (i != minIndex) {
        swap(&heap->data[i], &heap->data[minIndex]);
        heapifyDown(heap, minIndex);
    }
}

// Insert element
void insert(MinHeap* heap, int key) {
    if (heap->size >= MAX) {
        printf("Heap is full!\\n");
        return;
    }
    heap->data[heap->size] = key;
    heapifyUp(heap, heap->size);
    heap->size++;
}

// Extract minimum element
int extractMin(MinHeap* heap) {
    if (heap->size == 0) {
        printf("Heap is empty!\\n");
        return -1;
    }
    
    int min = heap->data[0];
    heap->data[0] = heap->data[heap->size - 1];
    heap->size--;
    heapifyDown(heap, 0);
    
    return min;
}`,
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

  const code = codeSnippets[algorithm]?.[selectedLang] || 'Code not available';

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-aviation-surface border-aviation-border">
      <div className="flex items-center justify-between p-4 border-b border-aviation-border">
        <div className="flex items-center gap-3">
          <Code className="w-5 h-5 text-aviation-accent" />
          <h4 className="font-bold text-aviation-text-primary">
            Implementation: {algorithm.toUpperCase()}
          </h4>
          <div className="flex gap-1">
            {['c', 'python', 'javascript'].map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                  selectedLang === lang
                    ? 'bg-aviation-accent text-white'
                    : 'bg-aviation-bg text-aviation-text-secondary hover:bg-aviation-surface-highlight'
                }`}
              >
                {lang === 'c' ? 'C' : lang === 'python' ? 'Python' : 'JS'}
              </button>
            ))}
          </div>
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
        <pre className="text-xs font-mono text-aviation-text-secondary bg-aviation-bg p-4 rounded overflow-x-auto max-h-96 overflow-y-auto">
          <code>{code}</code>
        </pre>
      </div>
    </Card>
  );
};
