/**
 * Custom hook for authentication
 * Re-exports useAuth from AuthContext for centralized auth state management
 * 
 * @module hooks/useAuth
 * @returns {Object} Authentication context with user, login, logout, and loading state
 * 
 * @example
 * import useAuth from '@/hooks/useAuth'
 * 
 * function MyComponent() {
 *   const { user, login, logout, isLoading } = useAuth()
 *   
 *   if (isLoading) return <Spinner />
 *   
 *   return (
 *     <div>
 *       {user ? (
 *         <button onClick={logout}>Logout {user.name}</button>
 *       ) : (
 *         <button onClick={() => login(credentials)}>Login</button>
 *       )}
 *     </div>
 *   )
 * }
 */

import { useAuth } from '@/context/AuthContext'

export default useAuth