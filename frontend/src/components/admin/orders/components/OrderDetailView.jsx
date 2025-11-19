import React, { useState } from 'react';
import {
  Printer, Edit, X, Phone, MessageCircle, Mail, User,
  MapPin, Package, CreditCard, FileText, Image as ImageIcon,
  Check, XCircle, AlertCircle, ChevronRight, Download
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { ORDER_STATUS } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Textarea from '@/components/ui/Textarea';
import OrderTimeline from './OrderTimeline';
import Lightbox from '@/components/customer/Lightbox';

/**
 * OrderDetailView Component
 * Comprehensive order details display for admin
 * 
 * @component
 * @param {Object} order - Complete order data
 * @param {Function} onUpdateStatus - Callback to update order status
 * @param {Function} onVerifyPayment - Callback to verify payment
 * @param {Function} onRejectPayment - Callback to reject payment
 * @param {Function} onAddNote - Callback to add admin note
 */
const OrderDetailView = ({
  order,
  onUpdateStatus,
  onVerifyPayment,
  onRejectPayment,
  onAddNote
}) => {
  const [noteText, setNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Handle print order
  const handlePrint = () => {
    window.print();
  };

  // Handle add note
  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    
    setIsAddingNote(true);
    try {
      await onAddNote(order.id, noteText);
      setNoteText('');
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setIsAddingNote(false);
    }
  };

  // Handle phone call
  const handlePhoneCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  // Handle WhatsApp
  const handleWhatsApp = (phone, name) => {
    const message = encodeURIComponent(
      `Hello ${name}, regarding your order ${order.orderNumber}`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  // Handle email
  const handleEmail = (email) => {
    window.location.href = `mailto:${email}?subject=Order ${order.orderNumber}`;
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      PENDING_PAYMENT: 'warning',
      PAYMENT_VERIFIED: 'info',
      IN_PROGRESS: 'blue',
      READY_FOR_DELIVERY: 'purple',
      SHIPPED: 'indigo',
      DELIVERED: 'success',
      CANCELLED: 'error',
      REFUNDED: 'gray'
    };
    return colors[status] || 'default';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {order.orderNumber}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant={getStatusColor(order.status)} size="lg">
                  {ORDER_STATUS[order.status]}
                </Badge>
                <span className="text-sm text-gray-600">
                  {formatDate(order.orderDate)}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-1" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={() => onUpdateStatus(order)}>
                <Edit className="w-4 h-4 mr-1" />
                Update Status
              </Button>
              {order.status !== 'CANCELLED' && (
                <Button variant="destructive" size="sm" onClick={() => onUpdateStatus(order, 'CANCELLED')}>
                  <X className="w-4 h-4 mr-1" />
                  Cancel Order
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column (70%) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Items
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">SKU</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Qty</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Price</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {order.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image || '/images/placeholder.png'}
                                alt={item.name}
                                className="w-12 h-12 rounded object-cover"
                                loading="lazy"
                              />
                              <div>
                                <p className="font-medium text-gray-900">{item.name}</p>
                                {item.isCustom && (
                                  <Badge variant="purple" size="sm" className="mt-1">
                                    Custom
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">{item.sku}</td>
                          <td className="px-4 py-4 text-center text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-4 text-right text-sm text-gray-900">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="px-4 py-4 text-right font-medium text-gray-900">
                            {formatCurrency(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>

            {/* Custom Order Details */}
            {order.isCustomOrder && order.customDetails && (
              <Card>
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Custom Order Details
                  </h2>
                  
                  {/* Service Type */}
                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-600">Service Type:</span>
                    <span className="ml-2 text-sm text-gray-900">{order.customDetails.serviceType}</span>
                  </div>

                  {/* Reference Images */}
                  {order.customDetails.referenceImages?.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-600 mb-2">Reference Images:</h3>
                      <div className="grid grid-cols-4 gap-2">
                        {order.customDetails.referenceImages.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setLightboxImage(img)}
                            className="aspect-square rounded-lg overflow-hidden hover:opacity-75 transition-opacity"
                          >
                            <img
                              src={img}
                              alt={`Reference ${idx + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fabric Details */}
                  {order.customDetails.fabric && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Selected Fabric:</h3>
                      <div className="flex items-center gap-3">
                        <img
                          src={order.customDetails.fabric.image}
                          alt={order.customDetails.fabric.name}
                          className="w-16 h-16 rounded object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{order.customDetails.fabric.name}</p>
                          <p className="text-sm text-gray-600">{order.customDetails.fabric.material}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Measurements */}
                  {order.customDetails.measurements && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Measurements:</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries(order.customDetails.measurements).map(([key, value]) => (
                          <div key={key} className="p-3 bg-gray-50 rounded">
                            <p className="text-xs text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                            <p className="text-sm font-medium text-gray-900">{value} inches</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Special Instructions */}
                  {order.customDetails.specialInstructions && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-yellow-900 mb-1">
                            Special Instructions
                          </h3>
                          <p className="text-sm text-yellow-800">
                            {order.customDetails.specialInstructions}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Order Timeline */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Timeline
                </h2>
                <OrderTimeline statusHistory={order.statusHistory} isAdmin={true} />
              </div>
            </Card>

            {/* Admin Notes */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Internal Notes
                  <Badge variant="gray" size="sm">Admin Only</Badge>
                </h2>

                {/* Add Note */}
                <div className="mb-4">
                  <Textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add internal note (not visible to customer)..."
                    rows={3}
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {noteText.length}/500 characters
                    </span>
                    <Button
                      onClick={handleAddNote}
                      disabled={!noteText.trim() || isAddingNote}
                      size="sm"
                    >
                      {isAddingNote ? 'Adding...' : 'Add Note'}
                    </Button>
                  </div>
                </div>

                {/* Notes History */}
                <div className="space-y-3">
                  {order.adminNotes?.map((note, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-sm text-gray-900">
                            {note.addedBy.name}
                          </span>
                          <Badge variant="gray" size="sm">{note.addedBy.role}</Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(note.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.note}</p>
                    </div>
                  ))}
                  
                  {!order.adminNotes?.length && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No internal notes yet
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar Column (30%) */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Customer Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Name</p>
                    <p className="font-medium text-gray-900">{order.customer.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <button
                      onClick={() => handleEmail(order.customer.email)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <Mail className="w-4 h-4" />
                      {order.customer.email}
                    </button>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <button
                      onClick={() => handlePhoneCall(order.customer.phone)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <Phone className="w-4 h-4" />
                      {order.customer.phone}
                    </button>
                  </div>
                  
                  <Button
                    variant="success"
                    size="sm"
                    className="w-full"
                    onClick={() => handleWhatsApp(order.customer.whatsapp || order.customer.phone, order.customer.name)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp Customer
                  </Button>
                  
                  {order.customer.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => window.location.href = `/admin/customers/${order.customer.id}`}
                    >
                      <User className="w-4 h-4 mr-2" />
                      View Profile
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Shipping Address */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </h2>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.area}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.province}
                  </p>
                  <p>{order.shippingAddress.postalCode}</p>
                </div>
                
                {order.shippingAddress.deliveryInstructions && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs font-medium text-blue-900 mb-1">
                      Delivery Instructions:
                    </p>
                    <p className="text-sm text-blue-800">
                      {order.shippingAddress.deliveryInstructions}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Payment Information */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Method:</span>
                    <span className="font-medium text-gray-900">{order.paymentMethod}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                      {order.paymentStatus}
                    </Badge>
                  </div>

                  {order.paymentMethod === 'BANK_TRANSFER' && order.transactionDetails && (
                    <>
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Transaction ID:</p>
                        <p className="font-mono text-sm text-gray-900">{order.transactionDetails.transactionId}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Transaction Date:</p>
                        <p className="text-sm text-gray-900">{formatDate(order.transactionDetails.date)}</p>
                      </div>

                      {order.transactionDetails.receiptImage && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Receipt:</p>
                          <button
                            onClick={() => setLightboxImage(order.transactionDetails.receiptImage)}
                            className="relative group block w-full"
                          >
                            <img
                              src={order.transactionDetails.receiptImage}
                              alt="Payment receipt"
                              className="w-full rounded-lg border border-gray-200"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        </div>
                      )}

                      {order.paymentStatus === 'PENDING' && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="success"
                            size="sm"
                            className="flex-1"
                            onClick={() => onVerifyPayment(order.id)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Verify
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                            onClick={() => onRejectPayment(order.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Card>

            {/* Pricing Breakdown */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Pricing Breakdown
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
                  </div>
                  
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <span className="text-green-600">-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="text-gray-900">{formatCurrency(order.shippingCharges)}</span>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200 flex justify-between">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="font-bold text-lg text-gray-900">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Lightbox for images */}
      {lightboxImage && (
        <Lightbox
          images={[lightboxImage]}
          currentIndex={0}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  );
};

export default OrderDetailView;