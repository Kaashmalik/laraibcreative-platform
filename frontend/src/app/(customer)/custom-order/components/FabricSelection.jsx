import { useState, useEffect } from 'react';
import { ShoppingBag, User, Search, CheckCircle } from 'lucide-react';

/**
 * Fabric Selection Component - Step 3
 * 
 * Allows users to choose:
 * 1. LaraibCreative provides fabric (select from catalog)
 * 2. Customer provides own fabric (describe fabric)
 * 
 * @param {string} fabricSource - Selected fabric source
 * @param {object} selectedFabric - Selected fabric from catalog
 * @param {string} fabricDetails - Details if customer provides
 * @param {function} onChange - Handler for form changes
 * @param {object} errors - Validation errors
 */

// Mock fabric catalog data (will come from API in production)
const FABRIC_CATALOG = [
  {
    id: 1,
    name: 'Premium Lawn',
    type: 'Lawn',
    color: 'White',
    pattern: 'Solid',
    price: 1500,
    pricePerMeter: 500,
    metersIncluded: 3,
    image: '/api/placeholder/200/200',
    description: 'Soft, breathable cotton lawn perfect for summer wear',
    inStock: true,
  },
  {
    id: 2,
    name: 'Embroidered Chiffon',
    type: 'Chiffon',
    color: 'Pink',
    pattern: 'Embroidered',
    price: 3500,
    pricePerMeter: 1200,
    metersIncluded: 3,
    image: '/api/placeholder/200/200',
    description: 'Elegant chiffon with delicate embroidery work',
    inStock: true,
  },
  {
    id: 3,
    name: 'Pure Silk',
    type: 'Silk',
    color: 'Royal Blue',
    pattern: 'Solid',
    price: 5000,
    pricePerMeter: 2000,
    metersIncluded: 2.5,
    image: '/api/placeholder/200/200',
    description: 'Luxurious pure silk with natural shine',
    inStock: true,
  },
  {
    id: 4,
    name: 'Velvet Premium',
    type: 'Velvet',
    color: 'Maroon',
    pattern: 'Solid',
    price: 4000,
    pricePerMeter: 1600,
    metersIncluded: 2.5,
    image: '/api/placeholder/200/200',
    description: 'Rich velvet fabric perfect for winter wear',
    inStock: true,
  },
  {
    id: 5,
    name: 'Cotton Net',
    type: 'Net',
    color: 'Cream',
    pattern: 'Embellished',
    price: 2800,
    pricePerMeter: 900,
    metersIncluded: 3,
    image: '/api/placeholder/200/200',
    description: 'Soft cotton net with subtle embellishments',
    inStock: false,
  },
  {
    id: 6,
    name: 'Organza Jacquard',
    type: 'Organza',
    color: 'Gold',
    pattern: 'Jacquard',
    price: 3200,
    pricePerMeter: 1100,
    metersIncluded: 3,
    image: '/api/placeholder/200/200',
    description: 'Shimmering organza with jacquard weave',
    inStock: true,
  },
];

const FABRIC_TYPES = ['All', 'Lawn', 'Chiffon', 'Silk', 'Velvet', 'Net', 'Organza'];

