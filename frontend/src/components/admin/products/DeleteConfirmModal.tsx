/**
 * Delete Confirmation Modal Component
 * Confirms product deletion with options for single or bulk delete
 */

'use client';

import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productCount: number;
  productNames?: string[];
  isBulk?: boolean;
  isLoading?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  productCount,
  productNames = [],
  isBulk = false,
  isLoading = false,
}: DeleteConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {isBulk ? 'Delete Multiple Products' : 'Delete Product'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-600 pt-2">
            {isBulk ? (
              <>
                Are you sure you want to delete <strong>{productCount}</strong> product{productCount > 1 ? 's' : ''}?
                This action cannot be undone.
              </>
            ) : (
              <>
                Are you sure you want to delete <strong>{productNames[0] || 'this product'}</strong>?
                This action cannot be undone.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {productNames.length > 0 && productNames.length <= 5 && (
          <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
            <p className="text-sm font-medium text-gray-700 mb-2">Products to be deleted:</p>
            <ul className="space-y-1">
              {productNames.map((name, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-gray-400" />
                  {name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {productNames.length > 5 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <strong>{productCount}</strong> products will be deleted
            </p>
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900 mb-1">Warning</p>
              <p className="text-sm text-amber-800">
                Deleting products will remove them from your catalog. This action cannot be undone.
                {isBulk && ' All selected products will be permanently deleted.'}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="min-w-[100px] flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

