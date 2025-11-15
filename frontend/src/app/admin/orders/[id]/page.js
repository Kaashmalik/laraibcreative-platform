'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ArrowLeft, Phone, MessageCircle, Mail, MapPin, 
  Download, Printer, Ban, CheckCircle, Clock,
  Package, User, CreditCard, FileText} from 'lucide-react';
import OrderDetailView from '@/components/admin/OrderDetailView';
import PaymentVerification from '@/components/admin/PaymentVerification';
import StatusUpdateModal from '@/components/admin/StatusUpdateModal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

/**
 * Admin Order Detail Page
 * Complete order management interface with all order information
 * Includes customer info, items, measurements, payment verification, and actions
 */
export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id;

  // State management
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [trackingInfo, setTrackingInfo] = useState({
    courierService: '',
    trackingNumber: ''
  });

  // Fetch order details
  const fetchOrderDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch order');
      
      const data = await response.json();
      setOrder(data.order);
    } catch (error) {
      console.error('Error fetching order:', error);
      // Show error toast
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, fetchOrderDetails]);

  // Status configuration
  const statusConfig = {
    'order-received': { label: 'Order Received', color: 'bg-blue-100 text-blue-700' },
    'pending-payment': { label: 'Pending Payment', color: 'bg-orange-100 text-orange-700' },
    'payment-verified': { label: 'Payment Verified', color: 'bg-green-100 text-green-700' },
    'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
    'quality-check': { label: 'Quality Check', color: 'bg-purple-100 text-purple-700' },
    'ready-dispatch': { label: 'Ready for Dispatch', color: 'bg-teal-100 text-teal-700' },
    'out-delivery': { label: 'Out for Delivery', color: 'bg-indigo-100 text-indigo-700' },
    'delivered': { label: 'Delivered', color: 'bg-green-100 text-green-700' },
    'cancelled': { label: 'Cancelled', color: 'bg-red-100 text-red-700' }
  };

  // Update order status
  const handleStatusUpdate = async (newStatus, note) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status: newStatus, note })
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      await fetchOrderDetails();
      setShowStatusModal(false);
      // Show success toast
    } catch (error) {
      console.error('Error updating status:', error);
      // Show error toast
    } finally {
      setUpdating(false);
    }
  };

  // Add admin note
  const handleAddNote = async () => {
    if (!adminNotes.trim()) return;

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ note: adminNotes })
      });

      if (!response.ok) throw new Error('Failed to add note');
      
      await fetchOrderDetails();
      setAdminNotes('');
      // Show success toast
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  // Add tracking information
  const handleAddTracking = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/tracking`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(trackingInfo)
      });

      if (!response.ok) throw new Error('Failed to add tracking');
      
      await fetchOrderDetails();
      setTrackingInfo({ courierService: '', trackingNumber: '' });
      // Show success toast
    } catch (error) {
      console.error('Error adding tracking:', error);
    }
  };

  // Generate invoice
  const handleGenerateInvoice = () => {
    window.open(`/api/admin/orders/${orderId}/invoice`, '_blank');
  };

  // Print order
  const handlePrint = () => {
    window.print();
  };

  // Cancel order
  const handleCancelOrder = async () => {
    const reason = prompt('Please provide a cancellation reason:');
    if (!reason) return;

    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) throw new Error('Failed to cancel order');
      
      await fetchOrderDetails();
      // Show success toast
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  // Contact customer
  const handleWhatsApp = () => {
    const phone = order.customerInfo.whatsapp || order.customerInfo.phone;
    const message = encodeURIComponent(`Hi ${order.customerInfo.name}, regarding your order ${order.orderNumber}`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleCall = () => {
    window.location.href = `tel:${order.customerInfo.phone}`;
  };

  const handleEmail = () => {
    window.location.href = `mailto:${order.customerInfo.email}?subject=Order ${order.orderNumber}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">The order you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/admin/orders')}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const currentStatus = statusConfig[order.status];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/orders')}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  Order {order.orderNumber}
                </h1>
                <Badge className={currentStatus.color}>
                  {currentStatus.label}
                </Badge>
              </div>
              <p className="text-gray-600">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleWhatsApp}
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={handleCall}
                className="flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call
              </Button>
              <Button
                variant="outline"
                onClick={handleEmail}
                className="flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
              <Button
                variant="outline"
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </Button>
              <Button
                onClick={handleGenerateInvoice}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Invoice
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Verification Alert */}
            {order.payment.status === 'pending' && order.payment.method === 'bank-transfer' && (
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-orange-800 mb-1">
                      Payment Verification Required
                    </h3>
                    <p className="text-sm text-orange-700">
                      Customer has uploaded a payment receipt. Please verify and approve.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowPaymentModal(true)}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Verify Payment
                  </Button>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b border-gray-200">
                <div className="flex gap-1 p-2">
                  {[
                    { id: 'overview', label: 'Overview', icon: Package },
                    { id: 'customer', label: 'Customer Info', icon: User },
                    { id: 'payment', label: 'Payment', icon: CreditCard },
                    { id: 'notes', label: 'Internal Notes', icon: FileText }
                  ].map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                          flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                          transition-colors duration-200
                          ${activeTab === tab.id
                            ? 'bg-purple-100 text-purple-700'
                            : 'text-gray-600 hover:bg-gray-50'
                          }
                        `}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <OrderDetailView order={order} />
                )}

                {activeTab === 'customer' && (
                  <div className="space-y-6">
                    {/* Customer Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Full Name</span>
                          <span className="text-sm font-medium text-gray-900">{order.customerInfo.name}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Email</span>
                          <span className="text-sm font-medium text-gray-900">{order.customerInfo.email}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Phone</span>
                          <span className="text-sm font-medium text-gray-900">{order.customerInfo.phone}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-600">WhatsApp</span>
                          <span className="text-sm font-medium text-gray-900">
                            {order.customerInfo.whatsapp || order.customerInfo.phone}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Shipping Address
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-900 font-medium mb-2">
                          {order.shippingAddress.fullAddress}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.shippingAddress.city}, {order.shippingAddress.province}
                        </p>
                        {order.shippingAddress.postalCode && (
                          <p className="text-sm text-gray-600">
                            Postal Code: {order.shippingAddress.postalCode}
                          </p>
                        )}
                        {order.shippingAddress.deliveryInstructions && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Delivery Instructions:</p>
                            <p className="text-sm text-gray-700">{order.shippingAddress.deliveryInstructions}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'payment' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Payment Method</span>
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {order.payment.method.replace('-', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Payment Status</span>
                          <Badge className={
                            order.payment.status === 'verified' ? 'bg-green-100 text-green-700' :
                            order.payment.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }>
                            {order.payment.status}
                          </Badge>
                        </div>
                        {order.payment.transactionId && (
                          <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Transaction ID</span>
                            <span className="text-sm font-medium text-gray-900">{order.payment.transactionId}</span>
                          </div>
                        )}
                        {order.payment.transactionDate && (
                          <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Transaction Date</span>
                            <span className="text-sm font-medium text-gray-900">
                              {new Date(order.payment.transactionDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {order.payment.verifiedAt && (
                          <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-gray-600">Verified At</span>
                            <span className="text-sm font-medium text-gray-900">
                              {new Date(order.payment.verifiedAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Receipt */}
                    {order.payment.receiptImage && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Receipt</h3>
                        <Image
                          src={order.payment.receiptImage}
                          alt="Payment Receipt"
                          width={500}
                          height={700}
                          className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(order.payment.receiptImage, '_blank')}
                        />
                        {order.payment.status === 'pending' && (
                          <Button
                            onClick={() => setShowPaymentModal(true)}
                            className="w-full mt-4"
                          >
                            Verify This Payment
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div className="space-y-6">
                    {/* Add New Note */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Internal Note</h3>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add a note for internal reference..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        rows={4}
                      />
                      <Button
                        onClick={handleAddNote}
                        disabled={!adminNotes.trim()}
                        className="mt-3"
                      >
                        Add Note
                      </Button>
                    </div>

                    {/* Existing Notes */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Note History</h3>
                      {order.notes && order.notes.length > 0 ? (
                        <div className="space-y-3">
                          {order.notes.map((note, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4">
                              <p className="text-sm text-gray-900 mb-2">{note.text}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(note.timestamp).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No notes yet</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Actions & Status */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  onClick={() => setShowStatusModal(true)}
                  className="w-full flex items-center justify-center gap-2"
                  disabled={order.status === 'delivered' || order.status === 'cancelled' || updating}
                >
                  <CheckCircle className="w-4 h-4" />
                  Update Status
                </Button>

                {order.payment.status === 'pending' && (
                  <Button
                    onClick={() => setShowPaymentModal(true)}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    Verify Payment
                  </Button>
                )}

                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                  <Button
                    onClick={handleCancelOrder}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Ban className="w-4 h-4" />
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>

            {/* Tracking Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracking Information</h3>
              {order.tracking?.trackingNumber ? (
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Courier:</span>
                    <span className="font-medium">{order.tracking.courierService}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tracking #:</span>
                    <span className="font-medium">{order.tracking.trackingNumber}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Courier Service (e.g., TCS, Leopards)"
                    value={trackingInfo.courierService}
                    onChange={(e) => setTrackingInfo({...trackingInfo, courierService: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Tracking Number"
                    value={trackingInfo.trackingNumber}
                    onChange={(e) => setTrackingInfo({...trackingInfo, trackingNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <Button
                    onClick={handleAddTracking}
                    size="sm"
                    className="w-full"
                    disabled={!trackingInfo.courierService || !trackingInfo.trackingNumber}
                  >
                    Add Tracking
                  </Button>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">Rs. {order.pricing.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">Rs. {order.pricing.shippingCharges.toLocaleString()}</span>
                </div>
                {order.pricing.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">- Rs. {order.pricing.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200 flex justify-between">
                  <span className="text-base font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-purple-600">
                    Rs. {order.pricing.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Order Timeline
              </h3>
              <div className="space-y-4">
                {order.statusHistory?.map((status, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                        ${index === 0 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}
                      `}>
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      {index < order.statusHistory.length - 1 && (
                        <div className="w-0.5 h-12 bg-gray-200"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium text-gray-900">
                        {statusConfig[status.status]?.label || status.status}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(status.timestamp).toLocaleString()}
                      </p>
                      {status.note && (
                        <p className="text-xs text-gray-600 mt-1">{status.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showStatusModal && (
        <StatusUpdateModal
          currentStatus={order.status}
          orderId={orderId}
          onClose={() => setShowStatusModal(false)}
          onUpdate={handleStatusUpdate}
        />
      )}

      {showPaymentModal && (
        <PaymentVerification
          order={order}
          onClose={() => setShowPaymentModal(false)}
          onVerify={fetchOrderDetails}
        />
      )}
    </div>
  );
}