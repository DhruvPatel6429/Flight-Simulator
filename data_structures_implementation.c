/*
================================================================================
COMPREHENSIVE DATA STRUCTURES IMPLEMENTATION IN C
Airline Reservation & Airport Operations System
================================================================================

This file contains complete implementations of:
1. Graph (Adjacency List) - Airport Network
2. Hash Table with 4 Collision Resolution Methods - Passenger Database
   - Separate Chaining
   - Linear Probing
   - Quadratic Probing
   - Double Hashing
3. Circular Queue - Boarding Queue
4. Stack - Cancellation History
5. Min Heap - Flight Scheduler

Author: Data Structures Lab
Purpose: Academic demonstration of core DSA concepts
================================================================================
*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <time.h>

// ============================================================================
// CONSTANTS AND MACROS
// ============================================================================

#define MAX_AIRPORTS 50
#define MAX_FLIGHTS 100
#define MAX_PASSENGERS 200
#define MAX_QUEUE_SIZE 100
#define MAX_STACK_SIZE 100
#define INITIAL_HASH_SIZE 10
#define MAX_TICKET_ID_LEN 20
#define MAX_NAME_LEN 50
#define MAX_PASSPORT_LEN 15
#define MAX_FLIGHT_ID_LEN 10
#define MAX_SEAT_LEN 5
#define MAX_AIRPORT_CODE_LEN 5
#define MAX_CITY_LEN 50
#define MAX_TIME_LEN 10

// ============================================================================
// COMMON DATA STRUCTURES
// ============================================================================

// Passenger structure (used across multiple data structures)
typedef struct {
    char ticket_id[MAX_TICKET_ID_LEN];
    char name[MAX_NAME_LEN];
    char passport[MAX_PASSPORT_LEN];
    char flight_id[MAX_FLIGHT_ID_LEN];
    char seat_number[MAX_SEAT_LEN];
    char status[20];  // "pending", "boarded", "cancelled"
} Passenger;

// Flight structure
typedef struct {
    char flight_id[MAX_FLIGHT_ID_LEN];
    char source_code[MAX_AIRPORT_CODE_LEN];
    char destination_code[MAX_AIRPORT_CODE_LEN];
    char departure_time[MAX_TIME_LEN];
    int total_seats;
    int booked_seats;
} Flight;

// Airport structure
typedef struct {
    char code[MAX_AIRPORT_CODE_LEN];
    char name[MAX_CITY_LEN];
    char city[MAX_CITY_LEN];
} Airport;

// ============================================================================
// 1. GRAPH IMPLEMENTATION (ADJACENCY LIST)
// ============================================================================

/*
Purpose: Represent airport network where airports are vertices and 
         flight routes are edges.

Structure: Adjacency list using array of linked lists
- Each airport has a list of connected destinations
- Bidirectional edges for return flights
*/

// Edge node in adjacency list
typedef struct EdgeNode {
    char destination[MAX_AIRPORT_CODE_LEN];
    char flight_id[MAX_FLIGHT_ID_LEN];
    char departure_time[MAX_TIME_LEN];
    struct EdgeNode* next;
} EdgeNode;

// Vertex (Airport) in graph
typedef struct {
    char airport_code[MAX_AIRPORT_CODE_LEN];
    EdgeNode* head;  // Head of adjacency list
} AdjListNode;

// Graph structure
typedef struct {
    int num_vertices;
    AdjListNode vertices[MAX_AIRPORTS];
} Graph;

// Initialize graph
void initGraph(Graph* graph) {
    graph->num_vertices = 0;
    for (int i = 0; i < MAX_AIRPORTS; i++) {
        graph->vertices[i].airport_code[0] = '\0';
        graph->vertices[i].head = NULL;
    }
}

// Find vertex index by airport code
int findVertexIndex(Graph* graph, const char* airport_code) {
    for (int i = 0; i < graph->num_vertices; i++) {
        if (strcmp(graph->vertices[i].airport_code, airport_code) == 0) {
            return i;
        }
    }
    return -1;
}

// Add airport (vertex) to graph
bool addAirport(Graph* graph, const char* airport_code) {
    if (graph->num_vertices >= MAX_AIRPORTS) {
        printf("Error: Maximum airports reached\n");
        return false;
    }
    
    // Check if already exists
    if (findVertexIndex(graph, airport_code) != -1) {
        return true;  // Already exists
    }
    
    strcpy(graph->vertices[graph->num_vertices].airport_code, airport_code);
    graph->vertices[graph->num_vertices].head = NULL;
    graph->num_vertices++;
    return true;
}

// Add edge (flight route) to graph
bool addFlightRoute(Graph* graph, const char* source, const char* dest, 
                    const char* flight_id, const char* departure_time) {
    int src_idx = findVertexIndex(graph, source);
    int dest_idx = findVertexIndex(graph, dest);
    
    if (src_idx == -1 || dest_idx == -1) {
        printf("Error: Airport not found\n");
        return false;
    }
    
    // Add forward edge (source -> destination)
    EdgeNode* new_edge = (EdgeNode*)malloc(sizeof(EdgeNode));
    strcpy(new_edge->destination, dest);
    strcpy(new_edge->flight_id, flight_id);
    strcpy(new_edge->departure_time, departure_time);
    new_edge->next = graph->vertices[src_idx].head;
    graph->vertices[src_idx].head = new_edge;
    
    // Add reverse edge for bidirectional travel (destination -> source)
    EdgeNode* reverse_edge = (EdgeNode*)malloc(sizeof(EdgeNode));
    strcpy(reverse_edge->destination, source);
    strcpy(reverse_edge->flight_id, flight_id);
    strcpy(reverse_edge->departure_time, departure_time);
    reverse_edge->next = graph->vertices[dest_idx].head;
    graph->vertices[dest_idx].head = reverse_edge;
    
    return true;
}

// Print adjacency list
void printGraph(Graph* graph) {
    printf("\n=== AIRPORT NETWORK (ADJACENCY LIST) ===\n");
    for (int i = 0; i < graph->num_vertices; i++) {
        printf("%s -> ", graph->vertices[i].airport_code);
        EdgeNode* curr = graph->vertices[i].head;
        while (curr != NULL) {
            printf("[%s, Flight: %s, Time: %s] ", 
                   curr->destination, curr->flight_id, curr->departure_time);
            curr = curr->next;
        }
        printf("NULL\n");
    }
}

