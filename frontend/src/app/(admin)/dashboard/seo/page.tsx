/**
 * SEO Dashboard Page
 * AI-powered SEO analytics and content optimization dashboard
 */

'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import {
  Search, TrendingUp, AlertTriangle, CheckCircle,
  RefreshCw, Zap, BarChart3, FileText,
  ChevronRight, Star, Target, Sparkles, Eye
} from 'lucide-react';

// API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface SEOProduct {
  productId: string;
  title: string;
  slug: string;
  sku?: string;
  category?: string;
  totalScore: number;
  percentage: number;
  grade: string;
  breakdown: {
    title: { score: number; max: number; issues: string[] };
    description: { score: number; max: number; issues: string[] };
    metaData: { score: number; max: number; issues: string[] };
    keywords: { score: number; max: number; issues: string[] };
    images: { score: number; max: number; issues: string[] };
    content: { score: number; max: number; issues: string[] };
  };
}

interface DashboardData {
  overview: {
    totalProducts: number;
    avgSEOScore: number;
    gradeDistribution: { A: number; B: number; C: number; D: number };
    productsNeedingWork: number;
    optimizedProducts: number;
  };
  needsOptimization: SEOProduct[];
  topPerforming: SEOProduct[];
  commonIssues: { issue: string; count: number; percentage: number }[];
  aiService: {
    configured: boolean;
    activeProvider: string | null;
    message: string;
  };
  recentActivity: Array<{
    productId: string;
    productTitle: string;
    action: string;
    provider: string;
    timestamp: string;
  }>;
}

