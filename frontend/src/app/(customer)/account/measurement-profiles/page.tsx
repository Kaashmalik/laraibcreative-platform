/**
 * My Body Profiles Page
 * Allows users to create, edit, and manage multiple measurement profiles
 */

'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, User } from 'lucide-react';
import api from '@/lib/api';

interface MeasurementProfile {
  _id: string;
  name: string;
  type: 'casual' | 'formal' | 'wedding' | 'party' | 'custom';
  measurements: Record<string, number>;
  notes?: string;
  avatarImage?: string;
  isDefault: boolean;
  lastUsed?: string;
}

export default function MeasurementProfilesPage() {
  const [profiles, setProfiles] = useState<MeasurementProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<MeasurementProfile | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await api.measurementProfiles.getAll();
      setProfiles(response.data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this profile?')) return;
    
    try {
      await api.measurementProfiles.delete(id);
      fetchProfiles();
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('Failed to delete profile');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.measurementProfiles.update(id, { isDefault: true });
      fetchProfiles();
    } catch (error) {
      console.error('Error setting default profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Body Profiles</h1>
          <p className="text-gray-600">
            Save multiple measurement profiles for quick reordering. Perfect for different occasions!
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProfile(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Profile
        </button>
      </div>

      {/* Profiles Grid */}
      {profiles.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No profiles yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first measurement profile to get started
          </p>
          <button
            onClick={() => {
              setEditingProfile(null);
              setShowForm(true);
            }}
            className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors"
          >
            Create Profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile._id}
              profile={profile}
              onEdit={() => {
                setEditingProfile(profile);
                setShowForm(true);
              }}
              onDelete={() => handleDelete(profile._id)}
              onSetDefault={() => handleSetDefault(profile._id)}
            />
          ))}
        </div>
      )}

      {/* Profile Form Modal */}
      {showForm && (
        <ProfileFormModal
          profile={editingProfile}
          onClose={() => {
            setShowForm(false);
            setEditingProfile(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingProfile(null);
            fetchProfiles();
          }}
        />
      )}
    </div>
  );
}

/**
 * Profile Card Component
 */
function ProfileCard({
  profile,
  onEdit,
  onDelete,
  onSetDefault
}: {
  profile: MeasurementProfile;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}) {
  const typeLabels = {
    casual: 'Casual',
    formal: 'Formal',
    wedding: 'Wedding',
    party: 'Party',
    custom: 'Custom'
  };

  const typeColors = {
    casual: 'bg-blue-100 text-blue-800',
    formal: 'bg-gray-100 text-gray-800',
    wedding: 'bg-pink-100 text-pink-800',
    party: 'bg-purple-100 text-purple-800',
    custom: 'bg-green-100 text-green-800'
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Avatar/Image */}
      <div className="relative h-48 bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        {profile.avatarImage ? (
          <img
            src={profile.avatarImage}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-24 h-24 text-gray-300" />
        )}
        {profile.isDefault && (
          <div className="absolute top-2 right-2 bg-pink-600 text-white px-2 py-1 rounded text-xs font-semibold">
            Default
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{profile.name}</h3>
          <span className={`px-2 py-1 rounded text-xs font-medium ${typeColors[profile.type]}`}>
            {typeLabels[profile.type]}
          </span>
        </div>

        {profile.notes && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{profile.notes}</p>
        )}

        {/* Measurements Summary */}
        <div className="text-xs text-gray-500 mb-4 space-y-1">
          {profile.measurements.bust && (
            <div>Bust: {profile.measurements.bust}"</div>
          )}
          {profile.measurements.waist && (
            <div>Waist: {profile.measurements.waist}"</div>
          )}
          {profile.measurements.hip && (
            <div>Hip: {profile.measurements.hip}"</div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {!profile.isDefault && (
            <button
              onClick={onSetDefault}
              className="flex-1 flex items-center justify-center gap-1 text-sm text-gray-700 hover:text-pink-600 transition-colors"
            >
              <Check className="w-4 h-4" />
              Set Default
            </button>
          )}
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1 text-sm text-gray-700 hover:text-blue-600 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-1 text-sm text-red-600 hover:text-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Profile Form Modal Component
 * TODO: Implement full form with all measurement fields
 */
function ProfileFormModal({
  profile,
  onClose,
  onSuccess
}: {
  profile: MeasurementProfile | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  // This is a placeholder - implement full form
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            {profile ? 'Edit Profile' : 'Create Profile'}
          </h2>
          <p className="text-gray-600 mb-6">
            TODO: Implement full measurement form
          </p>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onSuccess}
              className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

