import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const ImportExportDialog = ({ open, onOpenChange, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [importData, setImportData] = useState('');

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/export/all-data`);
      const dataStr = JSON.stringify(res.data, null, 2);
      
      // Download as file
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `airline-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Export failed: ' + (error.response?.data?.detail || error.message));
    }
    setLoading(false);
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      toast.error('Please paste JSON data to import');
      return;
    }

    setLoading(true);
    try {
      const data = JSON.parse(importData);
      await axios.post(`${API}/import/data`, data);
      toast.success('Data imported successfully!');
      setImportData('');
      onComplete();
      onOpenChange(false);
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast.error('Invalid JSON format');
      } else {
        toast.error('Import failed: ' + (error.response?.data?.detail || error.message));
      }
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-aviation-surface border-aviation-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading text-aviation-text-primary">
            Import / Export Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-heading font-bold text-aviation-text-primary">Export System Data</h3>
            <p className="text-sm text-aviation-text-secondary">
              Download all airports, flights, passengers, queues, and cancellations as JSON
            </p>
            <Button 
              onClick={handleExport} 
              disabled={loading}
              className="w-full bg-dsa-graph hover:bg-dsa-graph/80"
            >
              {loading ? 'Exporting...' : '📥 Export All Data'}
            </Button>
          </div>

          <div className="h-px bg-aviation-border"></div>

          {/* Import Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-heading font-bold text-aviation-text-primary">Import System Data</h3>
            <p className="text-sm text-aviation-text-secondary">
              Paste JSON data below to import into the system
            </p>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              className="w-full h-64 p-4 bg-aviation-bg border border-aviation-border text-aviation-text-primary rounded font-mono text-xs"
              placeholder='Paste JSON data here...\n\nExample:\n{\n  "airports": [...],\n  "flights": [...],\n  "passengers": [...]\n}'
            />
            <Button 
              onClick={handleImport} 
              disabled={loading || !importData.trim()}
              className="w-full bg-dsa-queue hover:bg-dsa-queue/80"
            >
              {loading ? 'Importing...' : '📤 Import Data'}
            </Button>
          </div>

          <div className="p-4 bg-aviation-bg border border-aviation-border rounded-lg">
            <p className="text-xs text-aviation-text-secondary">
              <strong>Note:</strong> Importing data will add to existing data. Use "Reset System" first if you want to replace all data.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
