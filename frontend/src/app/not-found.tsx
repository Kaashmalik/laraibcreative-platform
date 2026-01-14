export default function NotFound() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Page Not Found</h2>
      <p>Could not find requested resource</p>
      <a href="/" style={{ color: '#0070f3' }}>
        Return Home
      </a>
    </div>
  );
}