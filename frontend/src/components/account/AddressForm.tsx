'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Plus, Trash2, Save, Loader2, CheckCircle2 } from 'lucide-react'
import axiosInstance from '@/lib/axios'
import { toast } from 'react-hot-toast'

interface Address {
  _id?: string
  label: string
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  province: string
  postalCode: string
  isDefault: boolean
}

const PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Gilgit-Baltistan',
  'Azad Kashmir',
  'Islamabad Capital Territory'
]

const CITIES = [
  'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Other'
]

export default function AddressForm({ onSuccess }: { onSuccess?: () => void }) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState<Address>({
    label: 'Home',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: 'Lahore',
    province: 'Punjab',
    postalCode: '',
    isDefault: false
  })

  const loadAddresses = async () => {
    try {
      const response = await axiosInstance.get('/auth/addresses')
      setAddresses(response.data || [])
    } catch (error: any) {
      toast.error('Failed to load addresses')
    }
  }

  useEffect(() => {
    loadAddresses()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (editingId) {
        await axiosInstance.put(`/auth/addresses/${editingId}`, formData)
        toast.success('Address updated successfully!')
      } else {
        await axiosInstance.post('/auth/addresses', formData)
        toast.success('Address added successfully!')
      }

      setIsSuccess(true)
      setShowForm(false)
      setEditingId(null)
      resetForm()
      loadAddresses()

      if (onSuccess) onSuccess()

      setTimeout(() => setIsSuccess(false), 3000)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save address')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (address: Address) => {
    setFormData(address)
    setEditingId(address._id || null)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    try {
      await axiosInstance.delete(`/auth/addresses/${id}`)
      toast.success('Address deleted successfully!')
      loadAddresses()
    } catch (error: any) {
      toast.error('Failed to delete address')
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      await axiosInstance.patch(`/auth/addresses/${id}/default`)
      toast.success('Default address updated!')
      loadAddresses()
    } catch (error: any) {
      toast.error('Failed to set default address')
    }
  }

  const resetForm = () => {
    setFormData({
      label: 'Home',
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: 'Lahore',
      province: 'Punjab',
      postalCode: '',
      isDefault: false
    })
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    resetForm()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Saved Addresses</h3>
        <button
          onClick={() => {
            resetForm()
            setEditingId(null)
            setShowForm(true)
          }}
          className="flex items-center px-4 py-2 border border-primary-gold rounded-lg text-sm font-medium text-primary-gold hover:bg-primary-gold hover:text-white transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Address
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Label
                </label>
                <select
                  name="label"
                  value={formData.label}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                >
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                  placeholder="03001234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  required
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                  placeholder="54000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 1
              </label>
              <input
                type="text"
                name="addressLine1"
                required
                value={formData.addressLine1}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 2 <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                placeholder="Apartment, suite, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                >
                  {CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Province
                </label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                >
                  {PROVINCES.map(province => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
                className="h-4 w-4 text-primary-gold focus:ring-primary-gold border-gray-300 rounded"
              />
              <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                Set as default address
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-gold hover:bg-primary-rose transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editingId ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingId ? 'Update' : 'Add'} Address
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="space-y-4">
        {addresses.map(address => (
          <motion.div
            key={address._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 hover:border-primary-gold transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {address.label}
                  </span>
                  {address.isDefault && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-gold text-white">
                      Default
                    </span>
                  )}
                </div>
                <p className="font-medium text-gray-900">{address.fullName}</p>
                <p className="text-sm text-gray-600">{address.phone}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {address.addressLine1}
                  {address.addressLine2 && `, ${address.addressLine2}`}
                </p>
                <p className="text-sm text-gray-600">
                  {address.city}, {address.province} {address.postalCode}
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address._id!)}
                    className="p-2 text-gray-400 hover:text-primary-gold transition-colors"
                    title="Set as default"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={() => handleEdit(address)}
                  className="p-2 text-gray-400 hover:text-primary-gold transition-colors"
                  title="Edit"
                >
                  <MapPin className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(address._id!)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {addresses.length === 0 && !showForm && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No saved addresses</p>
            <p className="text-sm text-gray-400 mt-1">Add your first address to get started</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
