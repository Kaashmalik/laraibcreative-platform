import React from 'react';
import { Check, Package, Ruler, Sparkles, Image, AlertCircle } from 'lucide-react';
import { FABRIC_OPTIONS, SERVICE_TYPES, GARMENT_STYLES, MEASUREMENT_RANGES } from './measurementData';

/**
 * OrderSummary Component
 * Displays final order summary before submission
 * 
 * @param {Object} orderData - Complete order data object
 * @param {Function} onSubmit - Callback function for order submission
 */
const OrderSummary = ({ orderData, onSubmit }) => {
  const { serviceType, images, fabric, measurements, garmentStyle } = orderData;

  // Get service type details
  const serviceDetails = SERVICE_TYPES.find((s) => s.id === serviceType);
  
  // Get fabric details
  const fabricDetails = FABRIC_OPTIONS.find((f) => f.id === fabric);
  
  // Get garment style details
  const styleDetails = GARMENT_STYLES.find((s) => s.id === garmentStyle);

  // Count total measurements
  const totalMeasurements = Object.keys(measurements || {}).filter(
    (key) => measurements[key] && measurements[key] > 0
  ).length;

  // Calculate estimated price (basic calculation)
  const calculatePrice = () => {
    let basePrice = serviceType === 'custom-stitched' ? 80 : 60;
    const fabricPrice = fabricDetails ? parseInt(fabricDetails.price.replace(/[^0-9]/g, '') || 0) : 0;
    return basePrice + fabricPrice;
  };

  const estimatedPrice = calculatePrice();

  // Format measurement value with label
  const formatMeasurement = (key, value) => {
    const config = MEASUREMENT_RANGES[key];
    return `${config?.label || key}: ${value}"`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Order Summary
        </h2>
        <p className="text-gray-600">
          Review your order details before submitting
        </p>
      </div>

      {/* Main Summary Card */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xl mb-1">LaraibCreative</h3>
              <p className="text-pink-100 text-sm">Custom Order</p>
            </div>
            <Package className="w-10 h-10 opacity-80" />
          </div>
        </div>

        {/* Details Section */}
        <div className="p-6 space-y-4">
          {/* Service Type */}
          <div className="flex items-start justify-between py-4 border-b border-gray-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                {serviceType === 'ready-to-wear' ? (
                  <Package className="w-5 h-5 text-pink-600" />
                ) : (
                  <Ruler className="w-5 h-5 text-pink-600" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Service Type</p>
                <p className="font-semibold text-gray-900">
                  {serviceDetails?.title || 'Not selected'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {serviceDetails?.description}
                </p>
              </div>
            </div>
          </div>

          {/* Garment Style */}
          {styleDetails && (
            <div className="flex items-start justify-between py-4 border-b border-gray-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Garment Style</p>
                  <p className="font-semibold text-gray-900">
                    {styleDetails.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {styleDetails.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Design Images */}
          <div className="flex items-start justify-between py-4 border-b border-gray-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Image className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Design Images</p>
                <p className="font-semibold text-gray-900">
                  {images?.length || 0} image{images?.length !== 1 ? 's' : ''} uploaded
                </p>
              </div>
            </div>
          </div>

          {/* Fabric */}
          <div className="flex items-start justify-between py-4 border-b border-gray-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-lg text-2xl">
                {fabricDetails?.emoji || '✨'}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Fabric</p>
                <p className="font-semibold text-gray-900">
                  {fabricDetails?.name || 'Not selected'}
                </p>
                {fabricDetails && (
                  <p className="text-xs text-gray-500 mt-1">
                    {fabricDetails.description} • {fabricDetails.season}
                  </p>
                )}
              </div>
            </div>
            {fabricDetails && (
              <span className="text-sm font-semibold text-gray-900">
                {fabricDetails.price}
              </span>
            )}
          </div>

          {/* Measurements */}
          <div className="py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">Measurements Provided</p>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                {totalMeasurements} measurements
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Measurements */}
      {totalMeasurements > 0 && (
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-200">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Ruler className="w-5 h-5 text-pink-600" />
            Your Measurements (inches)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(measurements || {})
              .filter(([_, val]) => val && val > 0)
              .map(([key, value]) => (
                <div
                  key={key}
                  className="bg-white rounded-lg p-3 border border-gray-200"
                >
                  <p className="text-xs text-gray-600 mb-1">
                    {MEASUREMENT_RANGES[key]?.label || key}
                  </p>
                  <p className="font-bold text-gray-900 text-lg">
                    {value}"
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Image Thumbnails */}
      {images && images.length > 0 && (
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4">Design References</h3>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
            {images.map((image, index) => (
              <div
                key={image.id || index}
                className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200"
              >
                <img
                  src={image.preview}
                  alt={`Design ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Estimate */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-pink-100 text-sm mb-1">Estimated Price</p>
            <p className="text-3xl font-bold">${estimatedPrice}</p>
            <p className="text-pink-100 text-xs mt-2">
              Final price will be confirmed after review
            </p>
          </div>
          <div className="text-right">
            <p className="text-pink-100 text-sm">Delivery Time</p>
            <p className="text-xl font-bold">
              {serviceType === 'ready-to-wear' ? '3-5 days' : '7-10 days'}
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Message */}
      <div className="flex items-start gap-3 p-5 bg-green-50 rounded-lg border-2 border-green-200">
        <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-green-800">
          <p className="font-semibold mb-2 text-base">Ready to Submit!</p>
          <p className="mb-2">
            Our expert team will review your order and contact you within 24 hours 
            to confirm measurements and discuss any customization details.
          </p>
          <ul className="space-y-1 list-disc list-inside text-xs">
            <li>Order confirmation via email</li>
            <li>Payment details will be shared</li>
            <li>Track your order status online</li>
          </ul>
        </div>
      </div>

      {/* Important Note */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold mb-1">Please Note</p>
          <p>
            Custom orders are non-refundable. Please ensure all measurements 
            and details are correct before submitting.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;