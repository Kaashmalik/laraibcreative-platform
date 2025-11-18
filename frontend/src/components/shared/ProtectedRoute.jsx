"use client";

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import LoadingScreen from './LoadingScreen';
import { AlertTriangle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/**
 * Higher-order component for protecting routes that require authentication
 * Supports role-based access control and custom unauthorized handling
 * 
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
 * 
 * // Custom roles
 * <ProtectedRoute requiredRoles={['admin', 'editor']}>
 *   <ContentManagement />
 * </ProtectedRoute>
 * 
 * // With custom loading message
 * <ProtectedRoute loadingMessage="Verifying access...">
 *   <SecureContent />
 * </ProtectedRoute>
 */
function ProtectedRoute({ 
  children, 
  adminOnly = false,
  requiredRoles = [],
  loadingMessage = 'Checking authorization...',
  redirectTo = '/auth/login',
  showUnauthorized = true
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Check if user has required role
  const hasRequiredRole = (userRole) => {
    if (adminOnly) {
      return userRole === 'admin';
    }
    if (requiredRoles.length > 0) {
      return requiredRoles.includes(userRole);
    }
    return true; // No specific role required, just authentication
  };

  useEffect(() => {
    // Only check auth after loading is complete
    if (!isLoading) {
      if (!user) {
        // User not authenticated - redirect to login
        setIsRedirecting(true);
        const returnUrl = router.asPath !== redirectTo ? router.asPath : '/';
        
        router.push({
          pathname: redirectTo,
          query: { returnUrl }
        });
      } else if (!hasRequiredRole(user.role)) {
        // User authenticated but lacks required role
        if (showUnauthorized) {
          // Stay on page and show unauthorized message
          setIsRedirecting(false);
        } else {
          // Redirect to home page
          setIsRedirecting(true);
          router.push('/');
        }
      }
    }
  }, [user, isLoading, adminOnly, requiredRoles, router, redirectTo, showUnauthorized]);

  // Show loading screen while checking auth status
  if (isLoading || isRedirecting) {
    return <LoadingScreen message={loadingMessage} />;
  }

  // User not authenticated
  if (!user) {
    return null; // Will redirect via useEffect
  }

  // User authenticated but unauthorized
  if (!hasRequiredRole(user.role)) {
    if (showUnauthorized) {
      return <UnauthorizedFallback requiredRoles={requiredRoles} adminOnly={adminOnly} />;
    }
    return null; // Will redirect via useEffect
  }

  // User authorized - render children
  return (
    <div 
      role="main" 
      aria-label={adminOnly ? 'Admin protected content' : 'Protected content'}
    >
      {children}
    </div>
  );
}

/**
 * Fallback component shown when user is authenticated but unauthorized
 */
function UnauthorizedFallback({ requiredRoles, adminOnly }) {
  const router = useRouter();

  return (
    <div 
      role="alert" 
      className="flex min-h-screen items-center justify-center bg-gray-50 p-4"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
        {/* Lock Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-3">
            <Lock className="h-12 w-12 text-red-600" aria-hidden="true" />
          </div>
        </div>

        {/* Title */}
        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          Access Denied
        </h1>

        {/* Description */}
        <p className="mt-4 text-gray-600">
          {adminOnly 
            ? 'This page is restricted to administrators only.'
            : requiredRoles.length > 0
            ? `You need one of the following roles to access this page: ${requiredRoles.join(', ')}`
            : 'You do not have permission to access this page.'}
        </p>

        {/* Warning */}
        <div className="mt-6 rounded-md bg-yellow-50 border border-yellow-200 p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800 text-left">
              If you believe you should have access to this page, please contact 
              your administrator or support team.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button 
            onClick={() => router.back()}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Go Back
          </Button>
          
          <Button 
            onClick={() => router.push('/')}
            variant="primary"
            className="w-full sm:w-auto"
          >
            Go to Home
          </Button>
        </div>

        {/* Support Link */}
        <p className="mt-6 text-sm text-gray-500">
          Need help?{' '}
          <a 
            href="/contact" 
            className="font-medium text-primary hover:underline"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}

ProtectedRoute.propTypes = {
  /** Content to be rendered if authorized */
  children: PropTypes.node.isRequired,
  /** Whether the route requires admin privileges */
  adminOnly: PropTypes.bool,
  /** Array of role names that are allowed to access */
  requiredRoles: PropTypes.arrayOf(PropTypes.string),
  /** Custom loading message while checking authorization */
  loadingMessage: PropTypes.string,
  /** Path to redirect to if not authenticated */
  redirectTo: PropTypes.string,
  /** Whether to show unauthorized message or redirect */
  showUnauthorized: PropTypes.bool
};

UnauthorizedFallback.propTypes = {
  requiredRoles: PropTypes.arrayOf(PropTypes.string),
  adminOnly: PropTypes.bool
};

export default ProtectedRoute;