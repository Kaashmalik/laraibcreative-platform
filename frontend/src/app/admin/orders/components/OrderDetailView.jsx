'use client';


import { useState } from 'react';
import { Package, Image as ImageIcon, Ruler, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

/**
 * Order Detail View Component
 * Displays complete order information including items, measurements, and references
 */
export default function OrderDetailView({ order }) {
  const [lightboxImage, setLightboxImage] = useState(null);

  // Format currency
  const formatCurrency = (amount) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Order Items */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Order Items ({order.items.length})
        </h3>
        
        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  {item.productSnapshot?.primaryImage ? (
                    <img
                      src={item.productSnapshot.primaryImage}
                      alt={item.productSnapshot.title}
                      className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform"
                      onClick={() => setLightboxImage(item.productSnapshot.primaryImage)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {item.productSnapshot?.title || 'Custom Order'}
                      </h4>
                      {item.productSnapshot?.sku && (
                        <p className="text-xs text-gray-500">SKU: {item.productSnapshot.sku}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {item.isCustom && (
                        <Badge className="bg-purple-100 text-purple-700">Custom</Badge>
                      )}
                      <span className="font-bold text-gray-900">{formatCurrency(item.price)}</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Quantity: <span className="font-medium text-gray-900">{item.quantity}</span></p>
                    {item.fabric && (
                      <p>Fabric: <span className="font-medium text-gray-900">{item.fabric}</span></p>
                    )}
                  </div>

                  {/* Special Instructions */}
                  {item.specialInstructions && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs font-medium text-yellow-800 mb-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Special Instructions
                      </p>
                      <p className="text-sm text-yellow-900">{item.specialInstructions}</p>
                    </div>
                  )}

                  {/* Custom Order Details */}
                  {item.isCustom && (
                    <div className="mt-4 space-y-3">
                      {/* Reference Images */}
                      {item.referenceImages && item.referenceImages.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                            <ImageIcon className="w-4 h-4" />
                            Reference Images ({item.referenceImages.length})
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {item.referenceImages.map((img, imgIndex) => (
                              <div
                                key={imgIndex}
                                className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => setLightboxImage(img)}
                              >
                                <img
                                  src={img}
                                  alt={`Reference ${imgIndex + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Measurements */}
                      {item.measurements && Object.keys(item.measurements).length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                            <Ruler className="w-4 h-4" />
                            Measurements
                          </p>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {/* Upper Body Measurements */}
                              {item.measurements.shirtLength && (
                                <div className="text-xs">
                                  <span className="text-gray-600">Shirt Length:</span>
                                  <span className="ml-1 font-medium text-gray-900">
                                    {item.measurements.shirtLength}"
                                  </span>
                                </div>
                              )}
                              {item.measurements.shoulderWidth && (
                                <div className="text-xs">
                                  <span className="text-gray-600">Shoulder:</span>
                                  <span className="ml-1 font-medium text-gray-900">
                                    {item.measurements.shoulderWidth}"
                                  </span>
                                </div>
                              )}
                              {item.measurements.sleeveLength && (
                                <div className="text-xs">
                                  <span className="text-gray-600">Sleeve:</span>
                                  <span className="ml-1 font-medium text-gray-900">
                                    {item.measurements.sleeveLength}"
                                  </span>
                                </div>
                              )}
                              {item.measurements.bust && (
                                <div className="text-xs">
                                  <span className="text-gray-600">Bust:</span>
                                  <span className="ml-1 font-medium text-gray-900">
                                    {item.measurements.bust}"
                                  </span>
                                </div>
                              )}
                              {item.measurements.waist && (
                                <div className="text-xs">
                                  <span className="text-gray-600">Waist:</span>
                                  <span className="ml-1 font-medium text-gray-900">
                                    {item.measurements.waist}"
                                  </span>
                                </div>
                              )}
                              {item.measurements.hip && (
                                <div className="text-xs">
                                  <span className="text-gray-600">Hip:</span>
                                  <span className="ml-1 font-medium text-gray-900">
                                    {item.measurements.hip}"
                                  </span>
                                </div>
                              )}

                              {/* Lower Body Measurements */}
                              {item.measurements.trouserLength && (
                                <div className="text-xs">
                                  <span className="text-gray-600">Trouser Length:</span>
                                  <span className="ml-1 font-medium text-gray-900">
                                    {item.measurements.trouserLength}"
                                  </span>
                                </div>
                              )}
                              {item.measurements.thigh && (
                                <div className="text-xs">
                                  <span className="text-gray-600">Thigh:</span>
                                  <span className="ml-1 font-medium text-gray-900">
                                    {item.measurements.thigh}"
                                  </span>
                                </div>
                              )}
                              {item.measurements.bottom && (
                                <div className="text-xs">
                                  <span className="text-gray-600">Bottom:</span>
                                  <span className="ml-1 font-medium text-gray-900">
                                    {item.measurements.bottom}"
                                  </span>
                                </div>
                              )}

                              {/* Dupatta */}
                              {item.measurements.dupattaLength && (
                                <div className="text-xs">
                                  <span className="text-gray-600">Dupatta Length:</span>
                                  <span className="ml-1 font-medium text-gray-900">
                                    {item.measurements.dupattaLength}"
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* View All Measurements Button */}
                            <button
                              onClick={() => {
                                // Open modal with full measurements
                                alert('Full measurements modal would open here');
                              }}
                              className="mt-3 text-xs text-purple-600 hover:text-purple-700 font-medium"
                            >
                              View All Measurements →
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Breakdown</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Items Subtotal</span>
            <span className="font-medium text-gray-900">{formatCurrency(order.pricing.subtotal)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping Charges</span>
            <span className="font-medium text-gray-900">{formatCurrency(order.pricing.shippingCharges)}</span>
          </div>

          {order.pricing.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount Applied</span>
              <span className="font-medium">- {formatCurrency(order.pricing.discount)}</span>
            </div>
          )}

          <div className="pt-3 border-t border-gray-200 flex justify-between">
            <span className="text-base font-semibold text-gray-900">Total Amount</span>
            <span className="text-xl font-bold text-purple-600">
              {formatCurrency(order.pricing.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Assigned Tailor */}
      {order.assignedTailor && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Assigned Tailor</h3>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="font-medium text-purple-900">{order.assignedTailor}</p>
          </div>
        </div>
      )}

      {/* Estimated Completion */}
      {order.estimatedCompletion && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Estimated Completion</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              Expected to be completed by{' '}
              <span className="font-bold">
                {new Date(order.estimatedCompletion).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300"
            >
              ✕
            </button>
            <img
              src={lightboxImage}
              alt="Enlarged view"
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}