import React from 'react';
import { Card } from './ui/card';
import { Label } from './ui/label';

export const OperationControlPanel = ({ 
  animationSpeed, 
  onSpeedChange,
  showDSAInfo,
  onToggleDSAInfo,
  stepMode = false,
  onToggleStepMode
}) => {
  return (
    <Card className="bg-aviation-surface border-aviation-border p-4">
      <h3 className="text-sm font-heading font-bold text-aviation-text-primary mb-4">
        ⚙️ Operation Controls
      </h3>
      
      <div className="space-y-4">
        {/* Animation Speed Control */}
        <div>
          <Label className="text-aviation-text-secondary text-xs mb-2 block">
            Animation Speed
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {['slow', 'normal', 'fast'].map((speed) => (
              <button
                key={speed}
                onClick={() => onSpeedChange(speed)}
                className={`px-3 py-2 rounded text-xs font-mono font-bold transition-all ${
                  animationSpeed === speed
                    ? 'bg-aviation-accent text-white'
                    : 'bg-aviation-bg text-aviation-text-secondary hover:bg-aviation-surface-highlight'
                }`}
              >
                {speed === 'slow' && '🐢'}
                {speed === 'normal' && '⚡'}
                {speed === 'fast' && '🚀'}
                <span className="ml-1 capitalize">{speed}</span>
              </button>
            ))}
          </div>
        </div>

        {/* DSA Explanation Toggle */}
        <div>
          <Label className="text-aviation-text-secondary text-xs mb-2 block">
            Educational Mode
          </Label>
          <button
            onClick={onToggleDSAInfo}
            className={`w-full px-4 py-3 rounded font-mono text-sm font-bold transition-all ${
              showDSAInfo
                ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                : 'bg-aviation-bg border-2 border-aviation-border text-aviation-text-secondary hover:border-aviation-accent'
            }`}
          >
            {showDSAInfo ? '✓ Explanations ON' : '○ Show Explanations'}
          </button>
        </div>

        {/* Step Mode Toggle */}
        <div>
          <Label className="text-aviation-text-secondary text-xs mb-2 block">
            Execution Mode
          </Label>
          <button
            onClick={onToggleStepMode}
            className={`w-full px-4 py-3 rounded font-mono text-sm font-bold transition-all ${
              stepMode
                ? 'bg-blue-500/20 border-2 border-blue-500 text-blue-400'
                : 'bg-aviation-bg border-2 border-aviation-border text-aviation-text-secondary hover:border-aviation-accent'
            }`}
          >
            {stepMode ? '▶️ Step-by-Step' : '⏩ Automatic'}
          </button>
        </div>

        {/* Legend */}
        <div className="pt-3 border-t border-aviation-border">
          <Label className="text-aviation-text-secondary text-xs mb-2 block">
            Status Colors
          </Label>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-aviation-text-secondary font-mono">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-aviation-text-secondary font-mono">Boarded</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-aviation-text-secondary font-mono">Cancelled</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
