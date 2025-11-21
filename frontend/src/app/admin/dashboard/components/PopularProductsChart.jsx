/**
 * Popular Products Chart Component
 * 
 * Displays a horizontal bar chart showing top 10 best-selling products
 * Uses recharts library for visualization
 */

'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

/**
 * @typedef {Object} PopularProduct
 * @property {string} title
 * @property {number} sales
 * @property {number} revenue
 */

/**
 * @param {Object} props
 * @param {PopularProduct[]} [props.data]
 */

export default function PopularProductsChart({ data: propData }) {
  // Fallback mock data if no data provided
  const defaultData = [
    { name: 'Bridal Lehenga', sales: 45, revenue: 450000 },
    { name: 'Party Wear Suit', sales: 38, revenue: 380000 },
    { name: 'Formal Dress', sales: 32, revenue: 320000 },
    { name: 'Casual Kurta', sales: 28, revenue: 280000 },
    { name: 'Wedding Gown', sales: 25, revenue: 250000 },
    { name: 'Embroidered Saree', sales: 22, revenue: 220000 },
    { name: 'Designer Dupatta', sales: 20, revenue: 200000 },
    { name: 'Festive Collection', sales: 18, revenue: 180000 },
    { name: 'Summer Lawn', sales: 15, revenue: 150000 },
    { name: 'Winter Shawl', sales: 12, revenue: 120000 }
  ];

  // Use provided data or fallback to default
  const data = propData && propData.length > 0
    ? propData.map(item => ({
        name: (item.title || item.name || 'Unknown').length > 20 
          ? (item.title || item.name || 'Unknown').substring(0, 20) + '...' 
          : (item.title || item.name || 'Unknown'),
        sales: item.sales || item.count || 0,
        revenue: item.revenue || 0
      }))
    : defaultData;

  // Colors for bars
  const COLORS = [
    '#4F46E5', // indigo-600
    '#7C3AED', // violet-600
    '#2563EB', // blue-600
    '#0891B2', // cyan-600
    '#059669', // emerald-600
    '#CA8A04', // yellow-600
    '#EA580C', // orange-600
    '#DC2626', // red-600
    '#DB2777', // pink-600
    '#9333EA'  // purple-600
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{payload[0].payload.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sales: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{payload[0].value}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Revenue: <span className="font-semibold text-green-600 dark:text-green-400">
              {new Intl.NumberFormat('en-PK', {
                style: 'currency',
                currency: 'PKR',
                minimumFractionDigits: 0
              }).format(payload[0].payload.revenue)}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis 
            type="number" 
            className="text-xs text-gray-600 dark:text-gray-400"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            className="text-xs text-gray-600 dark:text-gray-400"
            tick={{ fill: 'currentColor' }}
            width={110}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(79, 70, 229, 0.1)' }} />
          <Bar dataKey="sales" radius={[0, 8, 8, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}