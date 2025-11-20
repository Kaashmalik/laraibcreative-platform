/**
 * Draft Manager Utilities
 * Save and restore custom order drafts
 * 
 * @module lib/utils/draft-manager
 */

import type { CustomOrderFormData, DraftData } from '@/types/custom-order';

const DRAFT_STORAGE_KEY = 'laraibcreative-custom-order-draft';
const DRAFT_VERSION = 1;
const DRAFT_EXPIRY_DAYS = 30;

/**
 * Save draft to localStorage
 */
export function saveDraft(formData: CustomOrderFormData): boolean {
  try {
    const draft: DraftData = {
      formData: {
        ...formData,
        // Convert File objects to serializable format
        referenceImages: formData.referenceImages.map(img => ({
          name: img.name,
          size: img.size,
          preview: img.preview,
          uploadedAt: img.uploadedAt || new Date().toISOString(),
        })),
      },
      savedAt: new Date().toISOString(),
      version: DRAFT_VERSION,
    };

    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    return true;
  } catch (error) {
    console.error('Failed to save draft:', error);
    return false;
  }
}

/**
 * Load draft from localStorage
 */
export function loadDraft(): CustomOrderFormData | null {
  try {
    const draftJson = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!draftJson) {
      return null;
    }

    const draft: DraftData = JSON.parse(draftJson);

    // Check version compatibility
    if (draft.version !== DRAFT_VERSION) {
      console.warn('Draft version mismatch, clearing draft');
      clearDraft();
      return null;
    }

    // Check expiry
    const savedDate = new Date(draft.savedAt);
    const expiryDate = new Date(savedDate);
    expiryDate.setDate(expiryDate.getDate() + DRAFT_EXPIRY_DAYS);

    if (new Date() > expiryDate) {
      console.warn('Draft expired, clearing draft');
      clearDraft();
      return null;
    }

    return draft.formData;
  } catch (error) {
    console.error('Failed to load draft:', error);
    clearDraft();
    return null;
  }
}

/**
 * Clear draft from localStorage
 */
export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear draft:', error);
  }
}

/**
 * Check if draft exists
 */
export function hasDraft(): boolean {
  try {
    return localStorage.getItem(DRAFT_STORAGE_KEY) !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Get draft metadata
 */
export function getDraftMetadata(): { savedAt: string; version: number } | null {
  try {
    const draftJson = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!draftJson) {
      return null;
    }

    const draft: DraftData = JSON.parse(draftJson);
    return {
      savedAt: draft.savedAt,
      version: draft.version,
    };
  } catch (error) {
    return null;
  }
}

export default {
  saveDraft,
  loadDraft,
  clearDraft,
  hasDraft,
  getDraftMetadata,
  DRAFT_VERSION,
  DRAFT_EXPIRY_DAYS,
};

