"use client";
export const dynamic = 'force-dynamic';

// app/(customer)/account/addresses/page.js
import { useState, useEffect } from 'react';
import { 
  MapPin,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Home,
  Briefcase,
  User
} from 'lucide-react';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    label: 'home',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    province: '',
    postalCode: '',
    isDefault: false
  });

  // Pakistani cities and provinces
  const provinces = [
    'Punjab',
    'Sindh',
    'Khyber Pakhtunkhwa',
    'Balochistan',
    'Islamabad Capital Territory',
    'Gilgit-Baltistan',
    'Azad Kashmir'
  ];

  const cities = {
    'Punjab': ['Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala', 'Sialkot', 'Bahawalpur', 'Sargodha'],
    'Sindh': ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Mirpur Khas'],
    'Khyber Pakhtunkhwa': ['Peshawar', 'Mardan', 'Abbottabad', 'Swat', 'Kohat'],
    'Balochistan': ['Quetta', 'Gwadar', 'Turbat', 'Khuzdar'],
    'Islamabad Capital Territory': ['Islamabad'],
    'Gilgit-Baltistan': ['Gilgit', 'Skardu'],
    'Azad Kashmir': ['Muzaffarabad', 'Mirpur']
  };

  const addressLabels = [
    { value: 'home', icon: Home, label: 'Home' },
    { value: 'work', icon: Briefcase, label: 'Work' },
    { value: 'other', icon: User, label: 'Other' }
  ];

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockAddresses = [
        {
          id: '1',
          label: 'home',
          fullName: 'Ayesha Khan',
          phone: '+92 302 0718182',
          addressLine1: 'House #123, Street 5',
          addressLine2: 'DHA Phase 5',
          landmark: 'Near McDonald\'s',
          city: 'Lahore',
          province: 'Punjab',
          postalCode: '54000',
          isDefault: true
        },
        {
          id: '2',
          label: 'work',
          fullName: 'Ayesha Khan',
          phone: '+92 302 0718182',
          addressLine1: 'Office #405, 4th Floor',
          addressLine2: 'Packages Mall',
          landmark: 'Near Jalal Sons',
          city: 'Lahore',
          province: 'Punjab',
          postalCode: '54000',
          isDefault: false
        }
      ];
      
      setAddresses(mockAddresses);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+92|0)?3[0-9]{9}$/.test(formData.phone.replace(/\s+/g, ''))) {
      newErrors.phone = 'Invalid Pakistani phone number';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address is required';
    }

    if (!formData.city) {
      newErrors.city = 'City is required';
    }

    if (!formData.province) {
      newErrors.province = 'Province is required';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    } else if (!/^\d{5}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Invalid postal code (5 digits)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingId) {
        // Update existing address
        setAddresses(prev =>
          prev.map(addr => {
            if (addr.id === editingId) {
              return { ...addr, ...formData };
            }
            // If setting as default, unset others
            if (formData.isDefault) {
              return { ...addr, isDefault: false };
            }
            return addr;
          })
        );
        showToast('Address updated successfully!');
      } else {
        // Add new address
        const newAddress = {
          id: Date.now().toString(),
          ...formData
        };

        // If this is the first address or marked as default, set it as default
        if (addresses.length === 0 || formData.isDefault) {
          setAddresses(prev => [
            ...prev.map(addr => ({ ...addr, isDefault: false })),
            { ...newAddress, isDefault: true }
          ]);
        } else {
          setAddresses(prev => [...prev, newAddress]);
        }
        
        showToast('Address added successfully!');
      }
      
      resetForm();
    } catch (error) {
      console.error('Failed to save address:', error);
      alert('Failed to save address. Please try again.');
    }
  };

  const handleEdit = (address) => {
    setFormData(address);
    setEditingId(address.id);
    setShowAddressForm(true);
  };

  const handleDelete = async (id) => {
    const addressToDelete = addresses.find(addr => addr.id === id);
    
    if (addressToDelete?.isDefault && addresses.length > 1) {
      alert('Cannot delete default address. Please set another address as default first.');
      return;
    }

    if (confirm('Are you sure you want to delete this address?')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setAddresses(prev => prev.filter(addr => addr.id !== id));
        showToast('Address deleted successfully!');
      } catch (error) {
        console.error('Failed to delete address:', error);
        alert('Failed to delete address. Please try again.');
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAddresses(prev =>
        prev.map(addr => ({
          ...addr,
          isDefault: addr.id === id
        }))
      );
      
      showToast('Default address updated!');
    } catch (error) {
      console.error('Failed to set default address:', error);
      alert('Failed to update default address. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      label: 'home',
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      city: '',
      province: '',
      postalCode: '',
      isDefault: false
    });
    setEditingId(null);
    setShowAddressForm(false);
    setErrors({});
  };

  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  const getAddressLabel = (label) => {
    const config = addressLabels.find(l => l.value === label);
    return config || addressLabels[2]; // Default to 'other'
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            My Addresses
          </h1>
          <p className="text-gray-600">
            Manage your shipping addresses
          </p>
        </div>
        
        {!showAddressForm && (
          <button
            onClick={() => setShowAddressForm(true)}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Address
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showAddressForm && (
        <div className="mb-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Edit Address' : 'Add New Address'}
            </h2>
            <button
              onClick={resetForm}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {/* Address Label */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Address Type
              </label>
              <div className="flex gap-3">
                {addressLabels.map((labelOption) => {
                  const Icon = labelOption.icon;
                  return (
                    <button
                      key={labelOption.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, label: labelOption.value }))}
                      className={`
                        flex-1 flex flex-col items-center gap-2 px-4 py-3 border-2 rounded-lg transition-all
                        ${formData.label === labelOption.value
                          ? 'border-pink-600 bg-pink-50 text-pink-600'
                          : 'border-gray-300 hover:border-gray-400'
                        }
                      `}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{labelOption.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`
                    w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500
                    ${errors.fullName ? 'border-red-500' : 'border-gray-300'}
                  `}
                  placeholder="Enter full name"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`
                    w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500
                    ${errors.phone ? 'border-red-500' : 'border-gray-300'}
                  `}
                  placeholder="+92 302 0718182"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Address Line 1 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  className={`
                    w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500
                    ${errors.addressLine1 ? 'border-red-500' : 'border-gray-300'}
                  `}
                  placeholder="House/Flat number, Street name"
                />
                {errors.addressLine1 && (
                  <p className="mt-1 text-sm text-red-600">{errors.addressLine1}</p>
                )}
              </div>

              {/* Address Line 2 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Area, Colony, Sector"
                />
              </div>

              {/* Landmark */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Near McDonald's, Opposite Park"
                />
              </div>

              {/* Province */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Province <span className="text-red-500">*</span>
                </label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={(e) => {
                    handleInputChange(e);
                    // Reset city when province changes
                    setFormData(prev => ({ ...prev, city: '' }));
                  }}
                  className={`
                    w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white
                    ${errors.province ? 'border-red-500' : 'border-gray-300'}
                  `}
                >
                  <option value="">Select Province</option>
                  {provinces.map(province => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
                {errors.province && (
                  <p className="mt-1 text-sm text-red-600">{errors.province}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={!formData.province}
                  className={`
                    w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white
                    ${errors.city ? 'border-red-500' : 'border-gray-300'}
                    ${!formData.province ? 'cursor-not-allowed opacity-50' : ''}
                  `}
                >
                  <option value="">Select City</option>
                  {formData.province && cities[formData.province]?.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                )}
              </div>

              {/* Postal Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  maxLength={5}
                  className={`
                    w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500
                    ${errors.postalCode ? 'border-red-500' : 'border-gray-300'}
                  `}
                  placeholder="54000"
                />
                {errors.postalCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
                )}
              </div>
            </div>

            {/* Set as Default */}
            <div className="mt-6 flex items-center gap-3">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleInputChange}
                className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-2 focus:ring-pink-500"
              />
              <label htmlFor="isDefault" className="text-sm font-medium text-gray-700 cursor-pointer">
                Set as default shipping address
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
              >
                <Check className="w-5 h-5" />
                {editingId ? 'Update Address' : 'Save Address'}
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Addresses */}
      {addresses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No addresses saved yet
          </h3>
          <p className="text-gray-600 mb-6">
            Add your first address for faster checkout
          </p>
          {!showAddressForm && (
            <button
              onClick={() => setShowAddressForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Address
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {addresses.map((address) => {
            const labelConfig = getAddressLabel(address.label);
            const Icon = labelConfig.icon;

            return (
              <div
                key={address.id}
                className={`
                  bg-white rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg
                  ${address.isDefault ? 'border-pink-500' : 'border-gray-200'}
                `}
              >
                {/* Card Header */}
                <div className={`
                  px-6 py-4 border-b flex items-center justify-between
                  ${address.isDefault ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200' : 'bg-gray-50 border-gray-200'}
                `}>
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${address.isDefault ? 'bg-pink-100 text-pink-600' : 'bg-gray-200 text-gray-600'}
                    `}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 capitalize">
                        {labelConfig.label}
                      </h3>
                      {address.isDefault && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-pink-600">
                          <Check className="w-3 h-3" />
                          Default Address
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address Details */}
                <div className="p-6">
                  <div className="space-y-2 mb-4">
                    <p className="font-semibold text-gray-900">{address.fullName}</p>
                    <p className="text-gray-600">{address.phone}</p>
                    <p className="text-gray-600">
                      {address.addressLine1}
                      {address.addressLine2 && `, ${address.addressLine2}`}
                    </p>
                    {address.landmark && (
                      <p className="text-sm text-gray-500">
                        Landmark: {address.landmark}
                      </p>
                    )}
                    <p className="text-gray-600">
                      {address.city}, {address.province} - {address.postalCode}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(address)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Help Section */}
      {addresses.length > 0 && (
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            📦 Delivery Information
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Orders are typically delivered within 7-10 business days</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>You will receive tracking details via WhatsApp and email</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Make sure someone is available at the address to receive the delivery</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>For any delivery concerns, contact our support team</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}