// BFS Traversal (Breadth-First Search)
void BFS(Graph* graph, const char* start_airport) {
    int start_idx = findVertexIndex(graph, start_airport);
    if (start_idx == -1) {
        printf("Error: Start airport not found\n");
        return;
    }
    
    bool visited[MAX_AIRPORTS] = {false};
    int queue[MAX_AIRPORTS];
    int front = 0, rear = 0;
    
    printf("\nBFS Traversal from %s: ", start_airport);
    
    visited[start_idx] = true;
    queue[rear++] = start_idx;
    
    while (front < rear) {
        int curr_idx = queue[front++];
        printf("%s ", graph->vertices[curr_idx].airport_code);
        
        EdgeNode* edge = graph->vertices[curr_idx].head;
        while (edge != NULL) {
            int neighbor_idx = findVertexIndex(graph, edge->destination);
            if (neighbor_idx != -1 && !visited[neighbor_idx]) {
                visited[neighbor_idx] = true;
                queue[rear++] = neighbor_idx;
            }
            edge = edge->next;
        }
    }
    printf("\n");
}

// DFS Traversal Helper (Depth-First Search)
void DFSUtil(Graph* graph, int vertex_idx, bool visited[]) {
    visited[vertex_idx] = true;
    printf("%s ", graph->vertices[vertex_idx].airport_code);
    
    EdgeNode* edge = graph->vertices[vertex_idx].head;
    while (edge != NULL) {
        int neighbor_idx = findVertexIndex(graph, edge->destination);
        if (neighbor_idx != -1 && !visited[neighbor_idx]) {
            DFSUtil(graph, neighbor_idx, visited);
        }
        edge = edge->next;
    }
}

// DFS Traversal
void DFS(Graph* graph, const char* start_airport) {
    int start_idx = findVertexIndex(graph, start_airport);
    if (start_idx == -1) {
        printf("Error: Start airport not found\n");
        return;
    }
    
    bool visited[MAX_AIRPORTS] = {false};
    printf("DFS Traversal from %s: ", start_airport);
    DFSUtil(graph, start_idx, visited);
    printf("\n");
}

// Free graph memory
void freeGraph(Graph* graph) {
    for (int i = 0; i < graph->num_vertices; i++) {
        EdgeNode* curr = graph->vertices[i].head;
        while (curr != NULL) {
            EdgeNode* temp = curr;
            curr = curr->next;
            free(temp);
        }
    }
}

// ============================================================================
// 2. HASH TABLE IMPLEMENTATIONS
// ============================================================================

/*
Purpose: Store passenger records with O(1) average lookup time
Demonstrates 4 collision resolution techniques:
1. Separate Chaining
2. Linear Probing
3. Quadratic Probing
4. Double Hashing
*/

// ----------------------------------------------------------------------------
// 2.1 PRIMARY AND SECONDARY HASH FUNCTIONS
// ----------------------------------------------------------------------------

/*
Primary Hash Function: Polynomial rolling hash with prime multiplier 31
Formula: hash = (hash * 31 + char_value) % table_size

Why 31?
- Prime number ensures better distribution
- Power of 2 minus 1 (32-1) allows compiler optimization
- Commonly used in Java String.hashCode()
*/
int hashFunction1(const char* key, int table_size) {
    unsigned long hash = 0;
    while (*key) {
        hash = (hash * 31 + (unsigned char)*key) % table_size;
        key++;
    }
    return (int)hash;
}

/*
Secondary Hash Function: For double hashing
Uses different prime (17) and ensures non-zero result

Why different prime?
- Creates different distribution pattern
- Ensures varied step sizes for different keys
- Never returns 0 (critical for double hashing)
*/
int hashFunction2(const char* key, int table_size) {
    unsigned long hash = 0;
    while (*key) {
        hash = (hash * 17 + (unsigned char)*key) % table_size;
        key++;
    }
    int result = hash % (table_size - 1);
    return (result == 0) ? 1 : result;  // Ensure non-zero
}

// Calculate load factor (α = n/m)
float calculateLoadFactor(int num_items, int table_size) {
    return (float)num_items / table_size;
}

// ----------------------------------------------------------------------------
// 2.2 METHOD #1: SEPARATE CHAINING
// ----------------------------------------------------------------------------

/*
Concept: Each bucket contains a linked list of all items that hash to that index

Advantages:
✓ Never runs out of space (unlimited items)
✓ Simple implementation
✓ Easy deletion
✓ Performance degrades gracefully

Disadvantages:
✗ Extra memory for pointers
✗ Poor cache locality
✗ Long chains reduce performance

Time Complexity:
- Average: O(1 + α) where α is load factor
- Worst: O(n) when all items in one chain
*/

// Node in chain
typedef struct ChainNode {
    Passenger data;
    struct ChainNode* next;
} ChainNode;

// Hash table with separate chaining
typedef struct {
    ChainNode** buckets;
    int table_size;
    int num_items;
    int collision_count;
} HashTableChaining;

// Initialize separate chaining hash table
HashTableChaining* createHashTableChaining(int size) {
    HashTableChaining* ht = (HashTableChaining*)malloc(sizeof(HashTableChaining));
    ht->table_size = size;
    ht->num_items = 0;
    ht->collision_count = 0;
    
    ht->buckets = (ChainNode**)malloc(size * sizeof(ChainNode*));
    for (int i = 0; i < size; i++) {
        ht->buckets[i] = NULL;
    }
    
    return ht;
}

// Insert into separate chaining hash table
bool insertChaining(HashTableChaining* ht, Passenger passenger) {
    int index = hashFunction1(passenger.ticket_id, ht->table_size);
    
    // Check if bucket already has items (collision detection)
    if (ht->buckets[index] != NULL) {
        ht->collision_count++;
        printf("  [Collision at bucket %d for %s]\n", index, passenger.ticket_id);
    }
    
    // Create new node
    ChainNode* new_node = (ChainNode*)malloc(sizeof(ChainNode));
    new_node->data = passenger;
    new_node->next = ht->buckets[index];
    ht->buckets[index] = new_node;
    
    ht->num_items++;
    return true;
}

// Search in separate chaining hash table
Passenger* searchChaining(HashTableChaining* ht, const char* ticket_id) {
    int index = hashFunction1(ticket_id, ht->table_size);
    
    ChainNode* curr = ht->buckets[index];
    int chain_length = 0;
    
    while (curr != NULL) {
        chain_length++;
        if (strcmp(curr->data.ticket_id, ticket_id) == 0) {
            printf("  [Found in bucket %d after %d comparisons]\n", 
                   index, chain_length);
            return &(curr->data);
        }
        curr = curr->next;
    }
    
    return NULL;  // Not found
}

