// src/pages/Feed.js
import React, { useState, useEffect, useCallback } from 'react';
import { db, auth } from '../firebase'; 
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import './Feed.css'; 

const Feed = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser; 

  const fetchExperiences = useCallback(async () => {
    if (!user) { 
      setExperiences([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const q = query(collection(db, 'experiences'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedExperiences = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExperiences(fetchedExperiences);
      console.log("Deneyimler başarıyla çekildi:", fetchedExperiences);
    } catch (error) {
      console.error("Deneyimler çekilirken hata:", error);
    } finally {
      setLoading(false);
    }
  }, [user]); 

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  if (loading) {
    return <div style={{ padding: 20 }}>Deneyimler yükleniyor...</div>;
  }

  return (
    <div className="feed-container">
      <h2>🌍 Akış</h2>
      {experiences.length === 0 ? (
        <p className="no-experiences-message">
          Henüz bir deneyim yok. Garajım sayfasından ilk deneyimi paylaşın!
        </p>
      ) : (
        <div className="experience-list">
          {experiences.map(exp => (
            <div key={exp.id} className="experience-card">
              <div className="experience-header">
                {/* Resim base64 formatında, direkt gösteriyoruz */}
                {exp.car?.image && (
                  <img
                    src={exp.car.image}
                    alt={`${exp.car.make} ${exp.car.model}`}
                    className="car-image-small"
                  />
                )}
                <div className="car-info">
                  <h3>{exp.car?.make} {exp.car?.model} ({exp.car?.year})</h3>
                  <p className="engine-type">{exp.car?.engineType}</p>
                </div>
              </div>

              <h4>"{exp.title}"</h4>
              <p className="experience-details">{exp.details}</p>

              <div className="ratings">
                {exp.ratings && (
                  <>
                    <p>Konfor: <strong>{exp.ratings.comfort}/5</strong></p>
                    <p>Performans: <strong>{exp.ratings.performance}/5</strong></p>
                    <p>Yakıt Tüketimi: <strong>{exp.ratings.fuelEfficiency}/5</strong></p>
                    <p>Donanım: <strong>{exp.ratings.equipment}/5</strong></p>
                    <p>Servis Deneyimi: <strong>{exp.ratings.service}/5</strong></p>
                  </>
                )}
              </div>

              <div className="experience-footer">
                <p>Ekleyen: <strong>{exp.username || 'Bilinmiyor'}</strong></p>
                <p>Kilometre: {exp.kilometers} km</p>
                {exp.createdAt && (
                  <p>Eklenme Tarihi: {new Date(exp.createdAt.toDate()).toLocaleDateString('tr-TR')}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;
