'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button 
        onClick={reset}
        style={{ padding: '10px 20px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '5px' }}
      >
        Try again
      </button>
    </div>
  );
}