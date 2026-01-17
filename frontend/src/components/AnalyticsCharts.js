import React from 'react';
import { Card } from './ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899'];

export const AnalyticsCharts = ({ detailedAnalytics }) => {
  if (!detailedAnalytics) return null;

  const statusData = [
    { name: 'Pending', value: detailedAnalytics.status_distribution.pending, color: '#F59E0B' },
    { name: 'Boarded', value: detailedAnalytics.status_distribution.boarded, color: '#10B981' },
    { name: 'Cancelled', value: detailedAnalytics.status_distribution.cancelled, color: '#EF4444' }
  ];

  const occupancyData = detailedAnalytics.flight_occupancy.slice(0, 8);
  const airportData = detailedAnalytics.airport_statistics.slice(0, 6);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Status Distribution Pie Chart */}
      <Card className="bg-aviation-surface border-aviation-border p-6">
        <h3 className="text-lg font-heading font-bold text-aviation-text-primary mb-4">
          Passenger Status Distribution
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name}: ${entry.value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Flight Occupancy Bar Chart */}
      <Card className="bg-aviation-surface border-aviation-border p-6">
        <h3 className="text-lg font-heading font-bold text-aviation-text-primary mb-4">
          Flight Occupancy Rates
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={occupancyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="flight_id" stroke="#94A3B8" />
            <YAxis stroke="#94A3B8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
              labelStyle={{ color: '#F8FAFC' }}
            />
            <Legend />
            <Bar dataKey="occupancy" fill="#3B82F6" name="Occupancy %" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Airport Statistics */}
      <Card className="bg-aviation-surface border-aviation-border p-6">
        <h3 className="text-lg font-heading font-bold text-aviation-text-primary mb-4">
          Airport Flight Statistics
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={airportData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="code" stroke="#94A3B8" />
            <YAxis stroke="#94A3B8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
              labelStyle={{ color: '#F8FAFC' }}
            />
            <Legend />
            <Bar dataKey="departures" fill="#10B981" name="Departures" />
            <Bar dataKey="arrivals" fill="#3B82F6" name="Arrivals" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Key Metrics */}
      <Card className="bg-aviation-surface border-aviation-border p-6">
        <h3 className="text-lg font-heading font-bold text-aviation-text-primary mb-4">
          Key Performance Metrics
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-aviation-bg rounded-lg">
            <span className="text-aviation-text-secondary">Total Revenue (Est.)</span>
            <span className="text-2xl font-bold text-dsa-graph">
              ₹{(detailedAnalytics.total_revenue / 100000).toFixed(2)}L
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-aviation-bg rounded-lg">
            <span className="text-aviation-text-secondary">Cancellation Rate</span>
            <span className="text-2xl font-bold text-dsa-stack">
              {detailedAnalytics.cancellation_rate}%
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-aviation-bg rounded-lg">
            <span className="text-aviation-text-secondary">Average Occupancy</span>
            <span className="text-2xl font-bold text-dsa-queue">
              {(occupancyData.reduce((sum, f) => sum + f.occupancy, 0) / occupancyData.length).toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-aviation-bg rounded-lg">
            <span className="text-aviation-text-secondary">Active Queues</span>
            <span className="text-2xl font-bold text-aviation-accent">
              {Object.keys(detailedAnalytics.queue_statistics).length}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
