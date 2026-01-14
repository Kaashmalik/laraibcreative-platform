export default function HomePage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1 style={{ color: '#D946A6', marginBottom: '20px' }}>LaraibCreative</h1>
      <h2 style={{ color: '#7C3AED', marginBottom: '20px' }}>Custom Ladies Suits & Designer Wear</h2>
      <p style={{ fontSize: '18px', marginBottom: '30px' }}>
        Premium custom stitched ladies suits and designer wear in Pakistan
      </p>
      <div style={{ background: '#FDF2F8', padding: '20px', borderRadius: '10px', margin: '20px 0' }}>
        <h3>Welcome to Our Platform!</h3>
        <p>Time: {new Date().toLocaleString()}</p>
      </div>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '30px' }}>
        <a href="/products" style={{ 
          background: '#D946A6', 
          color: 'white', 
          padding: '12px 24px', 
          borderRadius: '8px',
          textDecoration: 'none'
        }}>
          Shop Products
        </a>
        <a href="/custom-order" style={{ 
          background: '#7C3AED', 
          color: 'white', 
          padding: '12px 24px', 
          borderRadius: '8px',
          textDecoration: 'none'
        }}>
          Custom Order
        </a>
      </div>
    </div>
  );
}