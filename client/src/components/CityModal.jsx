import React from 'react';
import { useCity } from '../context/CityContext';
import { MapPin, X, Check } from 'lucide-react';

const CityModal = () => {
  const { selectedCity, selectCity, isCityModalOpen, setIsCityModalOpen, cities } = useCity();

  if (!isCityModalOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setIsCityModalOpen(false)}>
      <div
        className="modal-content"
        style={{ maxWidth: '520px', padding: '1.75rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setIsCityModalOpen(false)}
          className="modal-close-btn"
        >
          <X size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
          <MapPin size={22} color="var(--color-primary)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Select Your City</h2>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
          Select a city to explore local multiplexes, IMAX shows, and live seat availability.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          {cities.map((city) => {
            const isSelected = selectedCity === city.name;
            return (
              <button
                key={city.name}
                onClick={() => selectCity(city.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  border: isSelected
                    ? '1.5px solid var(--color-primary)'
                    : '1px solid var(--color-border-subtle)',
                  background: isSelected
                    ? 'rgba(229, 9, 20, 0.12)'
                    : 'var(--color-bg-base)',
                  color: isSelected ? '#FFFFFF' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: isSelected ? '#fff' : '#ddd' }}>
                    {city.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {city.state}
                  </div>
                </div>
                {isSelected && <Check size={16} color="var(--color-primary)" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CityModal;
