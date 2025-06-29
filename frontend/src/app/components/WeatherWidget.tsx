'use client';

import { useState, useEffect } from 'react';

interface WeatherData {
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    wind: {
      speed: number;
    };
  };
  forecast: Array<{
    date: string;
    temp_max: number;
    temp_min: number;
    weather: {
      main: string;
      description: string;
      icon: string;
    };
  }>;
}

interface WeatherResponse {
  success: boolean;
  data: WeatherData;
  location: string;
  error?: string;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/weather');
      const result: WeatherResponse = await response.json();
      
      if (result.success && result.data) {
        setWeather(result.data);
      } else {
        // API 오류 시에도 더미 데이터 사용
        setWeather(result.data);
        if (result.error) {
          console.warn('날씨 API 경고:', result.error);
        }
      }
    } catch (error) {
      console.error('날씨 정보 로딩 오류:', error);
      setError('날씨 정보를 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (iconCode: string) => {
    // OpenWeather 아이콘 또는 이모지 사용
    const iconMap: { [key: string]: string } = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️',
    };
    return iconMap[iconCode] || '🌤️';
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-3 text-white shadow-md">
        <div className="animate-pulse">
          <div className="h-3 bg-blue-300 rounded mb-2 w-20"></div>
          <div className="h-5 bg-blue-300 rounded mb-2 w-12"></div>
          <div className="h-2 bg-blue-300 rounded w-24"></div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
        <div className="text-center">
          <span className="text-xl">🌤️</span>
          <h3 className="text-sm font-semibold text-gray-700 mt-1">논현동 날씨</h3>
          <p className="text-gray-500 text-xs mt-1">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-3 text-white shadow-md w-full max-w-md">
      <div className="flex items-center justify-between gap-4">
        {/* 현재 날씨 (왼쪽) */}
        <div className="flex items-center gap-3">
        <div>
            <div className="text-xs text-blue-100">📍 논현동</div>
            <div className="text-2xl font-bold">{weather.current.temp}°C</div>
            <div className="text-xs text-blue-100">
              체감 {weather.current.feels_like}° · 습도 {weather.current.humidity}%
        </div>
          </div>
          <div className="text-center">
            <div className="text-3xl">{getWeatherIcon(weather.current.weather[0].icon)}</div>
            <div className="text-xs text-blue-100">{weather.current.weather[0].description}</div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="h-12 w-px bg-blue-300"></div>

        {/* 오늘의 최고/최저 온도 (오른쪽) */}
        <div className="text-center">
          {weather.forecast.slice(0, 1).map((day, index) => (
            <div key={index}>
              <div className="text-xs text-blue-100 mb-1">오늘 예상</div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{getWeatherIcon(day.weather.icon)}</span>
                <div className="text-xs text-blue-100">
                  <div>최고 {day.temp_max}°</div>
                  <div>최저 {day.temp_min}°</div>
      </div>
      </div>
              <div className="text-xs text-blue-200">{day.weather.description}</div>
            </div>
          ))}
          </div>
      </div>
    </div>
  );
} 