// Display separate chaining hash table
void displayChaining(HashTableChaining* ht) {
    printf("\n=== HASH TABLE (SEPARATE CHAINING) ===\n");
    printf("Table Size: %d | Items: %d | Load Factor: %.2f | Collisions: %d\n",
           ht->table_size, ht->num_items, 
           calculateLoadFactor(ht->num_items, ht->table_size),
           ht->collision_count);
    
    for (int i = 0; i < ht->table_size; i++) {
        printf("Bucket[%d]: ", i);
        ChainNode* curr = ht->buckets[i];
        int count = 0;
        while (curr != NULL) {
            printf("[%s: %s] -> ", curr->data.ticket_id, curr->data.name);
            curr = curr->next;
            count++;
        }
        printf("NULL (Chain length: %d)\n", count);
    }
}

// Free separate chaining hash table
void freeHashTableChaining(HashTableChaining* ht) {
    for (int i = 0; i < ht->table_size; i++) {
        ChainNode* curr = ht->buckets[i];
        while (curr != NULL) {
            ChainNode* temp = curr;
            curr = curr->next;
            free(temp);
        }
    }
    free(ht->buckets);
    free(ht);
}

// ----------------------------------------------------------------------------
// 2.3 METHOD #2: LINEAR PROBING
// ----------------------------------------------------------------------------

/*
Concept: If collision, check next slot sequentially until empty slot found
Probing sequence: h(k), h(k)+1, h(k)+2, ..., (h(k)+i) % m

Advantages:
✓ Good cache locality
✓ No extra memory for pointers
✓ Simple implementation

Disadvantages:
✗ Primary clustering (occupied slots cluster together)
✗ Must maintain tombstones for deletion
✗ Performance degrades rapidly with high load factor

Time Complexity:
- Average (α=0.5): ~2.5 probes
- Average (α=0.9): ~50 probes (severe degradation!)

Primary Clustering Problem:
When collisions occur, items cluster in consecutive slots,
creating "traffic jams" where later insertions probe through entire clusters.
*/

typedef struct {
    Passenger* table;
    bool* occupied;
    int table_size;
    int num_items;
    int collision_count;
} HashTableLinearProbing;

// Initialize linear probing hash table
HashTableLinearProbing* createHashTableLinearProbing(int size) {
    HashTableLinearProbing* ht = (HashTableLinearProbing*)malloc(
        sizeof(HashTableLinearProbing));
    ht->table_size = size;
    ht->num_items = 0;
    ht->collision_count = 0;
    
    ht->table = (Passenger*)malloc(size * sizeof(Passenger));
    ht->occupied = (bool*)malloc(size * sizeof(bool));
    
    for (int i = 0; i < size; i++) {
        ht->occupied[i] = false;
    }
    
    return ht;
}

// Insert with linear probing
bool insertLinearProbing(HashTableLinearProbing* ht, Passenger passenger) {
    if (ht->num_items >= ht->table_size) {
        printf("Error: Hash table is full\n");
        return false;
    }
    
    int index = hashFunction1(passenger.ticket_id, ht->table_size);
    int original_index = index;
    int probes = 0;
    
    printf("  Inserting %s (hash=%d): ", passenger.ticket_id, index);
    
    // Linear probing: keep checking next slot
    while (ht->occupied[index] && probes < ht->table_size) {
        ht->collision_count++;
        printf("%d(occupied) -> ", index);
        index = (index + 1) % ht->table_size;  // Linear: +1
        probes++;
    }
    
    if (ht->occupied[index]) {
        printf("FAILED (table full)\n");
        return false;
    }
    
    printf("%d(empty) [%d probes]\n", index, probes);
    
    ht->table[index] = passenger;
    ht->occupied[index] = true;
    ht->num_items++;
    
    return true;
}

// Search with linear probing
Passenger* searchLinearProbing(HashTableLinearProbing* ht, const char* ticket_id) {
    int index = hashFunction1(ticket_id, ht->table_size);
    int original_index = index;
    int probes = 0;
    
    while (ht->occupied[index] && probes < ht->table_size) {
        if (strcmp(ht->table[index].ticket_id, ticket_id) == 0) {
            printf("  [Found at index %d after %d probes]\n", index, probes + 1);
            return &(ht->table[index]);
        }
        index = (index + 1) % ht->table_size;
        probes++;
    }
    
    return NULL;
}

// Display linear probing hash table
void displayLinearProbing(HashTableLinearProbing* ht) {
    printf("\n=== HASH TABLE (LINEAR PROBING) ===\n");
    printf("Table Size: %d | Items: %d | Load Factor: %.2f | Collisions: %d\n",
           ht->table_size, ht->num_items,
           calculateLoadFactor(ht->num_items, ht->table_size),
           ht->collision_count);
    
    for (int i = 0; i < ht->table_size; i++) {
        printf("Slot[%d]: ", i);
        if (ht->occupied[i]) {
            printf("[%s: %s]\n", ht->table[i].ticket_id, ht->table[i].name);
        } else {
            printf("[EMPTY]\n");
        }
    }
}

// Free linear probing hash table
void freeHashTableLinearProbing(HashTableLinearProbing* ht) {
    free(ht->table);
    free(ht->occupied);
    free(ht);
}

// ----------------------------------------------------------------------------
// 2.4 METHOD #3: QUADRATIC PROBING
// ----------------------------------------------------------------------------

/*
Concept: Use quadratic function for probing to reduce primary clustering
Probing sequence: h(k), h(k)+1², h(k)+2², ..., (h(k)+i²) % m

Advantages:
✓ Reduces primary clustering
✓ Better than linear probing for medium load factors
✓ Good cache locality

Disadvantages:
✗ Secondary clustering (same initial hash = same probe sequence)
✗ May not probe all slots (requires table size to be prime or power of 2)
✗ More complex deletion

Secondary Clustering Problem:
Items with same initial hash follow identical probe sequences.
Less severe than primary clustering but still exists.

Time Complexity:
- Better than linear probing for α < 0.7
- Performance depends on table size being prime
*/

typedef struct {
    Passenger* table;
    bool* occupied;
    int table_size;
    int num_items;
    int collision_count;
} HashTableQuadraticProbing;

