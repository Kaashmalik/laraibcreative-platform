/**
 * Customer Account Route Configuration
 * Force dynamic rendering for account pages (require auth)
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
