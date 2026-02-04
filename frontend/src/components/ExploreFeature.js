import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { 
  Play, 
  SkipForward, 
  SkipBack, 
  X, 
  Network, 
  Hash, 
  Users, 
  ListOrdered, 
  TrendingUp,
  BookOpen,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

const TOUR_STEPS = [
  {
    id: 'intro',
    title: '🎓 Welcome to the Airline System DSA Tour',
    description: 'Explore how classic Data Structures & Algorithms power real-world airline operations.',
    icon: <BookOpen className="w-12 h-12 text-aviation-accent" />,
    content: (
      <div className="space-y-4">
        <p className="text-aviation-text-primary">
          This interactive dashboard demonstrates <span className="font-bold text-aviation-accent">5 fundamental data structures</span> 
          {' '}through a practical airline reservation system.
        </p>
        <div className="bg-aviation-bg border border-aviation-border rounded-lg p-4 space-y-2">
          <h4 className="font-bold text-aviation-text-primary mb-3">What You'll Learn:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <Network className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-blue-400 text-sm">Graph</div>
                <div className="text-xs text-aviation-text-secondary">Airport network with BFS/DFS traversal</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Hash className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-purple-400 text-sm">Hash Table</div>
                <div className="text-xs text-aviation-text-secondary">Fast passenger lookup with collision handling</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Users className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-green-400 text-sm">Circular Queue</div>
                <div className="text-xs text-aviation-text-secondary">FIFO boarding queue management</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <ListOrdered className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-orange-400 text-sm">Stack</div>
                <div className="text-xs text-aviation-text-secondary">LIFO cancellation history tracking</div>
              </div>
            </div>
            <div className="flex items-start gap-2 md:col-span-2">
              <TrendingUp className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-red-400 text-sm">Min/Max Heap</div>
                <div className="text-xs text-aviation-text-secondary">Priority queue for flight scheduling</div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <p className="text-yellow-500 text-sm">
            💡 <strong>Pro Tip:</strong> Each data structure includes animated visualizations, 
            step-by-step execution, and C/Python/JavaScript code implementations!
          </p>
        </div>
      </div>
    ),
    highlight: null
  },
  {
    id: 'graph',
    title: '🌐 Graph: Airport Network',
    description: 'Adjacency List representation for airport connections',
    icon: <Network className="w-12 h-12 text-blue-400" />,
    content: (
      <div className="space-y-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <h4 className="font-bold text-blue-400 mb-2">Real-World Application</h4>
          <p className="text-aviation-text-secondary text-sm">
            The airport network is modeled as a <strong>directed graph</strong> where:
          </p>
          <ul className="list-disc list-inside text-sm text-aviation-text-secondary space-y-1 mt-2 ml-2">
            <li><strong>Nodes</strong> = Airports (JFK, LAX, ORD, etc.)</li>
            <li><strong>Edges</strong> = Flight routes between airports</li>
            <li><strong>Weights</strong> = Distance or flight duration (optional)</li>
          </ul>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-aviation-surface border border-aviation-border rounded-lg p-3">
            <div className="font-bold text-aviation-text-primary mb-2 flex items-center gap-2">
              <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">BFS</span>
              Breadth-First Search
            </div>
            <ul className="text-xs text-aviation-text-secondary space-y-1">
              <li>✓ Shortest path (unweighted)</li>
              <li>✓ Level-by-level exploration</li>
              <li>✓ Queue-based algorithm</li>
              <li><strong>Time:</strong> O(V + E)</li>
            </ul>
          </div>
          
          <div className="bg-aviation-surface border border-aviation-border rounded-lg p-3">
            <div className="font-bold text-aviation-text-primary mb-2 flex items-center gap-2">
              <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">DFS</span>
              Depth-First Search
            </div>
            <ul className="text-xs text-aviation-text-secondary space-y-1">
              <li>✓ Path detection</li>
              <li>✓ Explores deepest path first</li>
              <li>✓ Stack-based (recursive)</li>
              <li><strong>Time:</strong> O(V + E)</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-aviation-bg border border-aviation-border rounded-lg p-3">
          <div className="text-xs font-mono text-aviation-text-secondary">
            <strong className="text-aviation-text-primary">Adjacency List Format:</strong>
            <pre className="mt-2 text-xs">
{`JFK → [LAX, ORD, MIA]
LAX → [SFO, LAS]
ORD → [DFW, ATL]
...`}
            </pre>
          </div>
        </div>
      </div>
    ),
    highlight: 'graph',
    tab: 'Graph Traversal'
  },
  {
    id: 'hashtable',
    title: '🔑 Hash Table: Passenger Database',
    description: 'O(1) average lookup with collision handling',
    icon: <Hash className="w-12 h-12 text-purple-400" />,
    content: (
      <div className="space-y-4">
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <h4 className="font-bold text-purple-400 mb-2">Why Hash Tables?</h4>
          <p className="text-aviation-text-secondary text-sm">
            Passengers need to be looked up <strong>instantly</strong> by ticket ID for check-in, 
            boarding, and status updates. Hash tables provide <strong>O(1) average time</strong> complexity!
          </p>
        </div>
        
        <div className="bg-aviation-surface border border-aviation-border rounded-lg p-3">
          <h4 className="font-bold text-aviation-text-primary mb-3">Collision Resolution Methods</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-bold">1</span>
              <div>
                <div className="font-bold text-sm text-aviation-text-primary">Separate Chaining</div>
                <div className="text-xs text-aviation-text-secondary">Each bucket contains a linked list of colliding entries</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">2</span>
              <div>
                <div className="font-bold text-sm text-aviation-text-primary">Linear Probing</div>
                <div className="text-xs text-aviation-text-secondary">Search next available slot: h(k) + i</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">3</span>
              <div>
                <div className="font-bold text-sm text-aviation-text-primary">Quadratic Probing</div>
                <div className="text-xs text-aviation-text-secondary">Jump by squares: h(k) + i²</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">4</span>
              <div>
                <div className="font-bold text-sm text-aviation-text-primary">Double Hashing</div>
                <div className="text-xs text-aviation-text-secondary">Use secondary hash: h1(k) + i * h2(k)</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <div className="text-xs text-yellow-500">
            <strong>Load Factor (α):</strong> n/m (items/size)
          </div>
          <div className="text-xs text-aviation-text-secondary mt-1">
            • α > 0.75 → Trigger rehashing (resize table)
          </div>
        </div>
      </div>
    ),
    highlight: 'hashtable',
    tab: 'Hash Table'
  },
  {
    id: 'queue',
    title: '🎫 Circular Queue: Boarding Queue',
    description: 'FIFO processing for fair passenger boarding',
    icon: <Users className="w-12 h-12 text-green-400" />,
    content: (
      <div className="space-y-4">
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <h4 className="font-bold text-green-400 mb-2">FIFO: First In, First Out</h4>
          <p className="text-aviation-text-secondary text-sm">
            Passengers are boarded in the order they check in. The <strong>circular queue</strong> ensures 
            fair processing and efficient memory usage by wrapping around.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-aviation-surface border border-aviation-border rounded-lg p-3">
            <h4 className="font-bold text-aviation-text-primary mb-2 text-sm">Operations</h4>
            <ul className="text-xs text-aviation-text-secondary space-y-1">
              <li><strong>Enqueue:</strong> Add to rear</li>
              <li><strong>Dequeue:</strong> Remove from front</li>
              <li><strong>Peek:</strong> View front</li>
            </ul>
          </div>
          
          <div className="bg-aviation-surface border border-aviation-border rounded-lg p-3">
            <h4 className="font-bold text-aviation-text-primary mb-2 text-sm">Complexity</h4>
            <ul className="text-xs text-aviation-text-secondary space-y-1">
              <li><strong>Enqueue:</strong> O(1)</li>
              <li><strong>Dequeue:</strong> O(1)</li>
              <li><strong>Space:</strong> O(n)</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-aviation-bg border border-aviation-border rounded-lg p-3">
          <div className="text-xs font-mono text-aviation-text-secondary">
            <strong className="text-aviation-text-primary">Circular Wraparound:</strong>
            <pre className="mt-2 text-xs">
{`Front = (Front + 1) % Capacity
Rear = (Rear + 1) % Capacity`}
            </pre>
            <div className="mt-2 text-aviation-text-secondary">
              This prevents wasted space and allows infinite enqueue/dequeue cycles!
            </div>
          </div>
        </div>
      </div>
    ),
    highlight: 'queue',
    tab: 'Boarding Queue'
  },
  {
    id: 'stack',
    title: '↩️ Stack: Cancellation History',
    description: 'LIFO tracking for undo operations',
    icon: <ListOrdered className="w-12 h-12 text-orange-400" />,
    content: (
      <div className="space-y-4">
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
          <h4 className="font-bold text-orange-400 mb-2">LIFO: Last In, First Out</h4>
          <p className="text-aviation-text-secondary text-sm">
            Cancellations are tracked in reverse chronological order. The most recent cancellation 
            can be retrieved first, perfect for <strong>undo operations</strong> and audit trails.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-aviation-surface border border-aviation-border rounded-lg p-3">
            <h4 className="font-bold text-aviation-text-primary mb-2 text-sm">Operations</h4>
            <ul className="text-xs text-aviation-text-secondary space-y-1">
              <li><strong>Push:</strong> Add to top</li>
              <li><strong>Pop:</strong> Remove from top</li>
              <li><strong>Peek:</strong> View top</li>
            </ul>
          </div>
          
          <div className="bg-aviation-surface border border-aviation-border rounded-lg p-3">
            <h4 className="font-bold text-aviation-text-primary mb-2 text-sm">Complexity</h4>
            <ul className="text-xs text-aviation-text-secondary space-y-1">
              <li><strong>Push:</strong> O(1)</li>
              <li><strong>Pop:</strong> O(1)</li>
              <li><strong>Space:</strong> O(n)</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-aviation-bg border border-aviation-border rounded-lg p-3">
          <h4 className="font-bold text-aviation-text-primary mb-2 text-sm">Real-World Uses:</h4>
          <ul className="text-xs text-aviation-text-secondary space-y-1 ml-4 list-disc">
            <li>Function call stack (recursion)</li>
            <li>Browser back button</li>
            <li>Undo/Redo functionality</li>
            <li>Expression evaluation (postfix)</li>
            <li>Backtracking algorithms</li>
          </ul>
        </div>
      </div>
    ),
    highlight: 'stack',
    tab: 'Cancellation Stack'
  },
  {
    id: 'heap',
    title: '🎯 Heap: Flight Scheduler',
    description: 'Priority queue for efficient scheduling',
    icon: <TrendingUp className="w-12 h-12 text-red-400" />,
    content: (
      <div className="space-y-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <h4 className="font-bold text-red-400 mb-2">Binary Heap Properties</h4>
          <p className="text-aviation-text-secondary text-sm">
            A <strong>complete binary tree</strong> where each parent maintains a specific relationship 
            with its children, enabling <strong>O(log n)</strong> insertions and extractions.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-aviation-surface border border-blue-500/30 rounded-lg p-3">
            <div className="font-bold text-blue-400 mb-2 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Min Heap
            </div>
            <ul className="text-xs text-aviation-text-secondary space-y-1">
              <li>✓ Parent ≤ Children</li>
              <li>✓ Smallest at root</li>
              <li>✓ Perfect for "next flight"</li>
              <li><strong>Extract Min:</strong> O(log n)</li>
            </ul>
          </div>
          
          <div className="bg-aviation-surface border border-red-500/30 rounded-lg p-3">
            <div className="font-bold text-red-400 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Max Heap
            </div>
            <ul className="text-xs text-aviation-text-secondary space-y-1">
              <li>✓ Parent ≥ Children</li>
              <li>✓ Largest at root</li>
              <li>✓ Perfect for "latest flight"</li>
              <li><strong>Extract Max:</strong> O(log n)</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-aviation-bg border border-aviation-border rounded-lg p-3">
          <h4 className="font-bold text-aviation-text-primary mb-2 text-sm">Array Representation</h4>
          <div className="text-xs font-mono text-aviation-text-secondary space-y-1">
            <div><strong>Parent of i:</strong> ⌊(i-1)/2⌋</div>
            <div><strong>Left Child of i:</strong> 2i + 1</div>
            <div><strong>Right Child of i:</strong> 2i + 2</div>
          </div>
        </div>
        
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <h4 className="font-bold text-green-400 mb-2 text-sm">Heapify: Build Heap in O(n)</h4>
          <p className="text-xs text-aviation-text-secondary">
            Convert an unsorted array into a heap by applying bottom-up heapify. 
            Watch the step-by-step animation to see swaps in action!
          </p>
        </div>
      </div>
    ),
    highlight: 'heap',
    tab: 'Flight Scheduler'
  },
  {
    id: 'conclusion',
    title: '🎉 Tour Complete!',
    description: 'You\'ve explored all 5 core data structures',
    icon: <CheckCircle className="w-12 h-12 text-green-400" />,
    content: (
      <div className="space-y-4">
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <h4 className="font-bold text-green-400 mb-2">Congratulations! 🎓</h4>
          <p className="text-aviation-text-secondary text-sm">
            You've completed the interactive tour of all data structures in this airline system. 
            Now you understand how theory meets practice!
          </p>
        </div>
        
        <div className="bg-aviation-surface border border-aviation-border rounded-lg p-4">
          <h4 className="font-bold text-aviation-text-primary mb-3">What's Next?</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="bg-aviation-accent text-white px-2 py-1 rounded text-xs font-bold">1</span>
              <div>
                <div className="font-bold text-sm text-aviation-text-primary">Experiment with Controls</div>
                <div className="text-xs text-aviation-text-secondary">
                  Try different animation speeds, enable step-by-step mode, and watch algorithms in action
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-aviation-accent text-white px-2 py-1 rounded text-xs font-bold">2</span>
              <div>
                <div className="font-bold text-sm text-aviation-text-primary">View Code Implementations</div>
                <div className="text-xs text-aviation-text-secondary">
                  Each visualization includes C, Python, and JavaScript code you can copy and study
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-aviation-accent text-white px-2 py-1 rounded text-xs font-bold">3</span>
              <div>
                <div className="font-bold text-sm text-aviation-text-primary">Add Your Own Data</div>
                <div className="text-xs text-aviation-text-secondary">
                  Create airports, flights, and passengers to see the data structures respond in real-time
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-aviation-accent text-white px-2 py-1 rounded text-xs font-bold">4</span>
              <div>
                <div className="font-bold text-sm text-aviation-text-primary">Compare Algorithms</div>
                <div className="text-xs text-aviation-text-secondary">
                  Use the comparison features to see BFS vs DFS, or different hash collision methods side-by-side
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
          <p className="text-yellow-500 text-sm">
            💡 <strong>Remember:</strong> The best way to learn is by doing. 
            Experiment, break things, and see how the system responds!
          </p>
        </div>
      </div>
    ),
    highlight: null
  }
];

export const ExploreFeature = ({ onClose, onNavigateToTab }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const step = TOUR_STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (!isLast) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // Navigate to the corresponding tab if exists
      const nextStepData = TOUR_STEPS[nextStep];
      if (nextStepData.tab && onNavigateToTab) {
        onNavigateToTab(nextStepData.tab);
      }
      
      toast.success(`Step ${nextStep + 1}/${TOUR_STEPS.length}`, { duration: 1500 });
    }
  };

  const handlePrevious = () => {
    if (!isFirst) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      
      // Navigate to the corresponding tab if exists
      const prevStepData = TOUR_STEPS[prevStep];
      if (prevStepData.tab && onNavigateToTab) {
        onNavigateToTab(prevStepData.tab);
      }
      
      toast.info(`Step ${prevStep + 1}/${TOUR_STEPS.length}`, { duration: 1500 });
    }
  };

  const handleAutoPlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      toast.info('Auto-play paused');
    } else {
      setIsPlaying(true);
      toast.success('Auto-play started');
      autoPlayNext();
    }
  };

  const autoPlayNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setTimeout(() => {
        handleNext();
        if (isPlaying && currentStep + 1 < TOUR_STEPS.length - 1) {
          autoPlayNext();
        } else {
          setIsPlaying(false);
        }
      }, 8000); // 8 seconds per step
    }
  };

  const handleJumpTo = (index) => {
    setCurrentStep(index);
    const stepData = TOUR_STEPS[index];
    if (stepData.tab && onNavigateToTab) {
      onNavigateToTab(stepData.tab);
    }
    toast.success(`Jumped to: ${stepData.title}`);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-aviation-surface border-aviation-border w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-aviation-bg border-b border-aviation-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step.icon}
            <div>
              <h2 className="font-heading font-bold text-xl text-aviation-text-primary">
                {step.title}
              </h2>
              <p className="text-sm text-aviation-text-secondary">{step.description}</p>
            </div>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="bg-aviation-bg border-b border-aviation-border px-4 py-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 bg-aviation-surface rounded-full h-2 overflow-hidden">
              <div 
                className="bg-aviation-accent h-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
              />
            </div>
            <span className="text-sm font-mono text-aviation-text-secondary">
              {currentStep + 1} / {TOUR_STEPS.length}
            </span>
          </div>
          
          {/* Mini step indicators */}
          <div className="flex gap-1 justify-center">
            {TOUR_STEPS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => handleJumpTo(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep 
                    ? 'bg-aviation-accent w-8' 
                    : idx < currentStep 
                    ? 'bg-green-500' 
                    : 'bg-aviation-border'
                }`}
                title={s.title}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step.content}
        </div>

        {/* Footer Controls */}
        <div className="bg-aviation-bg border-t border-aviation-border p-4 flex items-center justify-between">
          <Button 
            onClick={handlePrevious} 
            disabled={isFirst}
            variant="outline"
            className="border-aviation-border"
          >
            <SkipBack className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button 
              onClick={handleAutoPlay}
              variant={isPlaying ? "default" : "outline"}
              className={isPlaying ? "" : "border-aviation-border"}
            >
              <Play className={`w-4 h-4 mr-2 ${isPlaying ? 'animate-pulse' : ''}`} />
              {isPlaying ? 'Playing...' : 'Auto Play'}
            </Button>
          </div>

          <Button 
            onClick={isLast ? onClose : handleNext}
            variant="default"
            className="bg-aviation-accent hover:bg-aviation-accent-hover"
          >
            {isLast ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Finish Tour
              </>
            ) : (
              <>
                Next
                <SkipForward className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};
