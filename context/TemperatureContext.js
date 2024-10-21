import React, { createContext, useState } from "react";

export const TemperatureContext = createContext();

export const TemperatureProvider = ({ children }) => {
  const [isCelsius, setIsCelsius] = useState(true);
  const [cityName, setCityName] = useState("lagos"); // Thêm state cho tên thành phố

  const toggleTemperatureUnit = () => {
    setIsCelsius((prev) => !prev);
  };

  return (
    <TemperatureContext.Provider value={{ isCelsius, toggleTemperatureUnit, cityName, setCityName }}>
      {children}
    </TemperatureContext.Provider>
  );
};
