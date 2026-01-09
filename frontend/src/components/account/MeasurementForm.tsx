'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Ruler, Save, Loader2, CheckCircle2, User } from 'lucide-react'
import axiosInstance from '@/lib/axios'
import { toast } from 'react-hot-toast'

interface Measurement {
  shirtLength?: number
  shoulderWidth?: number
  sleeveLength?: number
  armHole?: number
  bust?: number
  waist?: number
  hip?: number
  frontNeckDepth?: number
  backNeckDepth?: number
  wrist?: number
  trouserLength?: number
  trouserWaist?: number
  trouserHip?: number
  thigh?: number
  bottom?: number
  kneeLength?: number
  dupattaLength?: number
  dupattaWidth?: number
}

interface MeasurementProfile {
  _id?: string
  name: string
  measurements: Measurement
  sizeLabel?: string
}

export default function MeasurementForm({ onSuccess }: { onSuccess?: () => void }) {
  const [profiles, setProfiles] = useState<MeasurementProfile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [profileName, setProfileName] = useState('')
  const [sizeLabel, setSizeLabel] = useState('')
  const [measurements, setMeasurements] = useState<Measurement>({})

  const loadProfiles = async () => {
    try {
      const response = await axiosInstance.get('/auth/measurements')
      setProfiles(response.data || [])
    } catch (error: any) {
      toast.error('Failed to load measurement profiles')
    }
  }

  useEffect(() => {
    loadProfiles()
  }, [])

  const handleMeasurementChange = (field: keyof Measurement, value: string) => {
    setMeasurements(prev => ({
      ...prev,
      [field]: value ? parseFloat(value) : undefined
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const data = {
        name: profileName,
        sizeLabel,
        measurements
      }

      if (editingId) {
        await axiosInstance.put(`/auth/measurements/${editingId}`, data)
        toast.success('Measurement profile updated successfully!')
      } else {
        await axiosInstance.post('/auth/measurements', data)
        toast.success('Measurement profile created successfully!')
      }

      setIsSuccess(true)
      setShowForm(false)
      setEditingId(null)
      resetForm()
      loadProfiles()

      if (onSuccess) onSuccess()

      setTimeout(() => setIsSuccess(false), 3000)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save measurements')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this measurement profile?')) return

    try {
      await axiosInstance.delete(`/auth/measurements/${id}`)
      toast.success('Measurement profile deleted successfully!')
      loadProfiles()
    } catch (error: any) {
      toast.error('Failed to delete measurement profile')
    }
  }

  const handleUseProfile = (profile: MeasurementProfile) => {
    setMeasurements(profile.measurements)
    toast.success(`Using ${profile.name} measurements`)
  }

  const resetForm = () => {
    setProfileName('')
    setSizeLabel('')
    setMeasurements({})
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
        <h3 className="text-lg font-semibold text-gray-900">Measurement Profiles</h3>
        <button
          onClick={() => {
            resetForm()
            setEditingId(null)
            setShowForm(true)
          }}
          className="flex items-center px-4 py-2 border border-primary-gold rounded-lg text-sm font-medium text-primary-gold hover:bg-primary-gold hover:text-white transition-all"
        >
          <Ruler className="h-4 w-4 mr-2" />
          New Profile
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Name
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                  placeholder="My Measurements"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size Label <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <select
                  value={sizeLabel}
                  onChange={(e) => setSizeLabel(e.target.value)}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                >
                  <option value="">Select size</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Upper Body (Shirt/Kameez)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MeasurementField
                  label="Shirt Length"
                  value={measurements.shirtLength}
                  onChange={(v) => handleMeasurementChange('shirtLength', v)}
                />
                <MeasurementField
                  label="Shoulder Width"
                  value={measurements.shoulderWidth}
                  onChange={(v) => handleMeasurementChange('shoulderWidth', v)}
                />
                <MeasurementField
                  label="Sleeve Length"
                  value={measurements.sleeveLength}
                  onChange={(v) => handleMeasurementChange('sleeveLength', v)}
                />
                <MeasurementField
                  label="Arm Hole"
                  value={measurements.armHole}
                  onChange={(v) => handleMeasurementChange('armHole', v)}
                />
                <MeasurementField
                  label="Bust"
                  value={measurements.bust}
                  onChange={(v) => handleMeasurementChange('bust', v)}
                />
                <MeasurementField
                  label="Waist"
                  value={measurements.waist}
                  onChange={(v) => handleMeasurementChange('waist', v)}
                />
                <MeasurementField
                  label="Hip"
                  value={measurements.hip}
                  onChange={(v) => handleMeasurementChange('hip', v)}
                />
                <MeasurementField
                  label="Front Neck Depth"
                  value={measurements.frontNeckDepth}
                  onChange={(v) => handleMeasurementChange('frontNeckDepth', v)}
                />
                <MeasurementField
                  label="Back Neck Depth"
                  value={measurements.backNeckDepth}
                  onChange={(v) => handleMeasurementChange('backNeckDepth', v)}
                />
                <MeasurementField
                  label="Wrist"
                  value={measurements.wrist}
                  onChange={(v) => handleMeasurementChange('wrist', v)}
                />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Lower Body (Trouser/Shalwar)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MeasurementField
                  label="Trouser Length"
                  value={measurements.trouserLength}
                  onChange={(v) => handleMeasurementChange('trouserLength', v)}
                />
                <MeasurementField
                  label="Trouser Waist"
                  value={measurements.trouserWaist}
                  onChange={(v) => handleMeasurementChange('trouserWaist', v)}
                />
                <MeasurementField
                  label="Trouser Hip"
                  value={measurements.trouserHip}
                  onChange={(v) => handleMeasurementChange('trouserHip', v)}
                />
                <MeasurementField
                  label="Thigh"
                  value={measurements.thigh}
                  onChange={(v) => handleMeasurementChange('thigh', v)}
                />
                <MeasurementField
                  label="Bottom"
                  value={measurements.bottom}
                  onChange={(v) => handleMeasurementChange('bottom', v)}
                />
                <MeasurementField
                  label="Knee Length"
                  value={measurements.kneeLength}
                  onChange={(v) => handleMeasurementChange('kneeLength', v)}
                />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Dupatta</h4>
              <div className="grid grid-cols-2 gap-4">
                <MeasurementField
                  label="Dupatta Length"
                  value={measurements.dupattaLength}
                  onChange={(v) => handleMeasurementChange('dupattaLength', v)}
                />
                <MeasurementField
                  label="Dupatta Width"
                  value={measurements.dupattaWidth}
                  onChange={(v) => handleMeasurementChange('dupattaWidth', v)}
                />
              </div>
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
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingId ? 'Update' : 'Save'} Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="space-y-4">
        {profiles.map(profile => (
          <motion.div
            key={profile._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 hover:border-primary-gold transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-5 w-5 text-primary-gold" />
                  <h4 className="font-semibold text-gray-900">{profile.name}</h4>
                  {profile.sizeLabel && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {profile.sizeLabel}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {Object.values(profile.measurements).filter(v => v).length} measurements saved
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleUseProfile(profile)}
                  className="p-2 text-gray-400 hover:text-primary-gold transition-colors"
                  title="Use measurements"
                >
                  <CheckCircle2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    setProfileName(profile.name)
                    setSizeLabel(profile.sizeLabel || '')
                    setMeasurements(profile.measurements)
                    setEditingId(profile._id || null)
                    setShowForm(true)
                  }}
                  className="p-2 text-gray-400 hover:text-primary-gold transition-colors"
                  title="Edit"
                >
                  <Ruler className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(profile._id!)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Save className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {profiles.length === 0 && !showForm && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
            <Ruler className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No measurement profiles</p>
            <p className="text-sm text-gray-400 mt-1">Create a profile to save your measurements</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function MeasurementField({ label, value, onChange }: { label: string; value?: number; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label} <span className="text-gray-400">(inches)</span>
      </label>
      <input
        type="number"
        step="0.5"
        min="0"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold focus:border-transparent text-sm"
        placeholder="0"
      />
    </div>
  )
}
