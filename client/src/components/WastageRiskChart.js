import React, { useState, useEffect } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

const WastageRiskChart = ({ data = [] }) => {

  return (
    <div className="bg-white rounded-md shadow-sm p-6 my-6 border border-gray-100" style={{ borderRadius: '12px', border: '1px solid #f3f4f6', backgroundColor: '#fff', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
      <div className="mb-4 pb-3" style={{ borderBottom: '1px solid #f3f4f6' }}>
        <h2 className="text-2xl font-bold text-gray-800 d-flex align-items-center m-0" style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
          <i className="fa-solid fa-triangle-exclamation text-warning me-3" style={{ color: '#f59e0b' }}></i>
          Wastage Risk Analysis
        </h2>
        <p className="text-muted mt-2 mb-0" style={{ fontSize: '14px', color: '#6b7280' }}>
          A forward-looking overlay comparing upcoming blood expiration dates against AI-predicted demand. <span style={{color: '#ef4444', fontWeight: '600'}}>Red bars</span> exceeding the trendline indicate an imminent surplus risk requiring routing.
        </p>
      </div>
      
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
                dataKey="date" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                dy={10}
                minTickGap={20}
            />
            <YAxis 
                tick={{ fill: '#6b7280', fontSize: 13 }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                dx={-10}
            />
            <Tooltip 
                contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                }}
            />
            <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
            />
            
            {/* Bar (Expiring Blood) - Dynamically colored if > demand */}
            <Bar name="Expiring Units" dataKey="expiringUnits" barSize={40} radius={[4, 4, 0, 0]}>
              {
                data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.expiringUnits > entry.predictedDemand ? '#ef4444' : '#93c5fd'} />
                ))
              }
            </Bar>

            {/* Line (Predicted Demand) */}
            <Line
              type="monotone"
              name="Predicted Demand"
              dataKey="predictedDemand"
              stroke="#1e3a8a" 
              strokeWidth={4}
              dot={{ r: 5, fill: '#1e3a8a', strokeWidth: 0 }}
              activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2, fill: '#1e3a8a' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WastageRiskChart;
