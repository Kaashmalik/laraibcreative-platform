/**
 * RevenueChart Component
 * 
 * Interactive line chart showing revenue trends featuring:
 * - Last 30 days revenue data
 * - Smooth gradient fill under line
 * - Hover tooltips with formatted values
 * - Responsive sizing
 * - Grid lines for better readability
 * - Animated entrance
 * - Dark mode support
 * 
 * Uses recharts library for visualization
 * 
 * @requires recharts - Chart library
 */

'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

/**
 * @typedef {Object} RevenueTrend
 * @property {string} date
 * @property {number} revenue
 * @property {number} orders
 */

/**
 * @param {Object} props
 * @param {RevenueTrend[]} [props.data]
 */

export default function RevenueChart({ data: propData }) {
  // Fallback mock data if no data provided
  const defaultData = [
    { date: 'Oct 1', revenue: 12000, orders: 8 },
    { date: 'Oct 2', revenue: 15000, orders: 10 },
    { date: 'Oct 3', revenue: 18000, orders: 12 },
    { date: 'Oct 4', revenue: 14000, orders: 9 },
    { date: 'Oct 5', revenue: 22000, orders: 15 },
    { date: 'Oct 6', revenue: 19000, orders: 13 },
    { date: 'Oct 7', revenue: 25000, orders: 17 },
    { date: 'Oct 8', revenue: 21000, orders: 14 },
    { date: 'Oct 9', revenue: 28000, orders: 19 },
    { date: 'Oct 10', revenue: 24000, orders: 16 },
    { date: 'Oct 11', revenue: 30000, orders: 20 },
    { date: 'Oct 12', revenue: 27000, orders: 18 },
    { date: 'Oct 13', revenue: 32000, orders: 22 },
    { date: 'Oct 14', revenue: 29000, orders: 20 },
    { date: 'Oct 15', revenue: 35000, orders: 24 },
    { date: 'Oct 16', revenue: 31000, orders: 21 },
    { date: 'Oct 17', revenue: 38000, orders: 26 },
    { date: 'Oct 18', revenue: 34000, orders: 23 },
    { date: 'Oct 19', revenue: 40000, orders: 28 },
    { date: 'Oct 20', revenue: 36000, orders: 25 },
    { date: 'Oct 21', revenue: 42000, orders: 29 },
    { date: 'Oct 22', revenue: 39000, orders: 27 },
    { date: 'Oct 23', revenue: 45000, orders: 31 },
    { date: 'Oct 24', revenue: 41000, orders: 28 },
    { date: 'Oct 25', revenue: 48000, orders: 33 },
    { date: 'Oct 26', revenue: 44000, orders: 30 },
    { date: 'Oct 27', revenue: 50000, orders: 35 },
    { date: 'Oct 28', revenue: 46000, orders: 32 },
    { date: 'Oct 29', revenue: 52000, orders: 36 },
    { date: 'Oct 30', revenue: 49000, orders: 34 }
  ];

  // Use provided data or fallback to default
  const data = propData && propData.length > 0
    ? propData.map(item => ({
        date: item.date || '',
        revenue: item.revenue || 0,
        orders: item.orders || 0
      }))
    : defaultData;

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
          <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
            {label}
          </p>
          <div className="space-y-1">
            <p className="text-sm text-green-600 dark:text-green-400">
              <span className="font-semibold">Revenue:</span>{' '}
              {new Intl.NumberFormat('en-PK', {
                style: 'currency',
                currency: 'PKR',
                minimumFractionDigits: 0
              }).format(payload[0].value)}
            </p>
            <p className="text-sm text-indigo-600 dark:text-indigo-400">
              <span className="font-semibold">Orders:</span> {payload[0].payload.orders}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Format Y-axis values
  const formatYAxis = (value) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return value;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          {/* Define gradient for area fill */}
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Grid */}
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e5e7eb" 
            className="dark:stroke-gray-700"
            vertical={false}
          />

          {/* X-Axis */}
          <XAxis
            dataKey="date"
            stroke="#9ca3af"
            style={{
              fontSize: '12px',
              fontFamily: 'Inter, sans-serif'
            }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            tickFormatter={(value) => {
              // Show only every 5th date
              const index = data.findIndex(d => d.date === value);
              return index % 5 === 0 ? value : '';
            }}
          />

          {/* Y-Axis */}
          <YAxis
            stroke="#9ca3af"
            style={{
              fontSize: '12px',
              fontFamily: 'Inter, sans-serif'
            }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatYAxis}
            width={40}
          />

          {/* Tooltip */}
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 2 }} />

          {/* Area */}
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#10b981"
            strokeWidth={3}
            fill="url(#revenueGradient)"
            animationDuration={1500}
            animationBegin={0}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Average Daily</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
            {new Intl.NumberFormat('en-PK', {
              style: 'currency',
              currency: 'PKR',
              minimumFractionDigits: 0
            }).format(
              data.reduce((sum, day) => sum + day.revenue, 0) / data.length
            )}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Highest Day</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
            {new Intl.NumberFormat('en-PK', {
              style: 'currency',
              currency: 'PKR',
              minimumFractionDigits: 0
            }).format(Math.max(...data.map(d => d.revenue)))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Orders</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
            {data.reduce((sum, day) => sum + day.orders, 0)}
          </p>
        </div>
      </div>
    </div>
  );
}