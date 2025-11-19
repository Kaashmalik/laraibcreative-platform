/**
 * Custom hook for toast notifications
 * Re-exports useToast from ToastContext for centralized notification management
 * 
 * @module hooks/useToast
 * @returns {Object} Toast context with success, error, warning, info methods
 * 
 * @example
 * import useToast from '@/hooks/useToast'
 * 
 * function MyForm() {
 *   const { success, error, warning, info } = useToast()
 *   
 *   const handleSubmit = async (data) => {
 *     try {
 *       await api.submit(data)
 *       success('Form submitted successfully!')
 *     } catch (err) {
 *       error('Failed to submit form. Please try again.')
 *     }
 *   }
 *   
 *   const handleWarning = () => {
 *     warning('This action cannot be undone')
 *   }
 *   
 *   const handleInfo = () => {
 *     info('New features coming soon!')
 *   }
 *   
 *   return <form onSubmit={handleSubmit}>...</form>
 * }
 */

import { useToast } from '@/context/ToastContext'

export default useToast