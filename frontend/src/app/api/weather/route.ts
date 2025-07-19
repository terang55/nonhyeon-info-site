import { NextResponse } from 'next/server';
import { getEnvVar } from '@/lib/env';

// 인천 남동구 논현동 행정동 중심 좌표
const NONHYEON_LAT = 37.3988;
const NONHYEON_LON = 126.7359;

// OpenWeather API 키는 GET 함수 내에서 검증

// 환경 변수 로드 확인 (개발용)
console.log('🔧 환경 변수 확인:', {
  hasApiKey: !!process.env.OPENWEATHER_API_KEY,
  keyLength: process.env.OPENWEATHER_API_KEY?.length || 0,
  usingFallback: !process.env.OPENWEATHER_API_KEY,
  allEnvKeys: Object.keys(process.env).filter(key => key.includes('OPENWEATHER')),
  nodeEnv: process.env.NODE_ENV
});

interface ForecastItem {
  dt: number;
  main: {
    temp: number;
    temp_max: number;
    temp_min: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
}

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
    air_quality?: {
      pm10: number;
      pm25: number;
      status: string;
      color: string;
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

export async function GET() {
  // 환경변수 검증
  let API_KEY: string;
  try {
    API_KEY = getEnvVar('OPENWEATHER_API_KEY');
    console.log('🌤️ 논현동 날씨 정보 요청 - API 키 검증 완료');
  } catch (error) {
    console.error('❌ OpenWeather API 키가 설정되지 않았습니다:', error);
    throw new Error('API 키가 필요합니다');
  }

  try {

    // 현재 날씨 정보 가져오기
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${NONHYEON_LAT}&lon=${NONHYEON_LON}&appid=${API_KEY}&units=metric&lang=kr`;
    
    // 5일 예보 정보 가져오기
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${NONHYEON_LAT}&lon=${NONHYEON_LON}&appid=${API_KEY}&units=metric&lang=kr`;

    // 미세먼지 정보 가져오기
    const airPollutionUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${NONHYEON_LAT}&lon=${NONHYEON_LON}&appid=${API_KEY}`;

    // 미세먼지 상태 판단 함수
    const getAirQualityStatus = (pm10: number, pm25: number) => {
      // 한국 환경부 기준 (WHO 기준보다 엄격)
      const pm10Status = pm10 <= 30 ? 'good' : pm10 <= 80 ? 'moderate' : pm10 <= 150 ? 'unhealthy' : 'very_unhealthy';
      const pm25Status = pm25 <= 15 ? 'good' : pm25 <= 35 ? 'moderate' : pm25 <= 75 ? 'unhealthy' : 'very_unhealthy';
      
      // 더 나쁜 상태를 기준으로 설정
      const statusPriority = { 'good': 0, 'moderate': 1, 'unhealthy': 2, 'very_unhealthy': 3 };
      const finalStatus = statusPriority[pm10Status] >= statusPriority[pm25Status] ? pm10Status : pm25Status;
      
      const statusMap = {
        'good': { text: '좋음', color: '#3B82F6' },
        'moderate': { text: '보통', color: '#10B981' },
        'unhealthy': { text: '나쁨', color: '#F59E0B' },
        'very_unhealthy': { text: '매우나쁨', color: '#EF4444' }
      };
      
      return statusMap[finalStatus as keyof typeof statusMap];
    };

    console.log('🔗 API 요청 URL:', {
      current: currentWeatherUrl.replace(API_KEY!, 'API_KEY_HIDDEN'),
      forecast: forecastUrl.replace(API_KEY!, 'API_KEY_HIDDEN'),
      airPollution: airPollutionUrl.replace(API_KEY!, 'API_KEY_HIDDEN')
    });

    const [currentResponse, forecastResponse, airPollutionResponse] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl),
      fetch(airPollutionUrl)
    ]);

    console.log('📡 API 응답 상태:', {
      current: currentResponse.status,
      forecast: forecastResponse.status,
      airPollution: airPollutionResponse.status,
      currentOk: currentResponse.ok,
      forecastOk: forecastResponse.ok,
      airPollutionOk: airPollutionResponse.ok
    });

    // 필수 API (날씨, 예보) 체크
    if (!currentResponse.ok || !forecastResponse.ok) {
      const currentError = !currentResponse.ok ? await currentResponse.text() : null;
      const forecastError = !forecastResponse.ok ? await forecastResponse.text() : null;
      
      console.error('❌ 필수 API 응답 에러:', {
        currentStatus: currentResponse.status,
        forecastStatus: forecastResponse.status,
        currentError,
        forecastError
      });
      
      throw new Error(`필수 API 호출 실패: Current(${currentResponse.status}), Forecast(${forecastResponse.status})`);
    }

    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();

    // 미세먼지 API는 선택적으로 처리
    let airPollutionData = null;
    if (airPollutionResponse.ok) {
      try {
        airPollutionData = await airPollutionResponse.json();
        console.log('✅ 미세먼지 API 성공');
      } catch (error) {
        console.error('❌ 미세먼지 데이터 파싱 실패:', error);
      }
    } else {
      const airPollutionError = await airPollutionResponse.text();
      console.error('❌ 미세먼지 API 실패:', {
        status: airPollutionResponse.status,
        error: airPollutionError
      });
    }

    console.log('🌡️ 현재 날씨 원본 데이터:', {
      온도: currentData.main.temp,
      체감온도: currentData.main.feels_like,
      습도: currentData.main.humidity,
      날씨: currentData.weather[0]
    });
    
    if (airPollutionData) {
      console.log('🌡️ 미세먼지 원본 데이터:', {
        PM10: airPollutionData.list[0].components.pm10,
        PM25: airPollutionData.list[0].components.pm2_5,
        전체데이터: airPollutionData.list[0]
      });
    } else {
      console.log('⚠️ 미세먼지 데이터 없음 - 기본값 사용');
    }
    
    console.log('📅 예보 데이터 첫 5개 항목:', 
      forecastData.list.slice(0, 5).map((item: ForecastItem) => ({
        시간: new Date(item.dt * 1000).toLocaleString('ko-KR'),
        온도: item.main.temp,
        날씨: item.weather[0].description
      }))
    );

    // 5일 예보 데이터 처리 (하루별 최고/최저 온도 계산)
    const dailyForecastMap = new Map();
    
    forecastData.list.forEach((item: ForecastItem) => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toDateString(); // 날짜별로 그룹화
      
      if (!dailyForecastMap.has(dateKey)) {
        dailyForecastMap.set(dateKey, {
          date: date.toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric',
            weekday: 'short'
          }),
          temps: [],
          weather: item.weather[0], // 첫 번째 날씨 정보 사용
          dt: item.dt
        });
      }
      
      // 해당 날짜의 온도 데이터 추가
      dailyForecastMap.get(dateKey)!.temps.push(item.main.temp);
    });
    
    // 날짜별 최고/최저 온도 계산
    const dailyForecast = Array.from(dailyForecastMap.values())
      .slice(0, 5) // 5일치만
      .map(day => {
        const maxTemp = Math.round(Math.max(...day.temps));
        const minTemp = Math.round(Math.min(...day.temps));
        
        console.log(`📊 ${day.date} 온도 분석:`, {
          원본온도들: day.temps,
          최고온도: maxTemp,
          최저온도: minTemp,
          온도차: maxTemp - minTemp
        });
        
        return {
          date: day.date,
          temp_max: maxTemp,
          temp_min: minTemp,
          weather: {
            main: day.weather.main,
            description: day.weather.description,
            icon: day.weather.icon
          }
        };
      });

    // 날씨 데이터 구성
    const weatherData: WeatherData = {
      current: {
        temp: Math.round(currentData.main.temp),
        feels_like: Math.round(currentData.main.feels_like),
        humidity: currentData.main.humidity,
        weather: currentData.weather,
        wind: {
          speed: Math.round(currentData.wind.speed * 10) / 10 // 소수점 1자리
        }
      },
      forecast: dailyForecast
    };

    // 미세먼지 데이터가 있으면 추가
    if (airPollutionData) {
      const pm10 = Math.round(airPollutionData.list[0].components.pm10);
      const pm25 = Math.round(airPollutionData.list[0].components.pm2_5);
      const airQualityStatus = getAirQualityStatus(pm10, pm25);
      
      weatherData.current.air_quality = {
        pm10,
        pm25,
        status: airQualityStatus.text,
        color: airQualityStatus.color
      };
    }

    console.log('✅ 날씨 정보 조회 성공');

    return NextResponse.json({
      success: true,
      data: weatherData,
      location: '인천 남동구 논현동',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 날씨 API 오류:', error);
    
    // 오류 시 더미 데이터 반환 (개발용)
    return NextResponse.json({
      success: false,
      error: '날씨 정보를 불러올 수 없습니다',
      data: {
        current: {
          temp: 22,
          feels_like: 25,
          humidity: 65,
          weather: [{
            main: 'Clear',
            description: '맑음',
            icon: '01d'
          }],
          wind: {
            speed: 2.1
          },
          air_quality: {
            pm10: 25,
            pm25: 12,
            status: '좋음',
            color: '#3B82F6'
          }
        },
        forecast: [
          {
            date: new Date().toLocaleDateString('ko-KR', {
              month: 'short',
              day: 'numeric',
              weekday: 'short'
            }),
            temp_max: 28,
            temp_min: 22,
            weather: {
              main: 'Clear',
              description: '맑음',
              icon: '01d'
            }
          },
          {
            date: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR', {
              month: 'short',
              day: 'numeric',
              weekday: 'short'
            }),
            temp_max: 26,
            temp_min: 19,
            weather: {
              main: 'Clouds',
              description: '구름많음',
              icon: '03d'
            }
          },
          {
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR', {
              month: 'short',
              day: 'numeric',
              weekday: 'short'
            }),
            temp_max: 24,
            temp_min: 17,
            weather: {
              main: 'Rain',
              description: '비',
              icon: '10d'
            }
          }
        ]
      },
      location: '인천 남동구 논현동',
      timestamp: new Date().toISOString()
    }, { status: 200 }); // 개발용이므로 200 상태 코드 유지
  }
} 