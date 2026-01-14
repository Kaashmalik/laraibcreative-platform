import Link from 'next/link';

export default function NotFound() {
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
        background: '#fef3c7',
        border: '1px solid #fde68a',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '500px'
      }}>
        <h1 style={{ color: '#d97706', fontSize: '48px', marginBottom: '16px' }}>
          404
        </h1>
        <h2 style={{ color: '#92400e', marginBottom: '16px' }}>
          Page Not Found
        </h2>
        <p style={{ color: '#78350f', marginBottom: '24px' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link 
          href="/"
          style={{ 
            display: 'inline-block',
            padding: '12px 24px', 
            background: '#d97706', 
            color: 'white', 
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}