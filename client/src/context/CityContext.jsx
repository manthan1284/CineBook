import React, { createContext, useContext, useState, useEffect } from 'react';

const CityContext = createContext();

export const CITIES = [
  { name: 'Mumbai', state: 'Maharashtra', isPopular: true },
  { name: 'Delhi-NCR', state: 'Delhi', isPopular: true },
  { name: 'Bengaluru', state: 'Karnataka', isPopular: true },
  { name: 'Hyderabad', state: 'Telangana', isPopular: true },
  { name: 'Chennai', state: 'Tamil Nadu', isPopular: true },
  { name: 'Kolkata', state: 'West Bengal', isPopular: false },
  { name: 'Pune', state: 'Maharashtra', isPopular: false },
  { name: 'Ahmedabad', state: 'Gujarat', isPopular: false },
];

export const CityProvider = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem('cinebook_city') || 'Mumbai';
  });
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cinebook_city', selectedCity);
  }, [selectedCity]);

  const selectCity = (city) => {
    setSelectedCity(city);
    setIsCityModalOpen(false);
  };

  return (
    <CityContext.Provider
      value={{
        selectedCity,
        selectCity,
        isCityModalOpen,
        setIsCityModalOpen,
        cities: CITIES,
      }}
    >
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => useContext(CityContext);
