import { useState, useEffect, useRef } from "react";
import apiClient from "../api";

const WeatherWidget = ({ config }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const previousCity = useRef(""); // Track previous city

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const city = config?.city || "London";
        // Force refresh if city changed
        const refresh = city !== previousCity.current;
        previousCity.current = city;

        const response = await apiClient.get(
          `/weather/current/?city=${encodeURIComponent(city)}${
            refresh ? "&refresh=true" : ""
          }`
        );

        if (response.data.success) {
          setWeatherData(response.data);
          setError("");
        } else {
          setError(response.data.message || "Failed to fetch weather data");
        }
      } catch (err) {
        setError("Failed to connect to weather service");
        console.error("Weather API error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [config?.city]);

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  if (loading)
    return <div className="widget-loading">Loading weather data...</div>;
  if (error) return <div className="widget-error">{error}</div>;

  return (
    <div className="weather-widget">
      <h4>Weather {config?.city && `(${config.city})`}</h4>
      {weatherData ? (
        <div className="weather-content">
          <div className="weather-header">
            <span className="weather-location">📍 {weatherData.location}</span>
            {weatherData.icon && (
              <img
                src={getWeatherIcon(weatherData.icon)}
                alt={weatherData.condition}
                className="weather-icon"
              />
            )}
          </div>
          <div className="weather-stats">
            <p className="weather-temp">🌡️ {weatherData.temperature}°C</p>
            <p className="weather-condition">{weatherData.condition}</p>
            <p className="weather-humidity">
              💧 Humidity: {weatherData.humidity}%
            </p>
            {weatherData.wind_speed && (
              <p className="weather-wind">
                💨 Wind: {weatherData.wind_speed} m/s
              </p>
            )}
          </div>
        </div>
      ) : (
        <p>No weather data available</p>
      )}
    </div>
  );
};

export default WeatherWidget;