// Initialize quadratic probing hash table
HashTableQuadraticProbing* createHashTableQuadraticProbing(int size) {
    HashTableQuadraticProbing* ht = (HashTableQuadraticProbing*)malloc(
        sizeof(HashTableQuadraticProbing));
    ht->table_size = size;
    ht->num_items = 0;
    ht->collision_count = 0;
    
    ht->table = (Passenger*)malloc(size * sizeof(Passenger));
    ht->occupied = (bool*)malloc(size * sizeof(bool));
    
    for (int i = 0; i < size; i++) {
        ht->occupied[i] = false;
    }
    
    return ht;
}

// Insert with quadratic probing
bool insertQuadraticProbing(HashTableQuadraticProbing* ht, Passenger passenger) {
    if (ht->num_items >= ht->table_size) {
        printf("Error: Hash table is full\n");
        return false;
    }
    
    int index = hashFunction1(passenger.ticket_id, ht->table_size);
    int original_index = index;
    int probes = 0;
    
    printf("  Inserting %s (hash=%d): ", passenger.ticket_id, original_index);
    
    // Quadratic probing: use i²
    while (ht->occupied[index] && probes < ht->table_size) {
        ht->collision_count++;
        printf("%d(occupied) -> ", index);
        probes++;
        index = (original_index + probes * probes) % ht->table_size;  // i²
    }
    
    if (ht->occupied[index]) {
        printf("FAILED (table full)\n");
        return false;
    }
    
    printf("%d(empty) [%d probes]\n", index, probes);
    
    ht->table[index] = passenger;
    ht->occupied[index] = true;
    ht->num_items++;
    
    return true;
}

// Search with quadratic probing
Passenger* searchQuadraticProbing(HashTableQuadraticProbing* ht, 
                                  const char* ticket_id) {
    int index = hashFunction1(ticket_id, ht->table_size);
    int original_index = index;
    int probes = 0;
    
    while (ht->occupied[index] && probes < ht->table_size) {
        if (strcmp(ht->table[index].ticket_id, ticket_id) == 0) {
            printf("  [Found at index %d after %d probes]\n", index, probes + 1);
            return &(ht->table[index]);
        }
        probes++;
        index = (original_index + probes * probes) % ht->table_size;
    }
    
    return NULL;
}

// Display quadratic probing hash table
void displayQuadraticProbing(HashTableQuadraticProbing* ht) {
    printf("\n=== HASH TABLE (QUADRATIC PROBING) ===\n");
    printf("Table Size: %d | Items: %d | Load Factor: %.2f | Collisions: %d\n",
           ht->table_size, ht->num_items,
           calculateLoadFactor(ht->num_items, ht->table_size),
           ht->collision_count);
    
    for (int i = 0; i < ht->table_size; i++) {
        printf("Slot[%d]: ", i);
        if (ht->occupied[i]) {
            printf("[%s: %s]\n", ht->table[i].ticket_id, ht->table[i].name);
        } else {
            printf("[EMPTY]\n");
        }
    }
}

// Free quadratic probing hash table
void freeHashTableQuadraticProbing(HashTableQuadraticProbing* ht) {
    free(ht->table);
    free(ht->occupied);
    free(ht);
}

// ----------------------------------------------------------------------------
// 2.5 METHOD #4: DOUBLE HASHING
// ----------------------------------------------------------------------------

/*
Concept: Use second hash function to determine step size
Probing sequence: h1(k), h1(k)+h2(k), h1(k)+2*h2(k), ..., (h1(k)+i*h2(k)) % m

Advantages:
✓ Eliminates both primary and secondary clustering
✓ Best uniform distribution among open addressing methods
✓ Most resistant to worst-case behavior
✓ Can handle higher load factors

Disadvantages:
✗ Requires two hash functions
✗ More complex implementation
✗ h2 must never be 0 (would cause infinite loop)
✗ Table size should be prime for full probing

Time Complexity:
- Average (α=0.5): ~1.4 probes
- Average (α=0.9): ~2.6 probes (best for high load!)

Why higher collision count but better performance?
Collision count measures probing attempts, not distribution quality.
Double hashing thoroughly searches for optimal placement,
resulting in most uniform distribution.
*/

typedef struct {
    Passenger* table;
    bool* occupied;
    int table_size;
    int num_items;
    int collision_count;
} HashTableDoubleHashing;

// Initialize double hashing hash table
HashTableDoubleHashing* createHashTableDoubleHashing(int size) {
    HashTableDoubleHashing* ht = (HashTableDoubleHashing*)malloc(
        sizeof(HashTableDoubleHashing));
    ht->table_size = size;
    ht->num_items = 0;
    ht->collision_count = 0;
    
    ht->table = (Passenger*)malloc(size * sizeof(Passenger));
    ht->occupied = (bool*)malloc(size * sizeof(bool));
    
    for (int i = 0; i < size; i++) {
        ht->occupied[i] = false;
    }
    
    return ht;
}

// Insert with double hashing
bool insertDoubleHashing(HashTableDoubleHashing* ht, Passenger passenger) {
    if (ht->num_items >= ht->table_size) {
        printf("Error: Hash table is full\n");
        return false;
    }
    
    int hash1 = hashFunction1(passenger.ticket_id, ht->table_size);
    int hash2 = hashFunction2(passenger.ticket_id, ht->table_size);
    int index = hash1;
    int probes = 0;
    
    printf("  Inserting %s (h1=%d, h2=%d, step=%d): ", 
           passenger.ticket_id, hash1, hash2, hash2);
    
    // Double hashing: use hash2 as step size
    while (ht->occupied[index] && probes < ht->table_size) {
        ht->collision_count++;
        printf("%d(occupied) -> ", index);
        probes++;
        index = (hash1 + probes * hash2) % ht->table_size;  // Different steps!
    }
    
    if (ht->occupied[index]) {
        printf("FAILED (table full)\n");
        return false;
    }
    
    printf("%d(empty) [%d probes]\n", index, probes);
    
    ht->table[index] = passenger;
    ht->occupied[index] = true;
    ht->num_items++;
    
    return true;
}

// Search with double hashing
Passenger* searchDoubleHashing(HashTableDoubleHashing* ht, const char* ticket_id) {
    int hash1 = hashFunction1(ticket_id, ht->table_size);
    int hash2 = hashFunction2(ticket_id, ht->table_size);
    int index = hash1;
    int probes = 0;
    
    while (ht->occupied[index] && probes < ht->table_size) {
        if (strcmp(ht->table[index].ticket_id, ticket_id) == 0) {
            printf("  [Found at index %d after %d probes]\n", index, probes + 1);
            return &(ht->table[index]);
        }
        probes++;
        index = (hash1 + probes * hash2) % ht->table_size;
    }
    
    return NULL;
}

