/**
 * SuitTypeSalesChart Component
 * 
 * Interactive pie chart showing sales distribution by suit type:
 * - Ready-Made, Brand Replicas, Hand-Made Karhai
 * - Custom colors for each suit type
 * - Hover effects with tooltips showing revenue
 * - Percentage labels
 * - Legend with revenue and orders
 * - Responsive sizing
 * - Dark mode support
 * 
 * Uses recharts library for visualization
 */

'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

/**
 * @typedef {Object} SuitTypeSales
 * @property {string} suitType
 * @property {string} label
 * @property {number} revenue
 * @property {number} orders
 * @property {number} quantity
 * @property {number} percentage
 */

/**
 * @param {Object} props
 * @param {SuitTypeSales[]} [props.data]
 */

// Color palette for suit types
const SUIT_TYPE_COLORS = {
  'ready-made': '#3b82f6', // blue
  'replica': '#8b5cf6', // purple
  'karhai': '#f43f5e' // rose
};

const DEFAULT_COLORS = ['#3b82f6', '#8b5cf6', '#f43f5e'];

export default function SuitTypeSalesChart({ data: propData }) {
  // Transform suit type sales data for pie chart
  const data = propData && propData.length > 0
    ? propData.map((item, index) => ({
        name: item.label || item.suitType || 'Unknown',
        value: parseFloat(item.percentage) || 0,
        revenue: item.revenue || 0,
        orders: item.orders || 0,
        quantity: item.quantity || 0,
        color: SUIT_TYPE_COLORS[item.suitType] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
      }))
    : [
        { name: 'Ready-Made', value: 50, revenue: 250000, orders: 120, quantity: 150, color: '#3b82f6' },
        { name: 'Brand Replicas', value: 30, revenue: 150000, orders: 75, quantity: 90, color: '#8b5cf6' },
        { name: 'Hand-Made Karhai', value: 20, revenue: 100000, orders: 45, quantity: 50, color: '#f43f5e' }
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
            <p className="text-sm text-green-600 dark:text-green-400">
              <span className="font-medium">Revenue:</span>{' '}
              {new Intl.NumberFormat('en-PK', {
                style: 'currency',
                currency: 'PKR',
                minimumFractionDigits: 0
              }).format(data.revenue)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Orders:</span> {data.orders}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Quantity:</span> {data.quantity}
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
                {new Intl.NumberFormat('en-PK', {
                  style: 'currency',
                  currency: 'PKR',
                  minimumFractionDigits: 0,
                  notation: 'compact'
                }).format(entry.payload.revenue)}
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

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);

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

      {/* Total Revenue */}
      <div className="mt-4 text-center">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0
          }).format(totalRevenue)}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
      </div>
    </div>
  );
}

