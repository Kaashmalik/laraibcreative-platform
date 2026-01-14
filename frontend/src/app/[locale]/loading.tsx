export default function Loading() {
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
        padding: '24px',
        borderRadius: '8px'
      }}>
        <h2 style={{ color: '#6b7280', marginBottom: '16px' }}>
          Loading...
        </h2>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #d946a6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}