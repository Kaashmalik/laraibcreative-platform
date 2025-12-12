/**
 * OrdersPieChart Component
 * 
 * Interactive pie chart showing order distribution by category:
 * - Bridal, Party Wear, Casual, Formal, Designer Replicas
 * - Custom colors for each category
 * - Hover effects with tooltips
 * - Percentage labels
 * - Legend with counts
 * - Responsive sizing
 * - Dark mode support
 * 
 * Uses recharts library for visualization
 */

'use client';


import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

/**
 * @typedef {Object} OrderDistribution
 * @property {string} status
 * @property {number} percentage
 * @property {number} count
 * @property {number} revenue
 */

/**
 * @param {Object} props
 * @param {OrderDistribution[]} [props.data]
 */

// Color palette for order statuses - vibrant colors for dark mode
const STATUS_COLORS = {
  'pending-payment': '#fbbf24', // amber-400
  'payment-verified': '#60a5fa', // blue-400
  'fabric-arranged': '#a78bfa', // purple-400
  'stitching-in-progress': '#818cf8', // indigo-400
  'quality-check': '#22d3ee', // cyan-400
  'ready-for-dispatch': '#34d399', // emerald-400
  'dispatched': '#2dd4bf', // teal-400
  'delivered': '#4ade80', // green-400
  'cancelled': '#f87171' // red-400
};

const DEFAULT_COLORS = ['#f472b6', '#a78bfa', '#34d399', '#60a5fa', '#fbbf24', '#22d3ee', '#818cf8', '#2dd4bf'];

export default function OrdersPieChart({ data: propData }) {
  // Transform order distribution data for pie chart
  const data = propData && propData.length > 0
    ? propData.map((item, index) => ({
        name: (item.status || 'unknown').split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        value: item.percentage || 0,
        orders: item.count || 0,
        revenue: item.revenue || 0,
        color: STATUS_COLORS[item.status] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
      }))
    : [
        { name: 'Pending Payment', value: 45, orders: 125, color: '#fbbf24' },
        { name: 'In Progress', value: 30, orders: 83, color: '#60a5fa' },
        { name: 'Completed', value: 15, orders: 42, color: '#34d399' },
        { name: 'Delivered', value: 7, orders: 19, color: '#4ade80' },
        { name: 'Cancelled', value: 3, orders: 8, color: '#f87171' }
      ];

  // Custom label to show percentages
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label if percentage is > 5%
    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-bold"
        style={{ textShadow: '0 0 3px rgba(0,0,0,0.5)' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
          <p className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
            {data.name}
          </p>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Orders:</span> {data.orders}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Share:</span> {data.value}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <div className="flex flex-col gap-2 mt-4">
        {payload.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {entry.value}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {entry.payload.orders}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">
                {entry.payload.value}%
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={100}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
            animationDuration={1000}
            animationBegin={200}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>

      {/* Total Count */}
      <div className="mt-4 text-center">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {data.reduce((sum, item) => sum + item.orders, 0)}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
      </div>
    </div>
  );
}