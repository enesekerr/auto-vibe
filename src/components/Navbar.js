import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useEffect } from 'react';

const Navbar = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth).catch((error) => {
      console.error('Çıkış yapılırken hata:', error);
    });
  };

  const handleGarageClick = (e) => {
    if (!user) {
      e.preventDefault();
      navigate('/auth'); // Giriş sayfasına yönlendir
    }
  };

  return (
    <nav
      style={{ padding: '10px', background: '#222', color: 'white', display: 'flex', alignItems: 'center' }}
    >
      <Link to="/feed" style={{ marginRight: '20px', color: 'white' }}>
        Akış
      </Link>
      <Link to="/explore" style={{ marginRight: '20px', color: 'white' }}>
        Keşfet
      </Link>
      {/* Garajım linki her zaman görünsün */}
      <Link
        to="/garage"
        style={{ marginRight: '20px', color: 'white' }}
        onClick={handleGarageClick}
      >
        Garajım
      </Link>

      <div style={{ marginLeft: 'auto' }}>
        {user ? (
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: '1px solid white',
              color: 'white',
              padding: '5px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Çıkış Yap
          </button>
        ) : (
          <Link to="/auth" style={{ color: 'white' }}>
            Giriş
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
