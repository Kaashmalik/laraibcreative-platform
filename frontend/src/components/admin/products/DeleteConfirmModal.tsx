/**
 * Delete Confirmation Modal Component
 * Confirms product deletion with options for single or bulk delete
 */

'use client';


import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';

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
  const title = isBulk ? 'Delete Multiple Products' : 'Delete Product';
  const description = isBulk ? (
    <>
      Are you sure you want to delete <strong>{productCount}</strong> product{productCount > 1 ? 's' : ''}?
      This action cannot be undone.
    </>
  ) : (
    <>
      Are you sure you want to delete <strong>{productNames[0] || 'this product'}</strong>?
      This action cannot be undone.
    </>
  );

  const footer = (
    <>
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
    </>
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <span>{title}</span>
        </div>
      }
      footer={footer}
      size="md"
    >
      <div className="space-y-4">
        <p className="text-gray-600">{description}</p>

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
      </div>
    </Dialog>
  );
}

