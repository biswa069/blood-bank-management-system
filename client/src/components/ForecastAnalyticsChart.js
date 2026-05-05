import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const ForecastAnalyticsChart = ({ data = [] }) => {
  useEffect(() => {
    // TODO: Fetch data dynamically from the backend
    // 
    // const fetchForecastAccuracy = async () => {
    //   try {
    //     const response = await axios.get('/api/analytics/forecast-accuracy');
    //     if (response.data?.success) {
    //         setData(response.data.chartData);
    //     }
    //   } catch (error) {
    //     console.error("Failed to fetch forecast accuracy data", error);
    //   }
    // };
    // fetchForecastAccuracy();
  }, []);

  return (
    // 3. The UI Layout (Tailwind CSS)
    <div className="bg-white rounded-2xl shadow-lg p-6 my-6 border border-gray-100">
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <i className="fa-solid fa-chart-line text-[#8B5CF6]"></i>
          AI Forecast Accuracy vs Actual Demand
        </h3>
        <p className="text-sm text-gray-500 mb-6 mt-2">
          A retrospective comparison evaluating the XGBoost machine learning model's predictions against real-world blood utilization.
        </p>
      </div>
      
      {/* 4. The Recharts Implementation */}
      <div style={{ width: '100%', height: 400 }} className="mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 10,
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
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', 
                  border: 'none',
                  padding: '12px'
              }} 
            />
            <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
            />
            
            {/* Line 1 (Actual Demand) - Solid Crimson Red */}
            <Line
              type="monotone"
              name="Actual Demand"
              dataKey="actualDemand"
              stroke="#dc2626" 
              strokeWidth={3}
              activeDot={{ r: 8, fill: '#dc2626', stroke: '#fff', strokeWidth: 2 }}
              dot={{ r: 4, fill: '#dc2626', strokeWidth: 0 }}
            />
            
            {/* Line 2 (Predicted Demand) - Dashed Purple */}
            <Line
              type="monotone"
              name="Predicted Demand"
              dataKey="predictedDemand"
              stroke="#8b5cf6" 
              strokeWidth={3}
              strokeDasharray="5 5"
              activeDot={{ r: 8, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
              dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ForecastAnalyticsChart;
