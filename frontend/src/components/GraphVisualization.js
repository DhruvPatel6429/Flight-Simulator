import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

cytoscape.use(dagre);

export const GraphVisualization = ({ airports, flights, selectedNode, onNodeClick }) => {
  const cyRef = useRef(null);
  const [cy, setCy] = useState(null);

  useEffect(() => {
    if (!cyRef.current) return;

    const elements = [
      ...airports.map(airport => ({
        data: { 
          id: airport.code, 
          label: `${airport.code}\n${airport.city}`,
          type: 'airport'
        }
      })),
      ...flights.map(flight => ({
        data: {
          id: flight.id,
          source: flight.source_code,
          target: flight.destination_code,
          label: flight.flight_id,
          type: 'flight'
        }
      }))
    ];

    const cyInstance = cytoscape({
      container: cyRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#0EA5E9',
            'label': 'data(label)',
            'color': '#F8FAFC',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-family': 'JetBrains Mono, monospace',
            'font-size': '12px',
            'width': '60px',
            'height': '60px',
            'border-width': '2px',
            'border-color': '#0284C7',
            'text-wrap': 'wrap',
            'text-max-width': '80px'
          }
        },
        {
          selector: 'node:selected',
          style: {
            'background-color': '#F59E0B',
            'border-color': '#F59E0B',
            'border-width': '3px'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#475569',
            'target-arrow-color': '#475569',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'color': '#94A3B8',
            'text-background-color': '#151E32',
            'text-background-opacity': 1,
            'text-background-padding': '3px',
            'font-family': 'JetBrains Mono, monospace',
            'font-size': '10px'
          }
        },
        {
          selector: 'edge:selected',
          style: {
            'line-color': '#F59E0B',
            'target-arrow-color': '#F59E0B',
            'width': 3
          }
        }
      ],
      layout: {
        name: 'dagre',
        rankDir: 'LR',
        nodeSep: 100,
        rankSep: 150
      }
    });

    cyInstance.on('tap', 'node', (evt) => {
      const node = evt.target;
      if (onNodeClick) {
        onNodeClick(node.data('id'));
      }
    });

    setCy(cyInstance);

    return () => {
      cyInstance.destroy();
    };
  }, [airports, flights]);

  useEffect(() => {
    if (cy && selectedNode) {
      cy.nodes().removeClass('selected');
      cy.$(`#${selectedNode}`).addClass('selected');
    }
  }, [cy, selectedNode]);

  return (
    <div 
      ref={cyRef} 
      className="cytoscape-container w-full h-full min-h-[500px]"
      data-testid="graph-visualization"
    />
  );
};
