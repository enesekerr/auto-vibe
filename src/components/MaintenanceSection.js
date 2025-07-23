import { useState } from 'react';


const MaintenanceSection = ({ maintenances, onAdd }) => {
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !note.trim()) return;
    onAdd({ date, note });
    setDate('');
    setNote('');
  };

  return (
    <div className="maintenance-container">
      <h4 className="section-title">🛠️ Bakım Geçmişi</h4>

      <div className="maintenance-list">
        {maintenances.map((m, i) => (
          <div key={i} className="maintenance-entry">
            <div className="maintenance-left">
              <div className="date-icon">📅</div>
              <div className="maintenance-date">{m.date}</div>
            </div>
            <div className="maintenance-desc">{m.note}</div>
          </div>
        ))}
      </div>

      <form className="maintenance-form" onSubmit={handleSubmit}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="maintenance-input"
          required
        />
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="maintenance-input"
          placeholder="Bakım açıklaması"
          required
        />
        <button type="submit" className="maintenance-add-btn">Ekle</button>
      </form>
    </div>
  );
};

export default MaintenanceSection;
