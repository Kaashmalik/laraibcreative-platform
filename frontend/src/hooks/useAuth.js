/**
 * Hook for authentication management.
 * @example
 * const { user, login, logout } = useAuth()
 * 
 * // Login
 * await login('user@example.com', 'password')
 * 
 * // Access user data
 * console.log(user?.name)
 * 
 * // Logout
 * await logout()
 */
import { useAuth } from '@/context/AuthContext';
export default useAuth;
