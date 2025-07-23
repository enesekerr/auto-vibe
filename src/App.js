import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import Navbar from './components/Navbar';
import Feed from './pages/Feed';
import Explore from './pages/Explore';
import Auth from './components/Auth';
import Garage from './pages/Garage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Yükleniyor...</div>;

  return (
    <Router>
      <Navbar user={user} />
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/feed" />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/explore" element={<Explore />} />
          {/* Giriş yoksa garage erişimi engellenecek */}
          <Route
            path="/garage"
            element={user ? <Garage /> : <Navigate to="/auth" />}
          />
          <Route
            path="/auth"
            element={!user ? <Auth /> : <Navigate to="/garage" />}
          />
          {/* Diğer olmayan rotalar için */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
