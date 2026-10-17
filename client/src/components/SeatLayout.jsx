import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

const SeatLayout = ({
  screenConfig,
  pricing,
  selectedSeats,
  onToggleSeat,
  bookedSeats = [],
  lockedSeats = [], // locked by other users
  blockedSeats = [],
  maxSeats = 8,
}) => {
  const rows = screenConfig?.layoutConfig?.rows || ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const cols = screenConfig?.layoutConfig?.cols || 16;
  const aisleIndices = screenConfig?.layoutConfig?.aisleIndices || [4, 12];

  // Helper to determine category of a row
  const getCategory = (row) => {
    if (['A', 'B'].includes(row)) return 'Platinum';
    if (['C', 'D', 'E', 'F'].includes(row)) return 'Gold';
    return 'Silver';
  };

  const getPrice = (row) => {
    const cat = getCategory(row);
    if (cat === 'Platinum') return pricing?.platinum || 450;
    if (cat === 'Gold') return pricing?.gold || 280;
    return pricing?.silver || 180;
  };

  // Check seat state
  const getSeatStatus = (seatNum) => {
    if (blockedSeats.includes(seatNum)) return 'blocked';
    if (bookedSeats.includes(seatNum)) return 'booked';
    if (lockedSeats.includes(seatNum)) return 'locked';
    if (selectedSeats.some((s) => s.seatNumber === seatNum)) return 'selected';
    return 'available';
  };

  const handleSeatClick = (row, colNum) => {
    const seatNum = `${row}${colNum}`;
    const status = getSeatStatus(seatNum);

    if (status === 'booked' || status === 'locked' || status === 'blocked') {
      return;
    }

    const price = getPrice(row);
    const category = getCategory(row);

    onToggleSeat({
      seatNumber: seatNum,
      row,
      col: colNum,
      category,
      price,
    });
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto', padding: '1rem 0' }}>
      {/* Curved Screen Indicator */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '3rem',
          perspective: '600px',
        }}
      >
        <div
          style={{
            width: '80%',
            maxWidth: '680px',
            height: '14px',
            borderRadius: '50% 50% 0 0',
            borderTop: '5px solid #E50914',
            boxShadow: '0 -6px 20px rgba(229, 9, 20, 0.45)',
            transform: 'rotateX(-25deg)',
          }}
        />
        <div
          style={{
            fontSize: '0.75rem',
            letterSpacing: '0.25em',
            fontWeight: 800,
            color: '#8A8A9E',
            marginTop: '0.5rem',
          }}
        >
          SCREEN THIS WAY
        </div>
      </div>

      {/* Seat Rows Grid */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          minWidth: '650px',
          margin: '0 auto',
          maxWidth: '850px',
        }}
      >
        {rows.map((row) => {
          const category = getCategory(row);
          const price = getPrice(row);

          // Render tier header when first row of a tier appears
          const isTierStart =
            (row === 'A') ||
            (row === 'C') ||
            (row === 'G');

          return (
            <React.Fragment key={row}>
              {isTierStart && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0 0.25rem 0',
                    borderBottom: '1px dashed #262635',
                    marginTop: row === 'A' ? 0 : '1rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      color: category === 'Platinum' ? '#F5C518' : category === 'Gold' ? '#E50914' : '#A0A0B2',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {category} RECLINERS & SEATS • ₹{price}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                {/* Row Label */}
                <div
                  style={{
                    width: '24px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    color: '#8A8A9E',
                    textAlign: 'center',
                  }}
                >
                  {row}
                </div>

                {/* Seats in Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    flex: 1,
                    justifyContent: 'center',
                  }}
                >
                  {Array.from({ length: cols }, (_, i) => i + 1).map((colNum) => {
                    const seatNum = `${row}${colNum}`;
                    const status = getSeatStatus(seatNum);
                    const isAisle = aisleIndices.includes(colNum);

                    let seatBg = 'var(--seat-available)';
                    let seatBorder = 'var(--seat-available-border)';
                    let seatCursor = 'pointer';
                    let seatColor = '#fff';

                    if (status === 'selected') {
                      seatBg = 'var(--color-primary)';
                      seatBorder = 'var(--color-primary)';
                      seatColor = '#fff';
                    } else if (status === 'booked') {
                      seatBg = 'var(--seat-booked)';
                      seatBorder = 'transparent';
                      seatCursor = 'not-allowed';
                      seatColor = '#5A5A6E';
                    } else if (status === 'locked') {
                      seatBg = '#3D2800';
                      seatBorder = '#B45309';
                      seatCursor = 'not-allowed';
                      seatColor = '#F59E0B';
                    } else if (status === 'blocked') {
                      seatBg = '#2A1212';
                      seatBorder = '#551A1A';
                      seatCursor = 'not-allowed';
                      seatColor = '#883333';
                    }

                    return (
                      <React.Fragment key={seatNum}>
                        <button
                          type="button"
                          onClick={() => handleSeatClick(row, colNum)}
                          disabled={status === 'booked' || status === 'locked' || status === 'blocked'}
                          title={`Seat ${seatNum} (${category} - ₹${price})`}
                          style={{
                            width: '30px',
                            height: '28px',
                            borderRadius: '5px 5px 2px 2px',
                            background: seatBg,
                            border: `1.5px solid ${seatBorder}`,
                            color: seatColor,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: seatCursor,
                            transition: 'all 0.15s ease',
                            boxShadow:
                              status === 'selected'
                                ? '0 0 10px rgba(229, 9, 20, 0.7)'
                                : 'none',
                          }}
                        >
                          {colNum}
                        </button>

                        {/* Aisle Spacer */}
                        {isAisle && <div style={{ width: '16px' }} />}
                      </React.Fragment>
                    );
                  })}
                </div>

                <div
                  style={{
                    width: '24px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    color: '#8A8A9E',
                    textAlign: 'center',
                  }}
                >
                  {row}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '1.75rem',
          marginTop: '2.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #1C1C28',
          fontSize: '0.85rem',
          color: 'var(--color-text-secondary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '20px',
              height: '18px',
              borderRadius: '4px',
              background: 'var(--seat-available)',
              border: '1.5px solid var(--seat-available-border)',
            }}
          />
          <span>Available</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '20px',
              height: '18px',
              borderRadius: '4px',
              background: 'var(--color-primary)',
              boxShadow: '0 0 8px rgba(229, 9, 20, 0.7)',
            }}
          />
          <span>Selected</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '20px',
              height: '18px',
              borderRadius: '4px',
              background: 'var(--seat-booked)',
            }}
          />
          <span>Booked</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '20px',
              height: '18px',
              borderRadius: '4px',
              background: '#3D2800',
              border: '1px solid #B45309',
            }}
          />
          <span>Held by guest</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '20px',
              height: '18px',
              borderRadius: '4px',
              background: '#2A1212',
              border: '1px solid #551A1A',
            }}
          />
          <span>Blocked/VIP</span>
        </div>
      </div>
    </div>
  );
};

export default SeatLayout;
