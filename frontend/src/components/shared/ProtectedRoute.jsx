import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { LoadingScreen } from '@/components/shared/LoadingScreen';

/**
 * Higher-order component for protecting routes that require authentication
 * @component
 * @example
 * // Basic protection (requires any authenticated user)
 * <ProtectedRoute>
 *   <UserDashboard />
 * </ProtectedRoute>
 * 
 * // Admin-only route
 * <ProtectedRoute adminOnly>
 *   <AdminPanel />
 * </ProtectedRoute>
 */
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Redirect to login if not authenticated
        router.push({
          pathname: '/auth/login',
          query: { returnUrl: router.asPath }
        });
      } else if (adminOnly && user.role !== 'admin') {
        // Redirect to home if not admin
        router.push('/');
      }
    }
  }, [user, isLoading, adminOnly, router]);

  // Show loading screen while checking auth status
  if (isLoading) {
    return <LoadingScreen message="Checking authorization..." />;
  }

  // Don't render anything while redirecting
  if (!user || (adminOnly && user.role !== 'admin')) {
    return null;
  }

  // Render children if authorized
  return (
    <div role="main" aria-label={adminOnly ? 'Admin protected content' : 'Protected content'}>
      {children}
    </div>
  );
}

ProtectedRoute.propTypes = {
  /** Content to be rendered if authorized */
  children: PropTypes.node.isRequired,
  /** Whether the route requires admin privileges */
  adminOnly: PropTypes.bool
};

export default ProtectedRoute;
