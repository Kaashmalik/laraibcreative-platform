import { FileText, Zap, User, Mail, Phone, MessageSquare, Info } from 'lucide-react';

/**
 * Order Summary Component - Step 5
 * 
 * Final review of the custom order including:
 * - Service type and design details
 * - Reference images preview
 * - Fabric selection
 * - Measurements summary
 * - Special instructions
 * - Rush order option
 * - Customer contact info
 * - Price breakdown
 * 
 * @param {object} formData - All form data
 * @param {function} onChange - Handler for form changes
 * @param {number} estimatedPrice - Calculated price
 * @param {object} errors - Validation errors
 */

export default function OrderSummary({ formData, onChange, estimatedPrice, errors }) {
  /**
   * Format measurement for display
   */
  const formatMeasurement = (value) => {
    return value ? `${value}"` : 'Not specified';
  };

  /**
   * Get non-empty measurements count
   */
  const getFilledMeasurementsCount = () => {
    const measurements = formData.measurements;
    return Object.values(measurements).filter(v => v && v !== '').length;
  };

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Review Your Order
        </h2>
        <p className="text-gray-600">
          Please review all details before proceeding to checkout
        </p>
      </div>

      {/* Service Type Summary */}
      <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" />
          Service Type
        </h3>
        <div className="space-y-2">
          <p className="text-gray-900 font-medium">
            {formData.serviceType === 'fully-custom' ? 'Fully Custom Design' : 'Brand Article Copy'}
          </p>
          {formData.serviceType === 'fully-custom' && formData.designIdea && (
            <div className="p-3 bg-white rounded-lg border border-purple-200">
              <p className="text-sm text-gray-700 line-clamp-3">{formData.designIdea}</p>
              <button 
                onClick={() => {/* Expand modal */}}
                className="text-xs text-purple-600 hover:underline mt-1"
              >
                Read full description
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reference Images Summary */}
      {formData.serviceType === 'brand-article' && formData.referenceImages.length > 0 && (
        <div className="p-5 bg-white rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">
            Reference Images ({formData.referenceImages.length})
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {formData.referenceImages.map((img, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={img.preview}
                  alt={`Reference ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fabric Summary */}
      <div className="p-5 bg-white rounded-xl border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Fabric</h3>
        {formData.fabricSource === 'lc-provides' && formData.selectedFabric ? (
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
              <img
                src={formData.selectedFabric.image}
                alt={formData.selectedFabric.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{formData.selectedFabric.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">{formData.selectedFabric.type}</span>
                <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">{formData.selectedFabric.color}</span>
              </div>
              <p className="text-sm text-purple-600 font-semibold mt-2">
                Rs. {formData.selectedFabric.price.toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-gray-900 mb-1">Customer Provides Fabric</p>
            <p className="text-sm text-gray-700">{formData.fabricDetails || 'No details provided'}</p>
          </div>
        )}
      </div>

      {/* Measurements Summary */}
      <div className="p-5 bg-white rounded-xl border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">
          Measurements ({getFilledMeasurementsCount()} fields filled)
        </h3>
        
        {formData.useStandardSize ? (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm font-medium text-gray-900">
              Standard Size: <span className="text-green-700 font-bold">{formData.standardSize}</span>
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Standard measurements applied with customizations
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-600 mb-3">Custom measurements provided</p>
        )}

        {/* Key Measurements Display */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">Shirt Length</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatMeasurement(formData.measurements.shirtLength)}
            </p>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">Shoulder</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatMeasurement(formData.measurements.shoulderWidth)}
            </p>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">Bust</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatMeasurement(formData.measurements.bust)}
            </p>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">Waist</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatMeasurement(formData.measurements.waist)}
            </p>
          </div>
        </div>

        <button className="text-sm text-purple-600 hover:underline mt-3 font-medium">
          View all measurements →
        </button>
      </div>

      {/* Special Instructions */}
      <div className="space-y-4">
        <label className="block">
          <span className="text-gray-900 font-semibold text-lg mb-2 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            Special Instructions (Optional)
          </span>
          <span className="text-gray-600 text-sm block mb-3">
            Any specific requirements, preferences, or notes for our tailors
          </span>
          <textarea
            value={formData.specialInstructions}
            onChange={(e) => onChange('specialInstructions', e.target.value)}
            placeholder="Example: Please use matching thread color for stitching. Extra padding on shoulders. I prefer loose fitting around waist..."
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl resize-none focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-200"
          />
          <p className="text-xs text-gray-500 mt-2">
            {formData.specialInstructions.length} characters
          </p>
        </label>
      </div>

      {/* Rush Order Option */}
      <div className="p-5 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.rushOrder}
            onChange={(e) => onChange('rushOrder', e.target.checked)}
            className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500 mt-0.5"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-5 h-5 text-orange-600" />
              <span className="font-semibold text-gray-900">Rush Order (Priority Stitching)</span>
              <span className="px-2 py-0.5 bg-orange-600 text-white text-xs font-semibold rounded">
                +Rs. 1,000
              </span>
            </div>
            <p className="text-sm text-gray-700">
              Get your order completed in 7-10 days instead of regular 15-20 days
            </p>
          </div>
        </label>
      </div>

      {/* Customer Contact Information */}
      <div className="p-5 bg-white rounded-xl border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                value={formData.customerInfo.fullName}
                onChange={(e) => onChange('customerInfo', {
                  ...formData.customerInfo,
                  fullName: e.target.value
                })}
                placeholder="Your full name"
                className={`
                  w-full px-3 py-2 border-2 rounded-lg
                  focus:outline-none focus:ring-4 focus:ring-purple-200
                  ${errors['customerInfo.fullName']
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-300 focus:border-purple-500'
                  }
                `}
              />
            </label>
            {errors['customerInfo.fullName'] && (
              <p className="text-xs text-red-600 mt-1">{errors['customerInfo.fullName']}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </span>
              <input
                type="email"
                value={formData.customerInfo.email}
                onChange={(e) => onChange('customerInfo', {
                  ...formData.customerInfo,
                  email: e.target.value
                })}
                placeholder="your.email@example.com"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-200"
              />
            </label>
          </div>

          {/* Phone */}
          <div>
            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number <span className="text-red-500">*</span>
              </span>
              <input
                type="tel"
                value={formData.customerInfo.phone}
                onChange={(e) => onChange('customerInfo', {
                  ...formData.customerInfo,
                  phone: e.target.value
                })}
                placeholder="03XX-XXXXXXX"
                className={`
                  w-full px-3 py-2 border-2 rounded-lg
                  focus:outline-none focus:ring-4 focus:ring-purple-200
                  ${errors['customerInfo.phone']
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-300 focus:border-purple-500'
                  }
                `}
              />
            </label>
            {errors['customerInfo.phone'] && (
              <p className="text-xs text-red-600 mt-1">{errors['customerInfo.phone']}</p>
            )}
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                WhatsApp Number (for order updates)
              </span>
              <input
                type="tel"
                value={formData.customerInfo.whatsapp}
                onChange={(e) => onChange('customerInfo', {
                  ...formData.customerInfo,
                  whatsapp: e.target.value
                })}
                placeholder="Same as phone or different"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-200"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-300">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-purple-600" />
          Estimated Price Breakdown
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Base Stitching Charge</span>
            <span className="font-semibold text-gray-900">Rs. 2,500</span>
          </div>
          
          {formData.fabricSource === 'lc-provides' && formData.selectedFabric && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Fabric Cost</span>
              <span className="font-semibold text-gray-900">
                Rs. {formData.selectedFabric.price.toLocaleString()}
              </span>
            </div>
          )}

          {formData.rushOrder && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Rush Order Fee</span>
              <span className="font-semibold text-orange-600">+ Rs. 1,000</span>
            </div>
          )}

          <div className="pt-3 border-t-2 border-purple-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total Estimated</span>
              <span className="text-2xl font-bold text-purple-600">
                Rs. {estimatedPrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
          <p className="text-xs text-gray-700">
            <strong>Note:</strong> Final price may vary based on actual fabric used and complexity of design. 
            You'll receive a final quote before payment.
          </p>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            required
            className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 mt-0.5"
          />
          <span className="text-sm text-gray-700">
            I agree to the{' '}
            <a href="/policies/terms" className="text-purple-600 hover:underline font-medium">
              Terms & Conditions
            </a>
            {' '}and{' '}
            <a href="/policies/stitching" className="text-purple-600 hover:underline font-medium">
              Stitching Policy
            </a>
          </span>
        </label>
      </div>
    </div>
  );
}