// Display double hashing hash table
void displayDoubleHashing(HashTableDoubleHashing* ht) {
    printf("\n=== HASH TABLE (DOUBLE HASHING) ===\n");
    printf("Table Size: %d | Items: %d | Load Factor: %.2f | Collisions: %d\n",
           ht->table_size, ht->num_items,
           calculateLoadFactor(ht->num_items, ht->table_size),
           ht->collision_count);
    
    for (int i = 0; i < ht->table_size; i++) {
        printf("Slot[%d]: ", i);
        if (ht->occupied[i]) {
            printf("[%s: %s]\n", ht->table[i].ticket_id, ht->table[i].name);
        } else {
            printf("[EMPTY]\n");
        }
    }
}

// Free double hashing hash table
void freeHashTableDoubleHashing(HashTableDoubleHashing* ht) {
    free(ht->table);
    free(ht->occupied);
    free(ht);
}

// ============================================================================
// 3. CIRCULAR QUEUE IMPLEMENTATION (BOARDING QUEUE)
// ============================================================================

/*
Purpose: Manage boarding queue in FIFO (First-In-First-Out) order
Uses circular array to efficiently reuse space after dequeuing

Circular Queue Advantage:
Regular queue wastes front space after dequeue.
Circular queue wraps rear pointer to reuse space.

Formula: next_index = (current_index + 1) % queue_size
*/

typedef struct {
    char ticket_id[MAX_TICKET_ID_LEN];
    char passenger_name[MAX_NAME_LEN];
    char flight_id[MAX_FLIGHT_ID_LEN];
    int position;
} QueueItem;

typedef struct {
    QueueItem items[MAX_QUEUE_SIZE];
    int front;
    int rear;
    int size;
    int capacity;
} CircularQueue;

// Initialize circular queue
void initCircularQueue(CircularQueue* queue, int capacity) {
    queue->front = 0;
    queue->rear = -1;
    queue->size = 0;
    queue->capacity = capacity;
}

// Check if queue is empty
bool isQueueEmpty(CircularQueue* queue) {
    return queue->size == 0;
}

// Check if queue is full
bool isQueueFull(CircularQueue* queue) {
    return queue->size == queue->capacity;
}

// Enqueue (add to rear)
bool enqueue(CircularQueue* queue, const char* ticket_id, 
             const char* passenger_name, const char* flight_id) {
    if (isQueueFull(queue)) {
        printf("Error: Queue is full\n");
        return false;
    }
    
    // Circular increment: wrap around using modulo
    queue->rear = (queue->rear + 1) % queue->capacity;
    
    strcpy(queue->items[queue->rear].ticket_id, ticket_id);
    strcpy(queue->items[queue->rear].passenger_name, passenger_name);
    strcpy(queue->items[queue->rear].flight_id, flight_id);
    queue->items[queue->rear].position = queue->size;
    
    queue->size++;
    
    printf("Enqueued: %s (Position: %d, Rear: %d)\n", 
           passenger_name, queue->size - 1, queue->rear);
    
    return true;
}

// Dequeue (remove from front)
bool dequeue(CircularQueue* queue, QueueItem* item) {
    if (isQueueEmpty(queue)) {
        printf("Error: Queue is empty\n");
        return false;
    }
    
    *item = queue->items[queue->front];
    
    // Circular increment: wrap around
    queue->front = (queue->front + 1) % queue->capacity;
    queue->size--;
    
    printf("Dequeued: %s (Front moved to: %d)\n", item->passenger_name, queue->front);
    
    return true;
}

// Peek front element
QueueItem* peekQueue(CircularQueue* queue) {
    if (isQueueEmpty(queue)) {
        return NULL;
    }
    return &(queue->items[queue->front]);
}

// Display circular queue
void displayQueue(CircularQueue* queue) {
    printf("\n=== CIRCULAR QUEUE (BOARDING) ===\n");
    printf("Capacity: %d | Size: %d | Front: %d | Rear: %d\n",
           queue->capacity, queue->size, queue->front, queue->rear);
    
    if (isQueueEmpty(queue)) {
        printf("Queue is empty\n");
        return;
    }
    
    printf("\nQueue contents (FIFO order):\n");
    int index = queue->front;
    for (int i = 0; i < queue->size; i++) {
        printf("  [%d] Position %d: %s (Ticket: %s)\n",
               index, i, queue->items[index].passenger_name, 
               queue->items[index].ticket_id);
        index = (index + 1) % queue->capacity;
    }
    
    // Visual representation
    printf("\nCircular Array Visualization:\n");
    for (int i = 0; i < queue->capacity; i++) {
        if (i == queue->front && i == queue->rear && queue->size > 0) {
            printf("[%d: F/R] ", i);
        } else if (i == queue->front) {
            printf("[%d: FRONT] ", i);
        } else if (i == queue->rear) {
            printf("[%d: REAR] ", i);
        } else {
            printf("[%d: --] ", i);
        }
    }
    printf("\n");
}

// ============================================================================
// 4. STACK IMPLEMENTATION (CANCELLATION HISTORY)
// ============================================================================

/*
Purpose: Track cancellation history in LIFO (Last-In-First-Out) order
Most recent cancellation is accessed first

Applications:
- Undo/redo operations
- Function call stack
- Expression evaluation
- Backtracking algorithms
*/

typedef struct {
    char ticket_id[MAX_TICKET_ID_LEN];
    char passenger_name[MAX_NAME_LEN];
    char flight_id[MAX_FLIGHT_ID_LEN];
    char timestamp[30];
} CancellationItem;

typedef struct {
    CancellationItem items[MAX_STACK_SIZE];
    int top;
} Stack;

// Initialize stack
void initStack(Stack* stack) {
    stack->top = -1;
}

// Check if stack is empty
bool isStackEmpty(Stack* stack) {
    return stack->top == -1;
}

// Check if stack is full
bool isStackFull(Stack* stack) {
    return stack->top == MAX_STACK_SIZE - 1;
}

// Push onto stack
bool push(Stack* stack, const char* ticket_id, const char* passenger_name,
          const char* flight_id, const char* timestamp) {
    if (isStackFull(stack)) {
        printf("Error: Stack overflow\n");
        return false;
    }
    
    stack->top++;
    strcpy(stack->items[stack->top].ticket_id, ticket_id);
    strcpy(stack->items[stack->top].passenger_name, passenger_name);
    strcpy(stack->items[stack->top].flight_id, flight_id);
    strcpy(stack->items[stack->top].timestamp, timestamp);
    
    printf("Pushed: %s at %s (Top: %d)\n", passenger_name, timestamp, stack->top);
    
    return true;
}