export default function FabricSelection({
  fabricSource,
  selectedFabric,
  fabricDetails,
  onChange,
  errors,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filteredFabrics, setFilteredFabrics] = useState(FABRIC_CATALOG);

  /**
   * Filter fabrics based on search and type
   */
  useEffect(() => {
    let filtered = FABRIC_CATALOG;

    // Filter by type
    if (filterType !== 'All') {
      filtered = filtered.filter(f => f.type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.color.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredFabrics(filtered);
  }, [searchTerm, filterType]);

  /**
   * Handle fabric source selection
   */
  const handleSourceSelect = (source) => {
    onChange('fabricSource', source);
    
    // Clear selections when switching
    if (source === 'customer-provides') {
      onChange('selectedFabric', null);
    } else {
      onChange('fabricDetails', '');
    }
  };

  /**
   * Handle fabric selection
   */
  const handleFabricSelect = (fabric) => {
    onChange('selectedFabric', fabric);
  };

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select Fabric
        </h2>
        <p className="text-gray-600">
          Choose who will provide the fabric for your custom outfit
        </p>
      </div>

      {/* Fabric Source Selection */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* LC Provides Fabric */}
        <button
          onClick={() => handleSourceSelect('lc-provides')}
          className={`
            p-6 rounded-2xl border-2 transition-all duration-300 text-left
            ${fabricSource === 'lc-provides'
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-300 hover:border-purple-300'
            }
          `}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            {fabricSource === 'lc-provides' && (
              <CheckCircle className="w-6 h-6 text-green-600 fill-current" />
            )}
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            LaraibCreative Provides Fabric
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Choose from our premium fabric collection
          </p>
          <ul className="space-y-1 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              Quality guaranteed fabrics
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              Wide variety of options
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              Fabric cost included in quote
            </li>
          </ul>
        </button>

        {/* Customer Provides Fabric */}
        <button
          onClick={() => handleSourceSelect('customer-provides')}
          className={`
            p-6 rounded-2xl border-2 transition-all duration-300 text-left
            ${fabricSource === 'customer-provides'
              ? 'border-pink-500 bg-pink-50'
              : 'border-gray-300 hover:border-pink-300'
            }
          `}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            {fabricSource === 'customer-provides' && (
              <CheckCircle className="w-6 h-6 text-green-600 fill-current" />
            )}
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            I Will Provide Fabric
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Use your own fabric for stitching
          </p>
          <ul className="space-y-1 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
              Use your preferred fabric
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
              Lower stitching cost
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
              Send fabric to our address
            </li>
          </ul>
        </button>
      </div>

      {/* Error for Fabric Source */}
      {errors.fabricSource && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <p className="text-red-700 text-sm font-medium">{errors.fabricSource}</p>
        </div>
      )}

      {/* Fabric Catalog (If LC Provides) */}
      {fabricSource === 'lc-provides' && (
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search fabrics..."
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-200"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-200"
            >
              {FABRIC_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Fabric Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFabrics.map((fabric) => (
              <button
                key={fabric.id}
                onClick={() => fabric.inStock && handleFabricSelect(fabric)}
                disabled={!fabric.inStock}
                className={`
                  relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                  ${!fabric.inStock ? 'opacity-50 cursor-not-allowed' : ''}
                  ${selectedFabric?.id === fabric.id
                    ? 'border-purple-500 bg-purple-50 shadow-lg'
                    : 'border-gray-300 hover:border-purple-300 hover:shadow-md'
                  }
                `}
              >
                {/* Selection Indicator */}
                {selectedFabric?.id === fabric.id && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle className="w-6 h-6 text-green-600 fill-current" />
                  </div>
                )}

                {/* Out of Stock Badge */}
                {!fabric.inStock && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
                    Out of Stock
                  </div>
                )}

                {/* Fabric Image */}
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                  <img
                    src={fabric.image}
                    alt={fabric.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Fabric Info */}
                <h4 className="font-semibold text-gray-900 mb-1">{fabric.name}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span className="px-2 py-0.5 bg-gray-100 rounded">{fabric.type}</span>
                  <span className="px-2 py-0.5 bg-gray-100 rounded">{fabric.color}</span>
                </div>
                <p className="text-xs text-gray-600 mb-3">{fabric.description}</p>

                {/* Price */}
                <div className="space-y-1">
                  <p className="text-lg font-bold text-purple-600">
                    Rs. {fabric.price.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Rs. {fabric.pricePerMeter}/meter • {fabric.metersIncluded}m included
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* No Results */}
          {filteredFabrics.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No fabrics found matching your criteria</p>
            </div>
          )}

          {/* Error for Fabric Selection */}
          {errors.selectedFabric && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <p className="text-red-700 text-sm font-medium">{errors.selectedFabric}</p>
            </div>
          )}
        </div>
      )}

      {/* Customer Provides Fabric Form */}
      {fabricSource === 'customer-provides' && (
        <div className="space-y-4">
          <div>
            <label className="block">
              <span className="text-gray-900 font-semibold text-lg mb-2 block">
                Describe Your Fabric
              </span>
              <span className="text-gray-600 text-sm block mb-3">
                Tell us about the fabric you'll be providing (type, color, pattern, meters available)
              </span>
              <textarea
                value={fabricDetails}
                onChange={(e) => onChange('fabricDetails', e.target.value)}
                placeholder="Example: I have 3 meters of royal blue chiffon fabric with silver zari work. The fabric is lightweight and perfect for summer wear..."
                rows={6}
                className={`
                  w-full px-4 py-3 border-2 rounded-xl resize-none
                  focus:outline-none focus:ring-4 focus:ring-purple-200
                  transition-all duration-200
                  ${errors.fabricDetails
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-300 focus:border-purple-500'
                  }
                `}
              />
            </label>

            {/* Error */}
            {errors.fabricDetails && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mt-3">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <p className="text-red-700 text-sm font-medium">{errors.fabricDetails}</p>
              </div>
            )}
          </div>

          {/* Delivery Instructions */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h4 className="font-semibold text-gray-900 mb-3">Fabric Delivery Instructions</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Send fabric to our address (provided after order confirmation)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Ensure you have enough fabric (minimum 2.5-3 meters recommended)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Stitching will begin once we receive and inspect the fabric</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>We'll contact you if fabric is insufficient or unsuitable</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}