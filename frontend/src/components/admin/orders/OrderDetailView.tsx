/**
 * OrderDetailView Component
 * Complete order details display with items, pricing, and customer info
 */

'use client';


import Image from 'next/image';
import { Package, Ruler, Image as ImageIcon, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import type { Order } from '@/types/order-management';

interface OrderDetailViewProps {
  order: Order;
}

export default function OrderDetailView({ order }: OrderDetailViewProps) {
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
            <div
              key={item._id || index}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex gap-4">
                {/* Product Image */}
                {item.productSnapshot?.primaryImage && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={item.productSnapshot.primaryImage}
                      alt={item.productSnapshot.title || 'Product'}
                      fill
                      sizes="96px"
                      className="object-cover"
                      quality={75}
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPg=="
                    />
                  </div>
                )}

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {item.productSnapshot?.title || 'Product'}
                      </h4>
                      {item.productSnapshot?.sku && (
                        <p className="text-xs text-gray-500 mb-1">
                          SKU: {item.productSnapshot.sku}
                        </p>
                      )}
                      {item.isCustom && (
                        <Badge variant="secondary" className="mt-1">
                          Custom Order
                        </Badge>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(item.subtotal)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                  </div>

                  {/* Custom Order Details */}
                  {item.isCustom && item.customDetails && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                      {item.customDetails.serviceType && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">Service Type:</span>
                          <span className="font-medium text-gray-900 capitalize">
                            {item.customDetails.serviceType.replace('-', ' ')}
                          </span>
                        </div>
                      )}

                      {item.customDetails.fabric && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">Fabric:</span>
                          <span className="font-medium text-gray-900">
                            {item.customDetails.fabric.type || 'N/A'}
                            {item.customDetails.fabric.providedBy && (
                              <span className="text-gray-500 ml-1">
                                ({item.customDetails.fabric.providedBy === 'customer' ? 'Customer provides' : 'LC provides'})
                              </span>
                            )}
                          </span>
                        </div>
                      )}

                      {item.customDetails.measurements && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <Ruler className="w-4 h-4" />
                            <span className="font-medium">Measurements:</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 ml-6">
                            {Object.entries(item.customDetails.measurements).slice(0, 6).map(([key, value]) => (
                              <div key={key}>
                                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>{' '}
                                <span className="font-medium">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {item.customDetails.referenceImages && item.customDetails.referenceImages.length > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <ImageIcon className="w-4 h-4" />
                            <span className="font-medium">Reference Images ({item.customDetails.referenceImages.length})</span>
                          </div>
                          <div className="flex gap-2 flex-wrap ml-6">
                            {item.customDetails.referenceImages.slice(0, 3).map((img, idx) => (
                              <div
                                key={idx}
                                className="relative w-16 h-16 rounded overflow-hidden bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => window.open(img.url, '_blank')}
                              >
                                <Image
                                  src={img.url}
                                  alt={img.caption || 'Reference image'}
                                  fill
                                  sizes="64px"
                                  className="object-cover"
                                  quality={75}
                                />
                              </div>
                            ))}
                            {item.customDetails.referenceImages.length > 3 && (
                              <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                                +{item.customDetails.referenceImages.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {item.customDetails.specialInstructions && (
                        <div className="mt-2">
                          <div className="flex items-start gap-2 text-sm">
                            <FileText className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="text-gray-600 font-medium">Special Instructions:</span>
                              <p className="text-gray-700 mt-1">{item.customDetails.specialInstructions}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {item.customDetails.rushOrder && (
                        <Badge variant="warning" className="mt-2">
                          Rush Order
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(order.pricing.subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping Charges</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(order.pricing.shippingCharges)}
            </span>
          </div>
          {order.pricing.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span className="font-medium">
                - {formatCurrency(order.pricing.discount)}
              </span>
            </div>
          )}
          {order.pricing.tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(order.pricing.tax)}
              </span>
            </div>
          )}
          <div className="pt-2 border-t border-gray-300 flex justify-between">
            <span className="text-base font-semibold text-gray-900">Total</span>
            <span className="text-lg font-bold text-purple-600">
              {formatCurrency(order.pricing.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

