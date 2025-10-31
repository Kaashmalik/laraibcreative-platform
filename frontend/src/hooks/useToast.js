/**
 * Hook for managing toast notifications.
 * @example
 * const { success, error } = useToast()
 * 
 * // Show success toast
 * success('Item saved successfully')
 * 
 * // Show error toast
 * error('Something went wrong')
 * 
 * // Custom toast with duration
 * showToast('warning', 'Please review your input', 3000)
 */
import { useToast } from '@/context/ToastContext';
export default useToast;