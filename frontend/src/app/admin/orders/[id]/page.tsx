/**
 * Admin Order Detail Page
 * Complete order management interface with all features
 */

'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Phone, MessageCircle, Mail, MapPin, 
  Download, Printer, Ban, CheckCircle, Clock,
  Package, User, CreditCard, FileText, Edit2, X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import Input from '@/components/ui/Input';
import OrderDetailView from '@/components/admin/orders/OrderDetailView';
import PaymentVerification from '@/components/admin/orders/PaymentVerification';
import StatusUpdateModal from '@/components/admin/orders/StatusUpdateModal';
import OrderTimeline from '@/components/admin/orders/OrderTimeline';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Order, OrderStatus, StatusUpdateRequest, PaymentVerificationRequest, CancelOrderRequest, AdminNoteRequest, TrackingUpdate, ShippingAddressUpdate } from '@/types/order-management';

const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
  'pending-payment': { label: 'Pending Payment', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  'payment-verified': { label: 'Payment Verified', color: 'text-green-700', bgColor: 'bg-green-100' },
  'material-arranged': { label: 'Material Arranged', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  'in-progress': { label: 'In Progress', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  'quality-check': { label: 'Quality Check', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
  'ready-dispatch': { label: 'Ready for Dispatch', color: 'text-teal-700', bgColor: 'bg-teal-100' },
  'dispatched': { label: 'Dispatched', color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
  'delivered': { label: 'Delivered', color: 'text-green-700', bgColor: 'bg-green-100' },
  'cancelled': { label: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-100' },
  'refunded': { label: 'Refunded', color: 'text-gray-700', bgColor: 'bg-gray-100' },
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showEditAddress, setShowEditAddress] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [trackingInfo, setTrackingInfo] = useState<TrackingUpdate>({
    courierService: '',
    trackingNumber: '',
    trackingUrl: '',
  });
  const [shippingAddress, setShippingAddress] = useState<ShippingAddressUpdate>({
    addressLine1: '',
    addressLine2: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Pakistan',
    deliveryInstructions: '',
    contactName: '',
    contactPhone: '',
  });

  // Fetch order details
  const fetchOrderDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.orders.admin.getById(orderId) as { order: Order };
      setOrder(response.order);
    } catch (error: any) {
      console.error('Error fetching order:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch order');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, fetchOrderDetails]);

  // Load shipping address when order loads
  useEffect(() => {
    if (order?.shippingAddress) {
      setShippingAddress({
        addressLine1: order.shippingAddress.addressLine1 || order.shippingAddress.fullAddress || '',
        addressLine2: order.shippingAddress.addressLine2 || '',
        city: order.shippingAddress.city || '',
        province: order.shippingAddress.province || '',
        postalCode: order.shippingAddress.postalCode || '',
        country: order.shippingAddress.country || 'Pakistan',
        deliveryInstructions: order.shippingAddress.deliveryInstructions || '',
        contactName: order.shippingAddress.contactName || '',
        contactPhone: order.shippingAddress.contactPhone || '',
      });
    }
  }, [order]);

  // Update order status
  const handleStatusUpdate = async (data: StatusUpdateRequest) => {
    setUpdating(true);
    try {
      await api.orders.admin.updateStatus(orderId, data);
      toast.success('Order status updated successfully');
      await fetchOrderDetails();
      setShowStatusModal(false);
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  // Verify payment
  const handlePaymentVerification = async (data: PaymentVerificationRequest) => {
    setUpdating(true);
    try {
      await api.orders.admin.verifyPayment(orderId, data);
      toast.success(data.verified ? 'Payment verified successfully' : 'Payment rejected');
      await fetchOrderDetails();
      setShowPaymentModal(false);
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      toast.error(error.response?.data?.message || 'Failed to verify payment');
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  // Add admin note
  const handleAddNote = async () => {
    if (!adminNotes.trim()) {
      toast.error('Please enter a note');
      return;
    }

    try {
      const data: AdminNoteRequest = {
        text: adminNotes.trim(),
        isImportant: false,
      };
      await api.orders.admin.addNote(orderId, data);
      toast.success('Note added successfully');
      await fetchOrderDetails();
      setAdminNotes('');
    } catch (error: any) {
      console.error('Error adding note:', error);
      toast.error(error.response?.data?.message || 'Failed to add note');
    }
  };

  // Update tracking
  const handleUpdateTracking = async () => {
    if (!trackingInfo.courierService || !trackingInfo.trackingNumber) {
      toast.error('Please provide courier service and tracking number');
      return;
    }

    setUpdating(true);
    try {
      await api.orders.admin.updateTracking(orderId, trackingInfo);
      toast.success('Tracking information updated');
      await fetchOrderDetails();
      setTrackingInfo({ courierService: '', trackingNumber: '', trackingUrl: '' });
    } catch (error: any) {
      console.error('Error updating tracking:', error);
      toast.error(error.response?.data?.message || 'Failed to update tracking');
    } finally {
      setUpdating(false);
    }
  };

  // Update shipping address
  const handleUpdateShippingAddress = async () => {
    if (!shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.province) {
      toast.error('Please fill in all required address fields');
      return;
    }

    setUpdating(true);
    try {
      await api.orders.admin.updateShippingAddress(orderId, shippingAddress);
      toast.success('Shipping address updated');
      await fetchOrderDetails();
      setShowEditAddress(false);
    } catch (error: any) {
      console.error('Error updating address:', error);
      toast.error(error.response?.data?.message || 'Failed to update address');
    } finally {
      setUpdating(false);
    }
  };

  // Cancel order
  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    setUpdating(true);
    try {
      const data: CancelOrderRequest = {
        reason: cancelReason.trim(),
        refundAmount: refundAmount ? parseFloat(refundAmount) : undefined,
        notifyCustomer: true,
      };
      await api.orders.admin.cancel(orderId, data);
      toast.success('Order cancelled successfully');
      await fetchOrderDetails();
      setShowCancelModal(false);
      setCancelReason('');
      setRefundAmount('');
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setUpdating(false);
    }
  };

  // Process refund
  const handleProcessRefund = async () => {
    const reason = prompt('Please provide a refund reason:');
    if (!reason) return;

    const amount = prompt('Enter refund amount (PKR):');
    if (!amount || isNaN(parseFloat(amount))) {
      toast.error('Please enter a valid refund amount');
      return;
    }

    setUpdating(true);
    try {
      await api.orders.admin.processRefund(orderId, {
        reason: reason.trim(),
        amount: parseFloat(amount),
        notifyCustomer: true,
      });
      toast.success('Refund processed successfully');
      await fetchOrderDetails();
    } catch (error: any) {
      console.error('Error processing refund:', error);
      toast.error(error.response?.data?.message || 'Failed to process refund');
    } finally {
      setUpdating(false);
    }
  };

  // Download invoice
  const handleDownloadInvoice = async () => {
    try {
      const blob = await api.orders.admin.downloadInvoice(orderId) as Blob;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${order?.orderNumber || orderId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Invoice downloaded');
    } catch (error: any) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  // Send notification
  const handleSendNotification = async (channels: string[] = ['email', 'whatsapp']) => {
    const message = prompt('Enter notification message:');
    if (!message) return;

    try {
      await api.orders.admin.sendNotification(orderId, {
        type: 'custom',
        message: message.trim(),
        channels,
      });
      toast.success('Notification sent successfully');
    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    }
  };

  // Contact customer
  const handleWhatsApp = () => {
    if (!order) return;
    const phone = order.customerInfo.whatsapp || order.customerInfo.phone;
    const message = encodeURIComponent(`Hi ${order.customerInfo.name}, regarding your order ${order.orderNumber}`);
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  };

  const handleCall = () => {
    if (!order) return;
    window.location.href = `tel:${order.customerInfo.phone}`;
  };

  const handleEmail = () => {
    if (!order) return;
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
          <Button onClick={() => router.push('/admin/orders')} ariaLabel="Back to orders list">
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const currentStatus = statusConfig[order.status] || statusConfig['pending-payment'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/orders')}
            className="mb-4 flex items-center gap-2"
            ariaLabel="Back to orders list"
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
                <Badge className={`${currentStatus.bgColor} ${currentStatus.color} border-0`}>
                  {currentStatus.label}
                </Badge>
              </div>
              <p className="text-gray-600">
                Placed on {formatDate(order.createdAt, 'medium')}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleWhatsApp}
                className="flex items-center gap-2"
                ariaLabel="Contact customer via WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={handleCall}
                className="flex items-center gap-2"
                ariaLabel="Call customer"
              >
                <Phone className="w-4 h-4" />
                Call
              </Button>
              <Button
                variant="outline"
                onClick={handleEmail}
                className="flex items-center gap-2"
                ariaLabel="Email customer"
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="flex items-center gap-2"
                ariaLabel="Print order details"
              >
                <Printer className="w-4 h-4" />
                Print
              </Button>
              <Button
                onClick={handleDownloadInvoice}
                className="flex items-center gap-2"
                ariaLabel="Download invoice"
              >
                <Download className="w-4 h-4" />
                Invoice
              </Button>
            </div>
          </div>
        </div>

        {/* Payment Verification Alert */}
        {order.payment.status === 'pending' && order.payment.method === 'bank-transfer' && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg mb-6">
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
                ariaLabel="Verify payment"
              >
                Verify Payment
              </Button>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
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
                {activeTab === 'overview' && order && (
                  <OrderDetailView order={order} />
                )}

                {activeTab === 'customer' && order && (
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
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <MapPin className="w-5 h-5" />
                          Shipping Address
                        </h3>
                        {!['dispatched', 'delivered'].includes(order.status) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowEditAddress(!showEditAddress)}
                            className="flex items-center gap-2"
                            ariaLabel={showEditAddress ? "Cancel editing address" : "Edit shipping address"}
                          >
                            <Edit2 className="w-4 h-4" />
                            {showEditAddress ? 'Cancel' : 'Edit'}
                          </Button>
                        )}
                      </div>

                      {showEditAddress ? (
                        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Address Line 1 <span className="text-red-500">*</span>
                            </label>
                            <Input
                              value={shippingAddress.addressLine1}
                              onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                            <Input
                              value={shippingAddress.addressLine2}
                              onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine2: e.target.value })}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                City <span className="text-red-500">*</span>
                              </label>
                              <Input
                                value={shippingAddress.city}
                                onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Province <span className="text-red-500">*</span>
                              </label>
                              <Input
                                value={shippingAddress.province}
                                onChange={(e) => setShippingAddress({ ...shippingAddress, province: e.target.value })}
                                required
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                              <Input
                                value={shippingAddress.postalCode}
                                onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                              <Input
                                value={shippingAddress.country}
                                onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                              />
                            </div>
                          </div>
                          <div>
                            <Textarea
                              label="Delivery Instructions"
                              value={shippingAddress.deliveryInstructions || ''}
                              onChange={(e) => setShippingAddress({ ...shippingAddress, deliveryInstructions: e.target.value })}
                              placeholder="Enter delivery instructions"
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button
                              onClick={handleUpdateShippingAddress}
                              disabled={updating}
                              className="flex-1"
                              ariaLabel="Save shipping address"
                            >
                              {updating ? 'Updating...' : 'Save Address'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowEditAddress(false)}
                              disabled={updating}
                              ariaLabel="Cancel editing address"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-900 font-medium mb-2">
                            {order.shippingAddress.addressLine1 || order.shippingAddress.fullAddress}
                          </p>
                          {order.shippingAddress.addressLine2 && (
                            <p className="text-sm text-gray-900 mb-2">{order.shippingAddress.addressLine2}</p>
                          )}
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
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'payment' && order && (
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
                        {order.payment.verifiedAt && (
                          <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-gray-600">Verified At</span>
                            <span className="text-sm font-medium text-gray-900">
                              {formatDate(order.payment.verifiedAt, 'short')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Receipt */}
                    {order.payment.receiptImage && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Payment Receipt</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const receiptUrl = typeof order.payment.receiptImage === 'string' 
                                ? order.payment.receiptImage 
                                : order.payment.receiptImage?.url || '';
                              window.open(receiptUrl, '_blank');
                            }}
                            className="flex items-center gap-2"
                            ariaLabel="Open receipt in new tab"
                          >
                            <Download className="w-4 h-4" />
                            Open Full Size
                          </Button>
                        </div>
                        <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300">
                          <img
                            src={typeof order.payment.receiptImage === 'string' 
                              ? order.payment.receiptImage 
                              : order.payment.receiptImage?.url || ''}
                            alt="Payment Receipt"
                            className="w-full h-full object-contain cursor-zoom-in hover:opacity-90 transition-opacity"
                            onClick={() => {
                              const receiptUrl = typeof order.payment.receiptImage === 'string' 
                                ? order.payment.receiptImage 
                                : order.payment.receiptImage?.url || '';
                              window.open(receiptUrl, '_blank');
                            }}
                          />
                          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                            Click to enlarge
                          </div>
                        </div>
                        {order.payment.status === 'pending' && (
                          <Button
                            onClick={() => setShowPaymentModal(true)}
                            className="w-full mt-4"
                            ariaLabel="Verify this payment"
                          >
                            Verify This Payment
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'notes' && order && (
                  <div className="space-y-6">
                    {/* Add New Note */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Internal Note</h3>
                      <Textarea
                        label="Internal Note"
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add a note for internal reference..."
                        rows={4}
                        maxLength={1000}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                          {adminNotes.length}/1000 characters
                        </p>
                        <Button
                          onClick={handleAddNote}
                          disabled={!adminNotes.trim()}
                          className="mt-3"
                          ariaLabel="Add admin note"
                        >
                          Add Note
                        </Button>
                      </div>
                    </div>

                    {/* Existing Notes */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Note History</h3>
                      {order.notes && order.notes.length > 0 ? (
                        <div className="space-y-3">
                          {order.notes.map((note, index) => (
                            <div key={note._id || index} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <p className="text-sm text-gray-900">{note.text}</p>
                                {note.isImportant && (
                                  <Badge variant="warning" className="ml-2">Important</Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                {formatDate(note.timestamp, 'short')}
                                {typeof note.addedBy === 'object' && note.addedBy && 'fullName' in note.addedBy && (
                                  <span> • by {(note.addedBy as any).fullName}</span>
                                )}
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
                  ariaLabel="Update order status"
                >
                  <CheckCircle className="w-4 h-4" />
                  Update Status
                </Button>

                {order.payment.status === 'pending' && (
                  <Button
                    onClick={() => setShowPaymentModal(true)}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    ariaLabel="Verify payment"
                  >
                    <CreditCard className="w-4 h-4" />
                    Verify Payment
                  </Button>
                )}

                {order.payment.status === 'verified' && order.status !== 'refunded' && (
                  <Button
                    onClick={handleProcessRefund}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    disabled={updating}
                    ariaLabel="Process refund"
                  >
                    <FileText className="w-4 h-4" />
                    Process Refund
                  </Button>
                )}

                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                  <Button
                    onClick={() => setShowCancelModal(true)}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                    ariaLabel="Cancel order"
                  >
                    <Ban className="w-4 h-4" />
                    Cancel Order
                  </Button>
                )}

                <Button
                  onClick={() => handleSendNotification(['email'])}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  ariaLabel="Send email notification"
                >
                  Send Email
                </Button>

                <Button
                  onClick={() => handleSendNotification(['whatsapp'])}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  ariaLabel="Send WhatsApp notification"
                >
                  Send WhatsApp
                </Button>
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
                  {order.tracking.trackingUrl && (
                    <div className="mt-3">
                      <a
                        href={order.tracking.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 hover:underline"
                      >
                        Track Package →
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Courier Service <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., TCS, Leopards"
                      value={trackingInfo.courierService}
                      onChange={(e) => setTrackingInfo({...trackingInfo, courierService: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tracking Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Tracking number"
                      value={trackingInfo.trackingNumber}
                      onChange={(e) => setTrackingInfo({...trackingInfo, trackingNumber: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tracking URL (Optional)
                    </label>
                    <Input
                      type="url"
                      placeholder="https://..."
                      value={trackingInfo.trackingUrl}
                      onChange={(e) => setTrackingInfo({...trackingInfo, trackingUrl: e.target.value})}
                    />
                  </div>
                  <Button
                    onClick={handleUpdateTracking}
                    size="sm"
                    className="w-full"
                    disabled={!trackingInfo.courierService || !trackingInfo.trackingNumber || updating}
                    ariaLabel="Update tracking information"
                  >
                    {updating ? 'Updating...' : 'Add Tracking'}
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
                  <span className="font-medium">{formatCurrency(order.pricing.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{formatCurrency(order.pricing.shippingCharges)}</span>
                </div>
                {order.pricing.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">- {formatCurrency(order.pricing.discount)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200 flex justify-between">
                  <span className="text-base font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-purple-600">
                    {formatCurrency(order.pricing.total)}
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
              {order.statusHistory && order.statusHistory.length > 0 ? (
                <OrderTimeline order={order} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">No timeline events yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showStatusModal && (
        <StatusUpdateModal
          isOpen={showStatusModal}
          currentStatus={order.status}
          orderNumber={order.orderNumber}
          onClose={() => setShowStatusModal(false)}
          onUpdate={handleStatusUpdate}
        />
      )}

      {showPaymentModal && order && (
        <PaymentVerification
          isOpen={showPaymentModal}
          order={order}
          onClose={() => setShowPaymentModal(false)}
          onVerify={handlePaymentVerification}
        />
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowCancelModal(false)} />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Cancel Order</h3>
                  <button onClick={() => setShowCancelModal(false)} className="text-gray-400 hover:text-gray-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">Order #{order.orderNumber}</p>
              </div>
              <div className="px-6 py-4">
                <div className="mb-4">
                  <Textarea
                    label="Cancellation Reason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Please provide a reason for cancellation..."
                    rows={4}
                    required
                    maxLength={500}
                  />
                </div>
                {order.payment.status === 'verified' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Refund Amount (PKR) - Optional
                    </label>
                    <Input
                      type="number"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      placeholder="Enter refund amount"
                      min="0"
                      max={order.pricing.total}
                    />
                  </div>
                )}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button variant="outline" onClick={() => setShowCancelModal(false)} ariaLabel="Cancel order cancellation">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCancelOrder}
                    disabled={!cancelReason.trim() || updating}
                    className="bg-red-600 hover:bg-red-700"
                    ariaLabel="Cancel this order"
                  >
                    {updating ? 'Cancelling...' : 'Cancel Order'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