// Pop from stack
bool pop(Stack* stack, CancellationItem* item) {
    if (isStackEmpty(stack)) {
        printf("Error: Stack underflow\n");
        return false;
    }
    
    *item = stack->items[stack->top];
    stack->top--;
    
    printf("Popped: %s (Top now: %d)\n", item->passenger_name, stack->top);
    
    return true;
}

// Peek top element
CancellationItem* peek(Stack* stack) {
    if (isStackEmpty(stack)) {
        return NULL;
    }
    return &(stack->items[stack->top]);
}

// Display stack
void displayStack(Stack* stack) {
    printf("\n=== STACK (CANCELLATION HISTORY) ===\n");
    printf("Size: %d | Top: %d\n", stack->top + 1, stack->top);
    
    if (isStackEmpty(stack)) {
        printf("Stack is empty\n");
        return;
    }
    
    printf("\nStack contents (LIFO order, top to bottom):\n");
    for (int i = stack->top; i >= 0; i--) {
        if (i == stack->top) {
            printf("TOP -> ");
        } else {
            printf("       ");
        }
        printf("[%d] %s (Ticket: %s, Flight: %s, Time: %s)\n",
               i, stack->items[i].passenger_name, stack->items[i].ticket_id,
               stack->items[i].flight_id, stack->items[i].timestamp);
    }
}

// ============================================================================
// 5. MIN HEAP IMPLEMENTATION (FLIGHT SCHEDULER)
// ============================================================================

/*
Purpose: Priority queue for scheduling flights by departure time
Root element = Next flight to depart (earliest time)

Binary Heap Properties:
1. Complete binary tree (filled left to right)
2. Min heap property: Parent ≤ Children

Array Representation:
- Parent of index i: (i-1)/2
- Left child of i: 2*i + 1
- Right child of i: 2*i + 2

Operations:
- Insert: O(log n) - bubble up
- Extract Min: O(log n) - bubble down
- Build Heap: O(n) - heapify
- Peek Min: O(1)
*/

typedef struct {
    Flight flights[MAX_FLIGHTS];
    int size;
} MinHeap;

// Initialize min heap
void initMinHeap(MinHeap* heap) {
    heap->size = 0;
}

// Compare departure times (for min heap)
int compareTimes(const char* time1, const char* time2) {
    return strcmp(time1, time2);
}

// Swap two flights
void swapFlights(Flight* a, Flight* b) {
    Flight temp = *a;
    *a = *b;
    *b = temp;
}

// Heapify down (for extract min and build heap)
void heapifyDown(MinHeap* heap, int index) {
    int smallest = index;
    int left = 2 * index + 1;
    int right = 2 * index + 2;
    
    // Compare with left child
    if (left < heap->size && 
        compareTimes(heap->flights[left].departure_time, 
                    heap->flights[smallest].departure_time) < 0) {
        smallest = left;
    }
    
    // Compare with right child
    if (right < heap->size && 
        compareTimes(heap->flights[right].departure_time, 
                    heap->flights[smallest].departure_time) < 0) {
        smallest = right;
    }
    
    // If smallest is not current node, swap and continue
    if (smallest != index) {
        swapFlights(&heap->flights[index], &heap->flights[smallest]);
        heapifyDown(heap, smallest);
    }
}

// Heapify up (for insert)
void heapifyUp(MinHeap* heap, int index) {
    if (index == 0) return;
    
    int parent = (index - 1) / 2;
    
    // If current node < parent, swap and continue
    if (compareTimes(heap->flights[index].departure_time,
                    heap->flights[parent].departure_time) < 0) {
        swapFlights(&heap->flights[index], &heap->flights[parent]);
        heapifyUp(heap, parent);
    }
}

// Insert flight into heap
bool insertHeap(MinHeap* heap, Flight flight) {
    if (heap->size >= MAX_FLIGHTS) {
        printf("Error: Heap is full\n");
        return false;
    }
    
    // Add at end
    heap->flights[heap->size] = flight;
    
    // Bubble up to maintain heap property
    heapifyUp(heap, heap->size);
    heap->size++;
    
    printf("Inserted flight %s (Time: %s) into heap\n", 
           flight.flight_id, flight.departure_time);
    
    return true;
}

// Extract minimum (earliest flight)
bool extractMin(MinHeap* heap, Flight* flight) {
    if (heap->size == 0) {
        printf("Error: Heap is empty\n");
        return false;
    }
    
    // Root is minimum
    *flight = heap->flights[0];
    
    // Move last element to root
    heap->flights[0] = heap->flights[heap->size - 1];
    heap->size--;
    
    // Bubble down to maintain heap property
    if (heap->size > 0) {
        heapifyDown(heap, 0);
    }
    
    printf("Extracted min: Flight %s (Time: %s)\n", 
           flight->flight_id, flight->departure_time);
    
    return true;
}

// Peek minimum (root)
Flight* peekMin(MinHeap* heap) {
    if (heap->size == 0) {
        return NULL;
    }
    return &(heap->flights[0]);
}

// Build heap from array (O(n) heapification)
void buildHeap(MinHeap* heap, Flight flights[], int n) {
    if (n > MAX_FLIGHTS) {
        printf("Error: Too many flights\n");
        return;
    }
    
    // Copy flights
    for (int i = 0; i < n; i++) {
        heap->flights[i] = flights[i];
    }
    heap->size = n;
    
    // Heapify from last non-leaf node to root
    for (int i = (n / 2) - 1; i >= 0; i--) {
        heapifyDown(heap, i);
    }
    
    printf("Built heap with %d flights\n", n);
}

// Display heap
void displayHeap(MinHeap* heap) {
    printf("\n=== MIN HEAP (FLIGHT SCHEDULER) ===\n");
    printf("Size: %d\n", heap->size);
    
    if (heap->size == 0) {
        printf("Heap is empty\n");
        return;
    }
    
    printf("\nNext flight (root): %s at %s\n", 
           heap->flights[0].flight_id, heap->flights[0].departure_time);
    
    printf("\nArray representation:\n");
    for (int i = 0; i < heap->size; i++) {
        printf("[%d] %s: %s -> %s (Time: %s)\n",
               i, heap->flights[i].flight_id,
               heap->flights[i].source_code,
               heap->flights[i].destination_code,
               heap->flights[i].departure_time);
    }
    
    printf("\nTree structure (simplified):\n");
    int level = 0;
    int level_size = 1;
    int level_count = 0;
    
    for (int i = 0; i < heap->size; i++) {
        if (level_count == 0) {
            printf("Level %d: ", level);
        }
        printf("[%s:%s] ", heap->flights[i].flight_id, 
               heap->flights[i].departure_time);
        level_count++;
        
        if (level_count == level_size) {
            printf("\n");
            level++;
            level_size *= 2;
            level_count = 0;
        }
    }
    if (level_count != 0) {
        printf("\n");
    }
}

