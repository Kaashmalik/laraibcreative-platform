export default function HomePage() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#D946A6', fontSize: '48px', marginBottom: '20px' }}>
        LaraibCreative
      </h1>
      <h2 style={{ color: '#7C3AED', fontSize: '24px', marginBottom: '30px' }}>
        Custom Ladies Suits & Designer Wear
      </h2>
      <p style={{ fontSize: '18px', color: '#374151', marginBottom: '40px', lineHeight: '1.6' }}>
        Premium custom stitched ladies suits and designer wear in Pakistan. 
        We turn your thoughts & emotions into reality and happiness.
      </p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '40px',
        textAlign: 'left'
      }}>
        <div style={{ 
          background: '#FDF2F8', 
          padding: '20px', 
          borderRadius: '10px',
          border: '1px solid #FCE7F3'
        }}>
          <h3 style={{ color: '#D946A6', marginBottom: '10px' }}>✨ Custom Suits</h3>
          <p style={{ color: '#6B7280' }}>Tailored to your measurements</p>
        </div>
        <div style={{ 
          background: '#F3E8FF', 
          padding: '20px', 
          borderRadius: '10px',
          border: '1px solid #E9D5FF'
        }}>
          <h3 style={{ color: '#7C3AED', marginBottom: '10px' }}>🎨 Designer Wear</h3>
          <p style={{ color: '#6B7280' }}>Latest fashion trends</p>
        </div>
        <div style={{ 
          background: '#FEF3C7', 
          padding: '20px', 
          borderRadius: '10px',
          border: '1px solid #FDE68A'
        }}>
          <h3 style={{ color: '#D97706', marginBottom: '10px' }}>🚚 Fast Delivery</h3>
          <p style={{ color: '#6B7280' }}>Across Pakistan</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <a 
          href="/products" 
          style={{ 
            background: '#D946A6', 
            color: 'white', 
            padding: '15px 30px', 
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '16px',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          🛍️ Shop Products
        </a>
        <a 
          href="/custom-order" 
          style={{ 
            background: '#7C3AED', 
            color: 'white', 
            padding: '15px 30px', 
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '16px',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          ✂️ Custom Order
        </a>
      </div>

      <div style={{ 
        marginTop: '60px', 
        padding: '30px', 
        background: 'linear-gradient(135deg, #D946A6 0%, #7C3AED 100%)',
        borderRadius: '15px',
        color: 'white',
        textAlign: 'center'
      }}>
        <h3 style={{ fontSize: '24px', marginBottom: '15px' }}>
          🌟 Welcome to LaraibCreative
        </h3>
        <p style={{ fontSize: '16px', marginBottom: '20px', lineHeight: '1.6' }}>
          Time: {new Date().toLocaleString()}
        </p>
        <p style={{ fontSize: '14px', opacity: '0.9' }}>
          Your journey to beautiful custom ladies' suits starts here!
        </p>
      </div>
    </div>
  );
}