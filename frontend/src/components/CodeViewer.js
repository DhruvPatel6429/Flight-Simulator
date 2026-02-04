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
    dfs: `#include <stdio.h>
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
    hashtable: `#include <stdio.h>
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
    stack: `#include <stdio.h>
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
    queue: `#include <stdio.h>
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
    heap: `#include <stdio.h>
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
}`
  };

  const code = codeSnippets[algorithm] || 'Code not available for this algorithm';

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Why C for DSA Learning - Educational Banner */}
      <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-2 border-blue-500/50">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6 text-yellow-400" />
            <h3 className="font-heading font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Why C Programming for Data Structures?
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-aviation-bg/50 rounded-lg p-4 border border-blue-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h4 className="font-bold text-aviation-text-primary">Performance & Memory Control</h4>
              </div>
              <p className="text-aviation-text-secondary text-xs leading-relaxed">
                C provides direct memory management with pointers, allowing you to understand exactly how data structures are stored and manipulated in memory. This low-level control is essential for optimizing performance-critical applications.
              </p>
            </div>
            
            <div className="bg-aviation-bg/50 rounded-lg p-4 border border-purple-500/30">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-green-400" />
                <h4 className="font-bold text-aviation-text-primary">Academic Foundation</h4>
              </div>
              <p className="text-aviation-text-secondary text-xs leading-relaxed">
                Most computer science curricula and textbooks use C for teaching DSA concepts. Learning C implementations helps you understand the fundamental principles that apply to all programming languages.
              </p>
            </div>
            
            <div className="bg-aviation-bg/50 rounded-lg p-4 border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-400" />
                <h4 className="font-bold text-aviation-text-primary">Industry Relevance</h4>
              </div>
              <p className="text-aviation-text-secondary text-xs leading-relaxed">
                System programming, embedded systems, operating systems, and performance-critical applications are predominantly written in C. Understanding C-based DSA is crucial for careers in systems engineering and low-level programming.
              </p>
            </div>
            
            <div className="bg-aviation-bg/50 rounded-lg p-4 border border-red-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-5 h-5 text-purple-400" />
                <h4 className="font-bold text-aviation-text-primary">Deep Understanding</h4>
              </div>
              <p className="text-aviation-text-secondary text-xs leading-relaxed">
                C forces you to think about memory allocation, deallocation, pointer arithmetic, and manual resource management - giving you insights that high-level languages abstract away. This deep understanding makes you a better programmer overall.
              </p>
            </div>
          </div>
          
          <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-xs text-yellow-300 font-semibold">
              💡 <span className="font-bold">Pro Tip:</span> Master C implementations first, and you'll find it incredibly easy to translate these concepts to Python, Java, JavaScript, or any other language!
            </p>
          </div>
        </div>
      </Card>

      {/* Code Implementation Card */}
      <Card className="bg-aviation-surface border-aviation-border">
        <div className="flex items-center justify-between p-4 border-b border-aviation-border">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <Code className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="font-bold text-aviation-text-primary">
                C Implementation: {algorithm.toUpperCase()}
              </h4>
              <p className="text-xs text-aviation-text-secondary mt-0.5">
                Production-grade code with proper memory management
              </p>
            </div>
          </div>
          <Button
            onClick={copyCode}
            variant="outline"
            size="sm"
            className="border-aviation-border hover:bg-aviation-surface-highlight"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Code
              </>
            )}
          </Button>
        </div>
        <div className="p-4">
          <pre className="text-xs font-mono text-aviation-text-secondary bg-aviation-bg p-4 rounded-lg overflow-x-auto max-h-96 overflow-y-auto border border-aviation-border">
            <code className="language-c">{code}</code>
          </pre>
        </div>
      </Card>
    </div>
  );
};