// ============================================================================
// MAIN FUNCTION - DEMONSTRATION
// ============================================================================

int main() {
    printf("================================================================================\n");
    printf("AIRLINE RESERVATION SYSTEM - DATA STRUCTURES DEMONSTRATION\n");
    printf("================================================================================\n\n");
    
    // ------------------------------------------------------------------------
    // 1. GRAPH DEMONSTRATION
    // ------------------------------------------------------------------------
    printf("\n*** DEMONSTRATION 1: GRAPH (AIRPORT NETWORK) ***\n");
    printf("Representing airport connections using adjacency list\n\n");
    
    Graph graph;
    initGraph(&graph);
    
    // Add airports
    addAirport(&graph, "DEL");
    addAirport(&graph, "BOM");
    addAirport(&graph, "BLR");
    addAirport(&graph, "MAA");
    addAirport(&graph, "CCU");
    
    // Add flight routes
    addFlightRoute(&graph, "DEL", "BOM", "AI101", "08:00");
    addFlightRoute(&graph, "BOM", "BLR", "AI102", "10:30");
    addFlightRoute(&graph, "BLR", "MAA", "AI103", "12:00");
    addFlightRoute(&graph, "MAA", "CCU", "AI104", "14:30");
    addFlightRoute(&graph, "DEL", "BLR", "AI107", "09:00");
    
    printGraph(&graph);
    
    BFS(&graph, "DEL");
    DFS(&graph, "DEL");
    
    // ------------------------------------------------------------------------
    // 2. HASH TABLE DEMONSTRATIONS
    // ------------------------------------------------------------------------
    printf("\n\n*** DEMONSTRATION 2: HASH TABLES (COLLISION RESOLUTION) ***\n");
    printf("Comparing 4 collision resolution methods\n\n");
    
    // Sample passengers
    Passenger passengers[] = {
        {"TKT001", "Rajesh Kumar", "P12345678", "AI101", "12A", "pending"},
        {"TKT002", "Priya Sharma", "P23456789", "AI101", "13B", "pending"},
        {"TKT003", "Amit Patel", "P34567890", "AI102", "14C", "pending"},
        {"TKT004", "Sneha Reddy", "P45678901", "AI102", "15D", "boarded"},
        {"TKT005", "Vikram Singh", "P56789012", "AI103", "16E", "pending"},
        {"TKT006", "Ananya Iyer", "P67890123", "AI103", "17F", "cancelled"},
        {"TKT007", "Karan Mehta", "P78901234", "AI104", "18A", "pending"},
        {"TKT008", "Deepika Nair", "P89012345", "AI104", "19B", "pending"}
    };
    int num_passengers = 8;
    int table_size = 5;  // Small size to force collisions
    
    // ------------------------------------------------------------------------
    // 2.1 Separate Chaining
    // ------------------------------------------------------------------------
    printf("\n--- METHOD 1: SEPARATE CHAINING ---\n");
    printf("Each bucket holds linked list of all colliding items\n\n");
    
    HashTableChaining* ht_chaining = createHashTableChaining(table_size);
    
    for (int i = 0; i < num_passengers; i++) {
        insertChaining(ht_chaining, passengers[i]);
    }
    
    displayChaining(ht_chaining);
    
    printf("\nSearching for TKT003:\n");
    Passenger* found = searchChaining(ht_chaining, "TKT003");
    if (found) {
        printf("Found: %s (Status: %s)\n", found->name, found->status);
    }
    
    // ------------------------------------------------------------------------
    // 2.2 Linear Probing
    // ------------------------------------------------------------------------
    printf("\n\n--- METHOD 2: LINEAR PROBING ---\n");
    printf("Probing sequence: h, h+1, h+2, ... (creates primary clustering)\n\n");
    
    HashTableLinearProbing* ht_linear = createHashTableLinearProbing(table_size);
    
    for (int i = 0; i < num_passengers; i++) {
        insertLinearProbing(ht_linear, passengers[i]);
    }
    
    displayLinearProbing(ht_linear);
    
    printf("\nSearching for TKT005:\n");
    found = searchLinearProbing(ht_linear, "TKT005");
    if (found) {
        printf("Found: %s (Status: %s)\n", found->name, found->status);
    }
    
    // ------------------------------------------------------------------------
    // 2.3 Quadratic Probing
    // ------------------------------------------------------------------------
    printf("\n\n--- METHOD 3: QUADRATIC PROBING ---\n");
    printf("Probing sequence: h, h+1², h+2², h+3², ... (reduces primary clustering)\n\n");
    
    HashTableQuadraticProbing* ht_quadratic = createHashTableQuadraticProbing(table_size);
    
    for (int i = 0; i < num_passengers; i++) {
        insertQuadraticProbing(ht_quadratic, passengers[i]);
    }
    
    displayQuadraticProbing(ht_quadratic);
    
    // ------------------------------------------------------------------------
    // 2.4 Double Hashing
    // ------------------------------------------------------------------------
    printf("\n\n--- METHOD 4: DOUBLE HASHING ---\n");
    printf("Probing sequence: h1, h1+h2, h1+2*h2, ... (eliminates all clustering)\n\n");
    
    HashTableDoubleHashing* ht_double = createHashTableDoubleHashing(table_size);
    
    for (int i = 0; i < num_passengers; i++) {
        insertDoubleHashing(ht_double, passengers[i]);
    }
    
    displayDoubleHashing(ht_double);
    
    // Collision comparison
    printf("\n\n=== COLLISION METHODS COMPARISON ===\n");
    printf("Table Size: %d | Items: %d | Load Factor: %.2f\n\n",
           table_size, num_passengers, calculateLoadFactor(num_passengers, table_size));
    printf("%-25s | Collisions | Notes\n", "Method");
    printf("------------------------------------------------------------------------\n");
    printf("%-25s | %10d | No clustering, unlimited capacity\n", 
           "Separate Chaining", ht_chaining->collision_count);
    printf("%-25s | %10d | Primary clustering, poor for high load\n", 
           "Linear Probing", ht_linear->collision_count);
    printf("%-25s | %10d | Secondary clustering, better than linear\n", 
           "Quadratic Probing", ht_quadratic->collision_count);
    printf("%-25s | %10d | Best distribution, no clustering\n", 
           "Double Hashing", ht_double->collision_count);
    
    // ------------------------------------------------------------------------
    // 3. CIRCULAR QUEUE DEMONSTRATION
    // ------------------------------------------------------------------------
    printf("\n\n*** DEMONSTRATION 3: CIRCULAR QUEUE (BOARDING) ***\n");
    printf("FIFO order with circular wraparound\n\n");
    
    CircularQueue queue;
    initCircularQueue(&queue, 5);
    
    enqueue(&queue, "TKT001", "Rajesh Kumar", "AI101");
    enqueue(&queue, "TKT002", "Priya Sharma", "AI101");
    enqueue(&queue, "TKT003", "Amit Patel", "AI102");
    
    displayQueue(&queue);
    
    printf("\nBoarding passengers (dequeue):\n");
    QueueItem item;
    dequeue(&queue, &item);
    dequeue(&queue, &item);
    
    displayQueue(&queue);
    
    printf("\nAdding more passengers (demonstrates wraparound):\n");
    enqueue(&queue, "TKT007", "Karan Mehta", "AI104");
    enqueue(&queue, "TKT008", "Deepika Nair", "AI104");
    
    displayQueue(&queue);
    
    // ------------------------------------------------------------------------
    // 4. STACK DEMONSTRATION
    // ------------------------------------------------------------------------
    printf("\n\n*** DEMONSTRATION 4: STACK (CANCELLATION HISTORY) ***\n");
    printf("LIFO order for tracking cancellations\n\n");
    
    Stack stack;
    initStack(&stack);
    
    push(&stack, "TKT006", "Ananya Iyer", "AI103", "2025-01-15 10:30:00");
    push(&stack, "TKT004", "Sneha Reddy", "AI102", "2025-01-15 11:45:00");
    push(&stack, "TKT002", "Priya Sharma", "AI101", "2025-01-15 14:20:00");
    
    displayStack(&stack);
    
    printf("\nUndoing cancellations (pop):\n");
    CancellationItem cancel_item;
    pop(&stack, &cancel_item);
    
    displayStack(&stack);
    
    // ------------------------------------------------------------------------
    // 5. MIN HEAP DEMONSTRATION
    // ------------------------------------------------------------------------
    printf("\n\n*** DEMONSTRATION 5: MIN HEAP (FLIGHT SCHEDULER) ***\n");
    printf("Priority queue ordered by departure time\n\n");
    
    Flight flights[] = {
        {"AI105", "CCU", "HYD", "16:00", 180, 0},
        {"AI102", "BOM", "BLR", "10:30", 180, 0},
        {"AI104", "MAA", "CCU", "14:30", 180, 0},
        {"AI101", "DEL", "BOM", "08:00", 180, 0},
        {"AI103", "BLR", "MAA", "12:00", 180, 0},
        {"AI106", "HYD", "DEL", "18:30", 180, 0}
    };
    int num_flights = 6;
    
    MinHeap heap;
    initMinHeap(&heap);
    
    printf("Building heap from unsorted flights...\n");
    buildHeap(&heap, flights, num_flights);
    
    displayHeap(&heap);
    
    printf("\nExtracting flights in priority order (earliest first):\n");
    Flight next_flight;
    extractMin(&heap, &next_flight);
    printf("  Next departure: %s at %s\n", next_flight.flight_id, 
           next_flight.departure_time);
    
    extractMin(&heap, &next_flight);
    printf("  Next departure: %s at %s\n", next_flight.flight_id, 
           next_flight.departure_time);
    
    displayHeap(&heap);
    
    // ------------------------------------------------------------------------
    // CLEANUP
    // ------------------------------------------------------------------------
    printf("\n\n================================================================================\n");
    printf("DEMONSTRATION COMPLETE - Cleaning up memory...\n");
    printf("================================================================================\n");
    
    freeGraph(&graph);
    freeHashTableChaining(ht_chaining);
    freeHashTableLinearProbing(ht_linear);
    freeHashTableQuadraticProbing(ht_quadratic);
    freeHashTableDoubleHashing(ht_double);
    
    printf("\nAll demonstrations completed successfully!\n\n");
    
    // Summary
    printf("=== KEY TAKEAWAYS ===\n");
    printf("1. Graph (Adjacency List): O(V+E) space, efficient for sparse graphs\n");
    printf("2. Hash Tables: O(1) average lookup, choice depends on use case\n");
    printf("   - Separate Chaining: Best for unknown load factor\n");
    printf("   - Linear Probing: Best cache locality but suffers from clustering\n");
    printf("   - Quadratic Probing: Reduces primary clustering\n");
    printf("   - Double Hashing: Best distribution, handles high load factors\n");
    printf("3. Circular Queue: O(1) enqueue/dequeue, efficient space reuse\n");
    printf("4. Stack: O(1) push/pop, perfect for LIFO scenarios\n");
    printf("5. Min Heap: O(log n) insert/extract, O(n) build, O(1) peek\n\n");
    
    return 0;
}

/*
================================================================================
COMPILATION AND EXECUTION
================================================================================

To compile:
    gcc -o airline_system data_structures_implementation.c -Wall

To run:
    ./airline_system

Expected Output:
- Complete demonstration of all 5 data structures
- Visual representations of internal structure
- Collision resolution comparisons
- Time and space complexity analysis

================================================================================
COMPLEXITY SUMMARY
================================================================================

Data Structure       | Access  | Search   | Insert   | Delete   | Space
-------------------- | ------- | -------- | -------- | -------- | -------
Graph (Adj List)     | O(1)    | O(V+E)   | O(1)     | O(E)     | O(V+E)
Hash Table (avg)     | O(1)    | O(1)     | O(1)     | O(1)     | O(n)
Hash Table (worst)   | O(n)    | O(n)     | O(n)     | O(n)     | O(n)
Circular Queue       | O(1)*   | O(n)     | O(1)     | O(1)     | O(n)
Stack                | O(1)*   | O(n)     | O(1)     | O(1)     | O(n)
Min Heap             | O(1)*   | O(n)     | O(log n) | O(log n) | O(n)

*Access refers to peek/front/top operation only

================================================================================
*/
