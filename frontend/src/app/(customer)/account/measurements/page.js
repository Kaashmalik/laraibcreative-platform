"use client";

export const dynamic = 'force-dynamic';

// app/(customer)/account/measurements/page.js
import { useState, useEffect } from 'react';
import { 
  Ruler,
  Plus,
  Edit,
  Trash2,
  Copy,
  Save,
  X,
  Check
} from 'lucide-react';

export default function MeasurementsPage() {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    label: '',
    shirtLength: '',
    shoulderWidth: '',
    sleeveLength: '',
    armHole: '',
    bust: '',
    waist: '',
    hip: '',
    frontNeckDepth: '',
    backNeckDepth: '',
    wrist: '',
    trouserLength: '',
    trouserWaist: '',
    trouserHip: '',
    thigh: '',
    bottom: '',
    kneeLength: '',
    dupattaLength: '',
    dupattaWidth: ''
  });

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const fetchMeasurements = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockMeasurements = [
        {
          id: '1',
          label: 'My Size',
          shirtLength: '42',
          shoulderWidth: '15',
          sleeveLength: '22',
          armHole: '20',
          bust: '38',
          waist: '32',
          hip: '40',
          frontNeckDepth: '9',
          backNeckDepth: '6',
          wrist: '8',
          trouserLength: '38',
          trouserWaist: '32',
          trouserHip: '40',
          thigh: '24',
          bottom: '16',
          kneeLength: '22',
          dupattaLength: '90',
          dupattaWidth: '40',
          createdAt: '2025-09-15',
          isDefault: true
        },
        {
          id: '2',
          label: "Sister's Size",
          shirtLength: '40',
          shoulderWidth: '14',
          sleeveLength: '21',
          armHole: '19',
          bust: '36',
          waist: '30',
          hip: '38',
          frontNeckDepth: '8',
          backNeckDepth: '5',
          wrist: '7',
          trouserLength: '36',
          trouserWaist: '30',
          trouserHip: '38',
          thigh: '22',
          bottom: '14',
          kneeLength: '20',
          dupattaLength: '90',
          dupattaWidth: '40',
          createdAt: '2025-10-01',
          isDefault: false
        }
      ];
      
      setMeasurements(mockMeasurements);
    } catch (error) {
      console.error('Failed to fetch measurements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!formData.label.trim()) {
      alert('Please enter a label for this measurement set');
      return;
    }

    try {
      if (editingId) {
        // Update existing
        setMeasurements(prev =>
          prev.map(m => m.id === editingId ? { ...m, ...formData } : m)
        );
        alert('Measurements updated successfully!');
      } else {
        // Add new
        const newMeasurement = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString(),
          isDefault: measurements.length === 0
        };
        setMeasurements(prev => [...prev, newMeasurement]);
        alert('Measurements saved successfully!');
      }
      
      resetForm();
    } catch (error) {
      console.error('Failed to save measurements:', error);
      alert('Failed to save measurements');
    }
  };

  const handleEdit = (measurement) => {
    setFormData(measurement);
    setEditingId(measurement.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this measurement set?')) {
      setMeasurements(prev => prev.filter(m => m.id !== id));
      alert('Measurements deleted successfully!');
    }
  };

  const handleDuplicate = (measurement) => {
    setFormData({
      ...measurement,
      label: `${measurement.label} (Copy)`,
      id: undefined
    });
    setEditingId(null);
    setShowAddForm(true);
  };

  const handleSetDefault = async (id) => {
    setMeasurements(prev =>
      prev.map(m => ({ ...m, isDefault: m.id === id }))
    );
    alert('Default measurement updated!');
  };

  const resetForm = () => {
    setFormData({
      label: '',
      shirtLength: '',
      shoulderWidth: '',
      sleeveLength: '',
      armHole: '',
      bust: '',
      waist: '',
      hip: '',
      frontNeckDepth: '',
      backNeckDepth: '',
      wrist: '',
      trouserLength: '',
      trouserWaist: '',
      trouserHip: '',
      thigh: '',
      bottom: '',
      kneeLength: '',
      dupattaLength: '',
      dupattaWidth: ''
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const measurementFields = [
    {
      section: 'Upper Body',
      fields: [
        { name: 'shirtLength', label: 'Shirt Length' },
        { name: 'shoulderWidth', label: 'Shoulder Width' },
        { name: 'sleeveLength', label: 'Sleeve Length' },
        { name: 'armHole', label: 'Arm Hole' },
        { name: 'bust', label: 'Bust/Chest' },
        { name: 'waist', label: 'Waist' },
        { name: 'hip', label: 'Hip' },
        { name: 'frontNeckDepth', label: 'Front Neck Depth' },
        { name: 'backNeckDepth', label: 'Back Neck Depth' },
        { name: 'wrist', label: 'Wrist' }
      ]
    },
    {
      section: 'Lower Body',
      fields: [
        { name: 'trouserLength', label: 'Trouser Length' },
        { name: 'trouserWaist', label: 'Trouser Waist' },
        { name: 'trouserHip', label: 'Trouser Hip' },
        { name: 'thigh', label: 'Thigh' },
        { name: 'bottom', label: 'Bottom' },
        { name: 'kneeLength', label: 'Knee Length' }
      ]
    },
    {
      section: 'Dupatta',
      fields: [
        { name: 'dupattaLength', label: 'Dupatta Length' },
        { name: 'dupattaWidth', label: 'Dupatta Width' }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded" />
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
            My Measurements
          </h1>
          <p className="text-gray-600">
            Save and manage your measurement sets
          </p>
        </div>
        
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Add New
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="mb-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Edit Measurements' : 'Add New Measurements'}
            </h2>
            <button
              onClick={resetForm}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {/* Label */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Label <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="label"
                value={formData.label}
                onChange={handleInputChange}
                placeholder="e.g., My Size, Sister's Size"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Give this measurement set a name to identify it easily
              </p>
            </div>

            {/* Measurement Fields */}
            {measurementFields.map((section, idx) => (
              <div key={idx} className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  {section.section}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleInputChange}
                          step="0.5"
                          placeholder="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 pr-16"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                          inches
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
              >
                <Save className="w-5 h-5" />
                {editingId ? 'Update Measurements' : 'Save Measurements'}
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

      {/* Saved Measurements */}
      {measurements.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Ruler className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No measurements saved yet
          </h3>
          <p className="text-gray-600 mb-6">
            Add your first measurement set to speed up future orders
          </p>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Measurements
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {measurements.map((measurement) => (
            <div
              key={measurement.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Card Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {measurement.label}
                  </h3>
                  {measurement.isDefault && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full border border-green-200">
                      <Check className="w-3 h-3" />
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Added on {new Date(measurement.createdAt).toLocaleDateString('en-PK', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {/* Measurements Grid */}
              <div className="p-6">
                {measurementFields.map((section, idx) => (
                  <div key={idx} className="mb-4 last:mb-0">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      {section.section}
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {section.fields.map((field) => (
                        <div
                          key={field.name}
                          className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
                        >
                          <span className="text-sm text-gray-600">
                            {field.label}:
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {measurement[field.name] || '-'}&quot;
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-2">
                {!measurement.isDefault && (
                  <button
                    onClick={() => handleSetDefault(measurement.id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => handleEdit(measurement)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDuplicate(measurement)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
                <button
                  onClick={() => handleDelete(measurement.id)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          📏 How to Measure
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Use a flexible measuring tape for accurate measurements</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Measure over light clothing for best results</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Stand straight with relaxed posture while measuring</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>All measurements are in inches</span>
          </li>
        </ul>
        <a
          href="/size-guide"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          View Complete Size Guide
          <span>→</span>
        </a>
      </div>
    </div>
  );
}