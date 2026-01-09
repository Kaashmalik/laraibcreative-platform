'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Camera, Save, Loader2, CheckCircle2 } from 'lucide-react'
import useAuth from '@/hooks/useAuth'
import axiosInstance from '@/lib/axios'
import { toast } from 'react-hot-toast'

interface ProfileFormData {
  fullName: string
  email: string
  phone: string
  whatsapp: string
  profileImage: string
}

export default function ProfileForm() {
  const { user, updateUser, loading } = useAuth()

  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    email: '',
    phone: '',
    whatsapp: '',
    profileImage: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        whatsapp: user.whatsapp || '',
        profileImage: user.profileImage || ''
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPreviewImage(URL.createObjectURL(file))
      // TODO: Upload image to Cloudinary
      toast.info('Image upload will be implemented with Cloudinary')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await axiosInstance.put('/auth/profile', formData)
      updateUser(formData)
      setIsSuccess(true)
      toast.success('Profile updated successfully!')

      setTimeout(() => setIsSuccess(false), 3000)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
        {isSuccess && (
          <div className="flex items-center text-green-600">
            <CheckCircle2 className="h-5 w-5 mr-1" />
            <span className="text-sm">Saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-gold to-primary-rose flex items-center justify-center text-white text-2xl font-semibold">
              {previewImage || formData.profileImage ? (
                <img
                  src={previewImage || formData.profileImage}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span>{formData.fullName?.charAt(0) || 'U'}</span>
              )}
            </div>
            <label
              htmlFor="profileImage"
              className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <Camera className="h-4 w-4 text-gray-600" />
            </label>
            <input
              type="file"
              id="profileImage"
              name="profileImage"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Profile Photo</p>
            <p className="text-sm text-gray-500">JPG, PNG or GIF. Max size 2MB</p>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="fullName"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent transition-all"
              placeholder="John Doe"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent transition-all bg-gray-50"
              placeholder="you@example.com"
              disabled
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent transition-all"
              placeholder="03001234567"
            />
          </div>
        </div>

        {/* WhatsApp */}
        <div>
          <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
            WhatsApp Number <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="tel"
              id="whatsapp"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent transition-all"
              placeholder="03001234567"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-gold hover:bg-primary-rose focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  )
}
