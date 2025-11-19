"use client";

export const dynamic = 'force-dynamic';

// app/(customer)/account/orders/page.js
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Search,
  Filter,
  Download,
  Eye,
  Package,
  Calendar,
  DollarSign,
  MapPin,
  X,
  ChevronDown
} from 'lucide-react';

// Order Status Badge Component (reusable)
const OrderStatusBadge = ({ status }) => {
  const statusConfig = {
    'pending-payment': {
      label: 'Pending Payment',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      dot: 'bg-yellow-500'
    },
    'payment-verified': {
      label: 'Payment Verified',
      className: 'bg-blue-100 text-blue-800 border-blue-200',
      dot: 'bg-blue-500'
    },
    'in-progress': {
      label: 'In Progress',
      className: 'bg-purple-100 text-purple-800 border-purple-200',
      dot: 'bg-purple-500'
    },
    'ready': {
      label: 'Ready',
      className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      dot: 'bg-indigo-500'
    },
    'shipped': {
      label: 'Shipped',
      className: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      dot: 'bg-cyan-500'
    },
    'delivered': {
      label: 'Delivered',
      className: 'bg-green-100 text-green-800 border-green-200',
      dot: 'bg-green-500'
    },
    'cancelled': {
      label: 'Cancelled',
      className: 'bg-red-100 text-red-800 border-red-200',
      dot: 'bg-red-500'
    }
  };

  const config = statusConfig[status] || statusConfig['pending-payment'];

  return (
    <span className={`
      inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold
      border ${config.className}
    `}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  // Filter options
  const statusFilters = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending-payment', label: 'Pending Payment' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const filterAndSortOrders = useCallback(() => {
    let filtered = [...orders];

    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => 
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.date) - new Date(a.date);
      } else if (sortBy === 'oldest') {
        return new Date(a.date) - new Date(b.date);
      } else if (sortBy === 'highest') {
        return b.total - a.total;
      } else if (sortBy === 'lowest') {
        return a.total - b.total;
      }
      return 0;
    });

    setFilteredOrders(filtered);
  }, [orders, searchQuery, selectedStatus, sortBy]);

  useEffect(() => {
    filterAndSortOrders();
  }, [filterAndSortOrders]);

  const fetchOrders = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockOrders = [
        {
          id: 'LC-2025-0156',
          date: '2025-10-08',
          items: [
            {
              name: 'Custom Bridal Suit',
              image: '/images/placeholder.png',
              quantity: 1,
              price: 8500
            }
          ],
          total: 8500,
          status: 'in-progress',
          estimatedDelivery: '2025-10-15',
          shippingAddress: 'House #123, DHA Phase 5, Lahore'
        },
        {
          id: 'LC-2025-0142',
          date: '2025-10-01',
          items: [
            {
              name: 'Velvet Party Suit',
              image: '/images/placeholder.png',
              quantity: 1,
              price: 6500
            }
          ],
          total: 6500,
          status: 'delivered',
          deliveredDate: '2025-10-07',
          shippingAddress: 'Flat 4B, Gulberg III, Lahore'
        },
        {
          id: 'LC-2025-0138',
          date: '2025-09-28',
          items: [
            {
              name: 'Lawn Suit - 3 Piece',
              image: '/images/placeholder.png',
              quantity: 2,
              price: 5500
            },
            {
              name: 'Chiffon Dupatta',
              image: '/images/placeholder.png',
              quantity: 1,
              price: 1000
            }
          ],
          total: 12000,
          status: 'delivered',
          deliveredDate: '2025-10-05',
          shippingAddress: 'House #45, Model Town, Lahore'
        },
        {
          id: 'LC-2025-0120',
          date: '2025-09-15',
          items: [
            {
              name: 'Designer Replica Suit',
              image: '/images/placeholder.png',
              quantity: 1,
              price: 9500
            }
          ],
          total: 9500,
          status: 'pending-payment',
          shippingAddress: 'House #67, Johar Town, Lahore'
        }
      ];
      
      setOrders(mockOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownloadInvoice = (orderId) => {
    // Simulate invoice download
    alert(`Downloading invoice for ${orderId}`);
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-12 bg-gray-200 rounded" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          My Orders
        </h1>
        <p className="text-gray-600">
          View and track all your orders
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order number or product..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Filter Toggle (Mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filters */}
        <div className={`
          ${showFilters ? 'block' : 'hidden'} sm:flex
          flex-col sm:flex-row gap-3
        `}>
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
          >
            {statusFilters.map(filter => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </select>

          {/* Clear Filters */}
          {(selectedStatus !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedStatus('all');
                setSearchQuery('');
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Orders Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing <span className="font-semibold text-gray-900">{filteredOrders.length}</span> order{filteredOrders.length !== 1 ? 's' : ''}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || selectedStatus !== 'all' ? 'No orders found' : 'No orders yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || selectedStatus !== 'all' 
              ? 'Try adjusting your filters'
              : 'Start shopping to see your orders here'
            }
          </p>
          {!searchQuery && selectedStatus === 'all' && (
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
            >
              <Package className="w-5 h-5" />
              Start Shopping
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Order Header */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {order.id}
                    </h3>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(order.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="px-6 py-4">
                <div className="space-y-3 mb-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Address */}
                <div className="flex items-start gap-2 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{order.shippingAddress}</span>
                </div>

                {/* Delivery Info */}
                {order.estimatedDelivery && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4">
                    <p className="text-sm text-blue-900">
                      <strong>Estimated Delivery:</strong> {formatDate(order.estimatedDelivery)}
                    </p>
                  </div>
                )}

                {order.deliveredDate && (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4">
                    <p className="text-sm text-green-900">
                      <strong>Delivered on:</strong> {formatDate(order.deliveredDate)}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
                  >
                    <Eye className="w-5 h-5" />
                    View Details
                  </Link>
                  
                  <Link
                    href={`/track-order/${order.id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-pink-600 text-pink-600 font-medium rounded-lg hover:bg-pink-50 transition-colors"
                  >
                    <Package className="w-5 h-5" />
                    Track Order
                  </Link>
                  
                  <button
                    onClick={() => handleDownloadInvoice(order.id)}
                    className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Invoice
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More / Pagination (if needed) */}
      {filteredOrders.length > 0 && filteredOrders.length < orders.length && (
        <div className="mt-8 text-center">
          <button className="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
            Load More Orders
          </button>
        </div>
      )}
    </div>
  );
}