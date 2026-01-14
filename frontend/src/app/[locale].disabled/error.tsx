'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        background: '#fee2e2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '500px'
      }}>
        <h2 style={{ color: '#dc2626', marginBottom: '16px' }}>
          Something went wrong!
        </h2>
        <p style={{ color: '#7f1d1d', marginBottom: '20px' }}>
          {error.message || 'An unexpected error occurred'}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button 
            onClick={reset}
            style={{ 
              padding: '10px 20px', 
              background: '#dc2626', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Try again
          </button>
          <button 
            onClick={() => router.push('/')}
            style={{ 
              padding: '10px 20px', 
              background: '#6b7280', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}