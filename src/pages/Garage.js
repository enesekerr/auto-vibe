// src/pages/Garage.js
import React, { useState, useEffect, useCallback } from 'react';
import './Garage.css';
import MaintenanceSection from '../components/MaintenanceSection';
import { auth, db } from '../firebase'; // Sadece auth ve db import ediyoruz, storage kaldırıldı
import {
  collection,
  addDoc,
  getDocs,
  query,
  // doc, // Artık updateDoc kullanmadığımız için doc importu da kaldırıldı
  // updateDoc, // Artık updateDoc kullanmadığımız için updateDoc importu da kaldırıldı
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

// Storage importları kaldırıldı
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 

const Garage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({
    brand: '',
    model: '',
    year: '',
    km: '',
    startYear: '',
    endYear: '',
    image: null, // Base64 string'i veya null tutacak
    fileName: '',
    engineType: '',
  });

  const [showExperienceForm, setShowExperienceForm] = useState(null);
  const [experienceForm, setExperienceForm] = useState({
    title: '',
    details: '',
    comfort: '',
    performance: '',
    fuelEfficiency: '',
    equipment: '',
    service: '',
  });

  const user = auth.currentUser;
  const userUID = user?.uid;

  // Firebase'den kullanıcı araçlarını çek
  const fetchVehicles = useCallback(async () => {
    if (!userUID) {
      console.log("fetchVehicles: userUID mevcut değil, araçlar çekilemiyor.");
      setVehicles([]);
      return;
    }
    try {
      const vehiclesRef = collection(db, 'users', userUID, 'vehicles');
      const q = query(vehiclesRef, orderBy('brand'));
      const snapshot = await getDocs(q);

      const vehiclesData = [];
      for (const docSnap of snapshot.docs) {
        const vehicle = { id: docSnap.id, ...docSnap.data() };

        // Bakım kayıtlarını da çekmeye devam ediyoruz
        const maintRef = collection(db, 'users', userUID, 'vehicles', docSnap.id, 'maintenances');
        const maintSnap = await getDocs(maintRef);
        vehicle.maintenances = maintSnap.docs.map(mdoc => ({ id: mdoc.id, ...mdoc.data() }));

        vehiclesData.push(vehicle);
      }
      console.log("Araçlar başarıyla çekildi:", vehiclesData);
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Araçlar çekilirken hata:', error);
    }
  }, [userUID]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({
        ...prev,
        image: reader.result, // Base64 string'i olarak kaydediyoruz
        fileName: file.name,
      }));
      // Konsola boyut bilgisini basarak fotoğrafın ne kadar yer kapladığını görebilirsiniz:
      // console.log("Seçilen fotoğraf boyutu (byte):", file.size);
    };
    reader.readAsDataURL(file);
  };

  // Yeni araç Firestore'a ekleme
  const addVehicleToFirestore = async (vehicleData) => {
    console.log("addVehicleToFirestore çağrıldı.");
    console.log("Mevcut userUID:", userUID);
    console.log("Eklenecek araç verisi:", vehicleData);

    if (!userUID) {
      alert('Lütfen giriş yapınız.');
      console.error('Hata: userUID mevcut değil, araç eklenemiyor.');
      return;
    }

    // `image` ve `fileName` dahil tüm veriyi doğrudan Firestore'a kaydediyoruz.
    // Firestore'un 1MB belge boyut limitine dikkat edin!
    const dataToSave = { 
        ...vehicleData,
        // Kilometreyi sayıya dönüştür, boşsa 0 yap
        km: vehicleData.km ? parseInt(vehicleData.km) : 0, 
        // Yılı sayıya dönüştür, boşsa null yap
        year: vehicleData.year ? parseInt(vehicleData.year) : null,
    };

    try {
      const vehiclesRef = collection(db, 'users', userUID, 'vehicles');
      const docRef = await addDoc(vehiclesRef, dataToSave);
      console.log("Araç başarıyla eklendi, belge ID:", docRef.id);
      fetchVehicles(); // Araçları yeniden çekerek UI'ı güncelle
      alert("Araç başarıyla eklendi!"); // Kullanıcıya geri bildirim
    } catch (error) {
      console.error('Araç eklenirken hata oluştu:', error);
      alert(`Araç eklenirken bir hata oluştu: ${error.message || error}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submit edildi.");
    addVehicleToFirestore(form);
    setForm({
      brand: '', model: '', year: '', km: '', startYear: '', endYear: '', image: null, fileName: '', engineType: '',
    });
  };

  const addMaintenanceToFirestore = async (vehicleId, maintenance) => {
    if (!userUID) return;

    try {
      const maintRef = collection(db, 'users', userUID, 'vehicles', vehicleId, 'maintenances');
      await addDoc(maintRef, maintenance);
      fetchVehicles();
    } catch (error) {
      console.error('Bakım eklenirken hata:', error);
    }
  };

  const handleExperienceFormChange = (e) => {
    const { name, value } = e.target;
    setExperienceForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddExperience = async (e, vehicle) => {
    e.preventDefault();
    if (!userUID) {
      alert('Deneyim eklemek için giriş yapmalısınız!');
      return;
    }
    if (!user.displayName && !user.email) {
      alert('Kullanıcı adınız bulunamadı. Lütfen profilinizi güncelleyiniz.');
      return;
    }

    const ratings = {
      comfort: parseInt(experienceForm.comfort),
      performance: parseInt(experienceForm.performance),
      fuelEfficiency: parseInt(experienceForm.fuelEfficiency),
      equipment: parseInt(experienceForm.equipment),
      service: parseInt(experienceForm.service),
    };

    try {
      await addDoc(collection(db, 'experiences'), {
        userId: userUID,
        username: user.displayName || user.email,
        car: { // Hangi araçla ilgili olduğu bilgisi
          make: vehicle.brand,
          model: vehicle.model,
          year: parseInt(vehicle.year),
          engineType: vehicle.engineType || 'Bilinmiyor',
          imageUrl: vehicle.image || '', // Base64 string'ini kullanıyoruz
        },
        title: experienceForm.title,
        details: experienceForm.details,
        kilometers: parseInt(vehicle.km),
        usageStartDate: vehicle.startYear,
        usageEndDate: vehicle.endYear,
        ratings: ratings,
        createdAt: serverTimestamp()
      });

      alert("Deneyim başarıyla eklendi!");
      setExperienceForm({
        title: '', details: '', comfort: '', performance: '', fuelEfficiency: '', equipment: '', service: '',
      });
      setShowExperienceForm(null);
    } catch (err) {
      console.error("Deneyim eklenirken hata oluştu:", err);
      alert("Deneyim eklenirken bir hata oluştu.");
    }
  };

  return (
    <div className="garage-container">
      <h2>🚗 Garajım</h2>

      <form onSubmit={handleSubmit} className="garage-form">
        <div className="input-group">
          <div>
            <div className="input-title">Marka</div>
            <input name="brand" value={form.brand} onChange={handleChange} required />
          </div>
          <div>
            <div className="input-title">Model</div>
            <input name="model" value={form.model} onChange={handleChange} required />
          </div>
          <div>
            <div className="input-title">Yıl</div>
            <input name="year" value={form.year} onChange={handleChange} required />
          </div>
          <div>
            <div className="input-title">Kilometre</div>
            <input name="km" value={form.km} onChange={handleChange} required />
          </div>
          <div>
            <div className="input-title">Kullanım Başlangıcı</div>
            <input type="date" name="startYear" value={form.startYear} onChange={handleChange} />
          </div>
          <div>
            <div className="input-title">Kullanım Bitişi</div>
            <input type="date" name="endYear" value={form.endYear} onChange={handleChange} />
          </div>
          <div>
            <div className="input-title">Motor Tipi</div>
            <input name="engineType" value={form.engineType || ''} onChange={handleChange} />
          </div>
        </div>

        <div className="form-footer">
          <div className="file-upload">
            <label htmlFor="fileInput" className="file-label">📷 Fotoğraf Seç </label>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden-file-input"
            />
            {form.fileName && <span className="file-name">{form.fileName}</span>}
          </div>

          <button type="submit">Aracı Ekle</button>
        </div>
      </form>

      <div className="garage-list">
        {vehicles.length === 0 && <p className="no-vehicles-message">Henüz bir aracınız yok. İlk aracınızı ekleyin!</p>}
        {vehicles.map((car, index) => (
          <div key={car.id || index} className="vehicle-card">
            {/* car.image Base64 string'i içeriyorsa göster */}
            {car.image && <img src={car.image} alt={`${car.brand} ${car.model}`} className="vehicle-image" />}
            <div className="vehicle-details">
              <strong>{car.brand} {car.model}</strong> ({car.year})
              <p>{car.km} km</p>
              {(car.startYear || car.endYear) && (
                <p>📅 Kullanım: {car.startYear} - {car.endYear}</p>
              )}
            </div>

            <MaintenanceSection
              maintenances={car.maintenances || []}
              onAdd={(newEntry) => addMaintenanceToFirestore(car.id, newEntry)}
            />

            <button
              className="share-experience-button"
              onClick={() => setShowExperienceForm(showExperienceForm === car.id ? null : car.id)}
            >
              {showExperienceForm === car.id ? 'Deneyim Eklemeyi Kapat' : 'Bu Araçla İlgili Deneyim Paylaş'}
            </button>

            {showExperienceForm === car.id && (
              <div className="add-experience-form-garage">
                <h3>{car.brand} {car.model} Deneyimi Paylaş</h3>
                <form onSubmit={(e) => handleAddExperience(e, car)}>
                  <div className="form-group">
                    <label htmlFor={`exp-title-${car.id}`}>Deneyim Başlığı:</label>
                    <input
                      type="text"
                      id={`exp-title-${car.id}`}
                      name="title"
                      value={experienceForm.title}
                      onChange={handleExperienceFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor={`exp-details-${car.id}`}>Detaylı Deneyim Yazısı:</label>
                    <textarea
                      id={`exp-details-${car.id}`}
                      name="details"
                      value={experienceForm.details}
                      onChange={handleExperienceFormChange}
                      rows="5"
                      required
                    ></textarea>
                  </div>

                  <h4>Puanlamalar (1-5):</h4>
                  <div className="rating-inputs">
                    <div className="form-group rating-group">
                      <label htmlFor={`exp-comfort-${car.id}`}>Konfor:</label>
                      <input
                        type="number"
                        id={`exp-comfort-${car.id}`}
                        name="comfort"
                        value={experienceForm.comfort}
                        onChange={handleExperienceFormChange}
                        min="0"
                        max="5"
                        required
                      />
                    </div>
                    <div className="form-group rating-group">
                      <label htmlFor={`exp-performance-${car.id}`}>Performans:</label>
                      <input
                        type="number"
                        id={`exp-performance-${car.id}`}
                        name="performance"
                        value={experienceForm.performance}
                        onChange={handleExperienceFormChange}
                        min="0"
                        max="5"
                        required
                      />
                    </div>
                    <div className="form-group rating-group">
                      <label htmlFor={`exp-fuelEfficiency-${car.id}`}>Yakıt Tüketimi:</label>
                      <input
                        type="number"
                        id={`exp-fuelEfficiency-${car.id}`}
                        name="fuelEfficiency"
                        value={experienceForm.fuelEfficiency}
                        onChange={handleExperienceFormChange}
                        min="0"
                        max="5"
                        required
                      />
                    </div>
                    <div className="form-group rating-group">
                      <label htmlFor={`exp-equipment-${car.id}`}>Donanım:</label>
                      <input
                        type="number"
                        id={`exp-equipment-${car.id}`}
                        name="equipment"
                        value={experienceForm.equipment}
                        onChange={handleExperienceFormChange}
                        min="0"
                        max="5"
                        required
                      />
                    </div>
                    <div className="form-group rating-group">
                      <label htmlFor={`exp-service-${car.id}`}>Servis Deneyimi:</label>
                      <input
                        type="number"
                        id={`exp-service-${car.id}`}
                        name="service"
                        value={experienceForm.service}
                        onChange={handleExperienceFormChange}
                        min="0"
                        max="5"
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="submit-experience-button">Deneyimi Kaydet</button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Garage;