export default function SEODashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [products, setProducts] = useState<SEOProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'keywords' | 'suggestions'>('overview');
  const [filter, setFilter] = useState({ grade: '', search: '' });
  const [error, setError] = useState<string | null>(null);

  // Get auth token
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Fetch dashboard data
  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/api/v1/admin/seo/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products analysis
  const fetchProducts = async () => {
    try {
      const token = getAuthToken();
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(filter.grade && { grade: filter.grade }),
        ...(filter.search && { search: filter.search })
      });

      const response = await fetch(`${API_BASE}/api/v1/admin/seo/products-analysis?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  // Optimize single product
  const optimizeProduct = async (productId: string, apply: boolean = false) => {
    setOptimizing(productId);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/api/v1/admin/seo/products/${productId}/optimize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ applyChanges: apply })
      });

      if (!response.ok) throw new Error('Optimization failed');

      const data = await response.json();

      if (data.success && apply) {
        // Refresh data after applying changes
        await fetchDashboard();
        await fetchProducts();
      }

      return data;
    } catch (err) {
      console.error('Optimization error:', err);
      throw err;
    } finally {
      setOptimizing(null);
    }
  };

  // Bulk optimize
  const bulkOptimize = async () => {
    if (selectedProducts.length === 0) return;

    setOptimizing('bulk');
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/api/v1/admin/seo/bulk-optimize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productIds: selectedProducts,
          applyChanges: true
        })
      });

      if (!response.ok) throw new Error('Bulk optimization failed');

      const data = await response.json();

      if (data.success) {
        setSelectedProducts([]);
        await fetchDashboard();
        await fetchProducts();
      }
    } catch (err) {
      console.error('Bulk optimization error:', err);
    } finally {
      setOptimizing(null);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    }
  }, [filter, activeTab]);

  // Grade badge color
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800 border-green-200';
      case 'B': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'D': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Score progress bar color
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-600" />
              SEO Dashboard
            </h1>
            <p className="text-gray-600 mt-1">AI-powered content optimization and SEO analytics</p>
          </div>
          <div className="flex items-center gap-3">
            {/* AI Service Status */}
            <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${dashboardData?.aiService.configured
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
              }`}>
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">
                {dashboardData?.aiService.configured
                  ? `AI: ${dashboardData.aiService.activeProvider?.toUpperCase()}`
                  : 'AI Not Configured'}
              </span>
            </div>
            <button
              onClick={() => { fetchDashboard(); fetchProducts(); }}
              className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="flex border-b">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'products', label: 'Products Analysis', icon: FileText },
              { id: 'keywords', label: 'Keywords', icon: Target },
              { id: 'suggestions', label: 'AI Suggestions', icon: Sparkles }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === tab.id
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && dashboardData && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average SEO Score</p>
                    <p className="text-3xl font-bold mt-1 text-purple-600">
                      {dashboardData.overview.avgSEOScore}%
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Products</p>
                    <p className="text-3xl font-bold mt-1">{dashboardData.overview.totalProducts}</p>
                  </div>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Optimized</p>
                    <p className="text-3xl font-bold mt-1 text-green-600">
                      {dashboardData.overview.optimizedProducts}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Needs Work</p>
                    <p className="text-3xl font-bold mt-1 text-orange-600">
                      {dashboardData.overview.productsNeedingWork}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Grade Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Grade Distribution
                </h3>
                <div className="space-y-3">
                  {(['A', 'B', 'C', 'D'] as const).map(grade => {
                    const count = dashboardData.overview.gradeDistribution[grade];
                    const percentage = dashboardData.overview.totalProducts > 0
                      ? Math.round((count / dashboardData.overview.totalProducts) * 100)
                      : 0;
                    return (
                      <div key={grade} className="flex items-center gap-4">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${getGradeColor(grade)}`}>
                          {grade}
                        </span>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getGradeColor(grade).split(' ')[0]}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium w-16 text-right">
                          {count} ({percentage}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Common Issues */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Common Issues
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {dashboardData.commonIssues.slice(0, 8).map((issue, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                      <span className="text-sm text-gray-700">{issue.issue}</span>
                      <span className="text-sm font-medium text-orange-600">
                        {issue.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Products Needing Attention */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-red-500" />
                  Products Needing Optimization
                </h3>
                <button
                  onClick={() => setActiveTab('products')}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Product</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Score</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Grade</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {dashboardData.needsOptimization.slice(0, 5).map(product => (
                      <tr key={product.productId} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900">{product.title}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${getScoreColor(product.percentage)}`}
                                style={{ width: `${product.percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{product.percentage}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(product.grade)}`}>
                            {product.grade}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => optimizeProduct(product.productId, true)}
                            disabled={optimizing === product.productId || !dashboardData.aiService.configured}
                            className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-1 ml-auto"
                          >
                            {optimizing === product.productId ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Sparkles className="w-3 h-3" />
                            )}
                            Optimize
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Filters & Actions */}
            <div className="bg-white rounded-lg p-4 shadow-sm border flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={filter.search}
                    onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
              <select
                value={filter.grade}
                onChange={(e) => setFilter({ ...filter, grade: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Grades</option>
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
                <option value="D">Grade D</option>
              </select>
              {selectedProducts.length > 0 && (
                <button
                  onClick={bulkOptimize}
                  disabled={optimizing === 'bulk'}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {optimizing === 'bulk' ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Optimize Selected ({selectedProducts.length})
                </button>
              )}
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === products.length && products.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts(products.map(p => p.productId));
                          } else {
                            setSelectedProducts([]);
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Product</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Category</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Score</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Grade</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Issues</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map(product => (
                    <tr key={product.productId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.productId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProducts([...selectedProducts, product.productId]);
                            } else {
                              setSelectedProducts(selectedProducts.filter(id => id !== product.productId));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-medium text-gray-900">{product.title}</span>
                          {product.sku && (
                            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {product.category || 'Uncategorized'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getScoreColor(product.percentage)}`}
                              style={{ width: `${product.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-10">{product.percentage}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(product.grade)}`}>
                          {product.grade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-gray-600">
                          {Object.values(product.breakdown).reduce((sum, b) => sum + b.issues.length, 0)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => optimizeProduct(product.productId, true)}
                            disabled={optimizing === product.productId || !dashboardData?.aiService.configured}
                            className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-1"
                            title="Optimize with AI"
                          >
                            {optimizing === product.productId ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Sparkles className="w-3 h-3" />
                            )}
                            Optimize
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No products found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Keywords Tab */}
        {activeTab === 'keywords' && (
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Keywords Analysis</h3>
            <p className="text-gray-600">
              Keywords performance analytics will be displayed here.
              This section tracks keyword usage across products and provides optimization suggestions.
            </p>
          </div>
        )}

        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI-Powered SEO Suggestions
            </h3>
            <p className="text-gray-600 mb-4">
              Get intelligent recommendations to improve your product SEO scores.
            </p>
            {!dashboardData?.aiService.configured && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-800">
                  AI service is not configured. Add GROQ_API_KEY or GEMINI_API_KEY to enable AI features.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}