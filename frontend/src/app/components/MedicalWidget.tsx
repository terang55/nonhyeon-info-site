'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface MedicalInfo {
  id: string;
  name: string;
  category: string;
  address: string;
  roadAddress: string;
  phone?: string;
  distance: number;
  x: string;
  y: string;
  url?: string;
  type: 'hospital' | 'pharmacy';
  specialties?: string[];
  hasEmergency?: boolean;
  hasNightCare?: boolean;
  weekdayHours?: string;
  weekendHours?: {
    sat?: string;
    sun?: string;
  };
  holidayHours?: string;
  is24Hours?: boolean;
}

interface MedicalApiResponse {
  success: boolean;
  data: MedicalInfo[];
  total: number;
  timestamp: string;
  params: {
    type: string;
    category?: string;
    emergency?: boolean;
    night?: boolean;
    radius: number;
  };
  note?: string;
}

interface MedicalWidgetProps {
  initialType?: 'all' | 'hospital' | 'pharmacy';
}

const NONHYEON_LAT = 37.4011; // 논현역 위도
const NONHYEON_LON = 126.7229; // 논현역 경도

const MedicalWidget: React.FC<MedicalWidgetProps> = ({ initialType = 'all' }) => {
  const [medicalData, setMedicalData] = useState<MedicalInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'hospital' | 'pharmacy'>(initialType);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [nightOnly, setNightOnly] = useState(false);
  const [satOpenOnly, setSatOpenOnly] = useState(false);
  const [sunOpenOnly, setSunOpenOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 최초 로드 시 바로 데이터를 가져오기 위해 true로 설정
  const [isDataLoaded, setIsDataLoaded] = useState(true);
  // 사용자 위치 상태 추가
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationTried, setLocationTried] = useState(false); // 위치 권한 시도 여부

  // 위치 정보 요청 함수 (버튼 클릭 시 실행)
  const requestUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          setLocationError(null);
          setLocationTried(true);
        },
        () => {
          setUserLocation({ lat: NONHYEON_LAT, lon: NONHYEON_LON }); // 권한 거부 시 논현역 고정
          setLocationError('위치 권한이 거부되어 논현역 기준으로 거리를 표시합니다.');
          setLocationTried(true);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setUserLocation({ lat: NONHYEON_LAT, lon: NONHYEON_LON });
      setLocationError('이 브라우저는 위치 정보를 지원하지 않습니다. 논현역 기준으로 거리를 표시합니다.');
      setLocationTried(true);
    }
  };

  // 최초 진입 시에는 위치 권한 요청하지 않음
  useEffect(() => {
    // 아무 동작 없음 (버튼 클릭 시에만 위치 요청)
  }, []);

  const fetchMedicalData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedType !== 'pharmacy') {
      if (emergencyOnly) params.append('emergency', 'true');
      if (nightOnly) params.append('night', 'true');
      }
      params.append('radius', '2000'); // 2km 반경
      // 내 위치 정보 추가
      if (userLocation) {
        params.append('lat', userLocation.lat.toString());
        params.append('lon', userLocation.lon.toString());
      }

      const response = await fetch(`/api/medical?${params.toString()}`);
      const result: MedicalApiResponse = await response.json();

      if (result.success) {
        let filtered = result.data;

        // 약국 전용 필터: 토/일 영업
        if (selectedType === 'pharmacy') {
          if (satOpenOnly) {
            filtered = filtered.filter(p => p.weekendHours?.sat);
          }
          if (sunOpenOnly) {
            filtered = filtered.filter(p => p.weekendHours?.sun);
          }
        }

        setMedicalData(filtered);
        setIsDataLoaded(true);
      } else {
        setError('의료기관 정보를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('의료기관 API 오류:', error);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedCategory, emergencyOnly, nightOnly, satOpenOnly, sunOpenOnly, userLocation]);

  useEffect(() => {
    if (isDataLoaded) {
      fetchMedicalData();
    }
  }, [isDataLoaded, fetchMedicalData]);

  const getTypeIcon = (type: 'hospital' | 'pharmacy') => {
    return type === 'hospital' ? '🏥' : '💊';
  };

  const getDistanceText = (distance: number) => {
    if (distance < 1000) {
      return `${distance}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  };

  const getSpecialtyBadges = (specialties?: string[]) => {
    if (!specialties || specialties.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {specialties.slice(0, 4).map((specialty, index) => (
          <span 
            key={index}
            className="px-2.5 py-1 text-xs sm:text-sm bg-blue-100 text-blue-800 rounded-full font-medium"
          >
            {specialty}
          </span>
        ))}
        {specialties.length > 4 && (
          <span className="px-2.5 py-1 text-xs sm:text-sm bg-gray-100 text-gray-600 rounded-full font-medium">
            +{specialties.length - 4}
          </span>
        )}
      </div>
    );
  };

  const categories = [
    '내과',
    '외과',
    '정형외과',
    '소아청소년과',
    '이비인후과',
    '안과',
    '치과',
    '피부과',
    '기타'
  ];

  const showTypeSelector = initialType === 'all';

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
      {/* 내 위치 기준 거리 안내 및 버튼 */}
      <div className="mb-2 text-sm text-blue-800 bg-blue-50 rounded px-3 py-2 leading-relaxed">
        <span>📍 위치 권한을 허용하면 내 위치 기준으로 거리가 표시됩니다.</span><br />
        {locationTried ? (
          locationError ? (
            <span>📍 {locationError}</span>
          ) : (
            <span>📍 내 위치 기준 거리로 정렬됩니다.</span>
          )
        ) : (
          <button
            onClick={requestUserLocation}
            className="mt-2 px-4 py-2.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium min-h-[40px]"
          >
            내 위치로 거리 재계산
          </button>
        )}
      </div>
      {!isDataLoaded && !loading ? (
        /* --- 초기 안내/로딩 전 --- */
        <>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏥</div>
          <h3 className="text-xl font-medium text-gray-900 mb-3 leading-relaxed">
              {selectedType === 'pharmacy' ? '논현동 주변 약국 정보' : selectedType === 'hospital' ? '논현동 주변 병원 정보' : '논현동 주변 병원/약국 정보'}
          </h3>
          <p className="text-gray-700 mb-6 max-w-md mx-auto text-base sm:text-lg leading-relaxed">
              논현동의 모든 의료기관 정보를 확인하세요.
              공공데이터(보건복지부) + 위치기반 거리정보로 최신 상태를 제공합니다.
          </p>
          <button
            onClick={fetchMedicalData}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium flex items-center gap-2 mx-auto text-base sm:text-lg min-h-[48px]"
          >
            <span>🔍</span>
              {selectedType === 'pharmacy' ? '약국 정보 보기' : selectedType === 'hospital' ? '병원 정보 보기' : '병원/약국 정보 보기'}
          </button>
          <div className="mt-4 text-sm sm:text-base text-gray-600 space-y-1 leading-relaxed">
            <div>💡 실시간 정보 • 전화연결 • 지도보기</div>
            <div>진료과목 필터링 • 응급실/야간진료 검색</div>
          </div>
        </div>
        </>
      ) : (
        /* --- 실제 데이터/필터/리스트 --- */
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
              {selectedType === 'pharmacy' ? '💊 논현동 약국 정보' : selectedType === 'hospital' ? '🏥 논현동 병원 정보' : '🏥 논현동 병원/약국 정보'}
            </h2>
            <button
              onClick={fetchMedicalData}
              disabled={loading}
              className="px-4 py-3 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 min-h-[44px] min-w-[88px]"
            >
              {loading ? '⟳' : '새로고침'}
            </button>
          </div>

          {/* 타입 선택 (전체 모드에서만 표시) */}
          {showTypeSelector && (
            <div className="overflow-x-auto">
              <div className="flex gap-2 pb-2 min-w-max">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`px-5 py-3 text-sm font-medium rounded-full border whitespace-nowrap min-h-[44px] ${
                    selectedType === 'all'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50 active:bg-gray-100'
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => setSelectedType('hospital')}
                  className={`px-5 py-3 text-sm font-medium rounded-full border whitespace-nowrap min-h-[44px] ${
                    selectedType === 'hospital'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50 active:bg-gray-100'
                  }`}
                >
                  🏥 병원
                </button>
                <button
                  onClick={() => setSelectedType('pharmacy')}
                  className={`px-5 py-3 text-sm font-medium rounded-full border whitespace-nowrap min-h-[44px] ${
                    selectedType === 'pharmacy'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50 active:bg-gray-100'
                  }`}
                >
                  💊 약국
                </button>
              </div>
            </div>
          )}

            {/* 진료과목 선택 */}
            {selectedType !== 'pharmacy' && (
              <div className="overflow-x-auto">
                <div className="flex gap-2 pb-2 min-w-max">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`px-5 py-3 text-sm font-medium rounded-full border whitespace-nowrap min-h-[44px] ${
                      selectedCategory === ''
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50 active:bg-gray-100'
                    }`}
                  >
                    전체과목
                  </button>
                {categories.map((cat) => (
                    <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                      className={`px-5 py-3 text-sm font-medium rounded-full border whitespace-nowrap min-h-[44px] ${
                      selectedCategory === cat
                          ? 'bg-green-500 text-white border-green-500'
                          : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50 active:bg-gray-100'
                      }`}
                    >
                    {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 특수 옵션 */}
            <div className="flex flex-wrap gap-4">
            {selectedType === 'pharmacy' ? (
              <>
                <label className="flex items-center text-base text-gray-800 cursor-pointer min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={satOpenOnly}
                    onChange={(e) => setSatOpenOnly(e.target.checked)}
                    className="mr-3 w-5 h-5"
                  />
                  <span className="font-medium">📅 토요일 오픈</span>
                </label>
                <label className="flex items-center text-base text-gray-800 cursor-pointer min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={sunOpenOnly}
                    onChange={(e) => setSunOpenOnly(e.target.checked)}
                    className="mr-3 w-5 h-5"
                  />
                  <span className="font-medium">☀️ 일요일 오픈</span>
                </label>
              </>
            ) : (
              <>
              <label className="flex items-center text-base text-gray-800 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={emergencyOnly}
                  onChange={(e) => setEmergencyOnly(e.target.checked)}
                  className="mr-3 w-5 h-5"
                />
                <span className="font-medium">🚨 응급실만</span>
              </label>
              <label className="flex items-center text-base text-gray-800 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={nightOnly}
                  onChange={(e) => setNightOnly(e.target.checked)}
                  className="mr-3 w-5 h-5"
                />
                <span className="font-medium">🌙 야간진료만</span>
              </label>
              </>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-700 mt-4 text-base sm:text-lg leading-relaxed">의료기관 정보를 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-red-700 mb-4 text-base sm:text-lg leading-relaxed">{error}</p>
              <button
                onClick={fetchMedicalData}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 font-medium min-h-[48px] text-base"
              >
                다시 시도
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {medicalData.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 leading-relaxed">
                    검색 결과가 없습니다
                  </h3>
                  <p className="text-base text-gray-700 max-w-sm mx-auto leading-relaxed">
                    검색 조건을 조정하거나 필터를 변경해보세요
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4 bg-gray-50 rounded-lg p-3">
                    <div className="text-sm sm:text-base font-medium text-gray-700">
                      💡 총 <span className="text-blue-600 font-bold">{medicalData.length}</span>개 의료기관 발견
                    </div>
                    <div className="text-xs text-gray-500">
                      거리순 정렬
                    </div>
                  </div>
                  {medicalData.map((place) => (
                    <div
                      key={place.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                    >
                      {/* 헤더 정보 */}
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-xl sm:text-2xl">{getTypeIcon(place.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-base sm:text-lg text-gray-800 truncate">
                              {place.name}
                            </h3>
                            <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
                              {getDistanceText(place.distance)}
                            </span>
                          </div>
                          
                          {/* 특수 태그 */}
                          {(place.hasEmergency || place.hasNightCare) && (
                            <div className="flex items-center gap-2 mb-2">
                              {place.hasEmergency && (
                                <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                                  🚨 응급실
                                </span>
                              )}
                              {place.hasNightCare && (
                                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                  🌙 야간진료
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 주소 정보 */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="text-base mt-0.5">📍</span>
                          <span className="flex-1 leading-relaxed">
                            {place.roadAddress || place.address}
                          </span>
                        </div>
                        
                        {place.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-base">📞</span>
                            <a 
                              href={`tel:${place.phone}`}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {place.phone}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* 진료과목 배지 */}
                      {getSpecialtyBadges(place.specialties)}

                      {/* 진료/영업 시간 */}
                      {(() => {
                        if (place.is24Hours) {
                          return (
                            <div className="mt-3 text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-base">⏰</span>
                              <span className="leading-relaxed">24시간 운영</span>
                            </div>
                          );
                        }

                        const parts: string[] = [];
                        if (place.weekdayHours) parts.push(`평일 ${place.weekdayHours}`);
                        if (place.weekendHours?.sat) parts.push(`토 ${place.weekendHours.sat}`);
                        if (place.weekendHours?.sun) parts.push(`일 ${place.weekendHours.sun}`);
                        if (place.holidayHours) parts.push(`공휴일 ${place.holidayHours}`);

                        if (parts.length === 0) return null;

                        return (
                          <div className="mt-3 text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-base">⏰</span>
                            <span className="leading-relaxed">{parts.join(' / ')}</span>
                          </div>
                        );
                      })()}

                      {/* 액션 버튼들 */}
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                        {place.phone && (
                          <a
                            href={`tel:${place.phone}`}
                            className="flex-1 px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 text-center transition-colors min-h-[36px] flex items-center justify-center"
                          >
                            📞 전화걸기
                          </a>
                        )}
                        <a
                          href={`https://map.kakao.com/link/map/${place.name},${place.y},${place.x}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-4 py-2 text-sm font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 active:bg-green-700 text-center transition-colors min-h-[36px] flex items-center justify-center"
                        >
                          🗺️ 지도보기
                        </a>
                        {place.url && (
                          <a
                            href={place.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 text-sm font-medium bg-gray-500 text-white rounded-lg hover:bg-gray-600 active:bg-gray-700 text-center transition-colors min-h-[36px] flex items-center justify-center"
                          >
                            ℹ️
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
              )}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <div className="text-xs sm:text-sm text-gray-500 space-y-1">
          <div className="font-medium">📍 논현동의 의료기관 정보</div>
          <div className="text-gray-400">보건복지부 공공데이터 • 거리순 정렬</div>
            </div>
          </div>
    </div>
  );
};

export default MedicalWidget; 