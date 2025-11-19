/**
 * Chart Component
 * 
 * Reusable chart wrapper using Recharts library:
 * - Multiple chart types (line, bar, pie, area)
 * - Responsive container
 * - Tooltips and legend
 * - Grid lines
 * - Custom brand colors
 * - Loading state with skeleton
 * - Dark mode support
 * 
 * @param {string} type - Chart type: 'line' | 'bar' | 'pie' | 'area'
 * @param {Array} data - Chart data
 * @param {string} xKey - X-axis data key
 * @param {string|Array} yKey - Y-axis data key(s)
 * @param {Array} colors - Custom color array
 * @param {number} height - Chart height in pixels
 * @param {boolean} loading - Loading state
 * @param {string} title - Chart title (optional)
 */

'use client';

import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export default function Chart({
  type = 'line',
  data = [],
  xKey = 'name',
  yKey = 'value',
  colors = ['#6366F1', '#EC4899', '#8B5CF6', '#10B981', '#F59E0B'],
  height = 300,
  loading = false,
  title
}) {
  // Loading skeleton
  if (loading) {
    return (
      <div className="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
        {title && (
          <div className="mb-4 h-6 bg-gray-200 rounded w-1/4 animate-pulse dark:bg-gray-700"></div>
        )}
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 dark:bg-gray-700"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6 dark:bg-gray-700"></div>
          <div className="h-4 bg-gray-200 rounded w-3/6 dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
          <p className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Render appropriate chart type
  const renderChart = () => {
    const yKeys = Array.isArray(yKey) ? yKey : [yKey];

    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey={xKey} 
              stroke="#6B7280" 
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6B7280" 
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {yKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ fill: colors[index % colors.length], r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey={xKey} 
              stroke="#6B7280" 
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6B7280" 
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {yKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                radius={[8, 8, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            <defs>
              {yKeys.map((key, index) => (
                <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey={xKey} 
              stroke="#6B7280" 
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6B7280" 
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {yKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                fillOpacity={1}
                fill={`url(#color${key})`}
              />
            ))}
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey={yKeys[0]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
      {title && (
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}