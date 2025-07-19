import { NextRequest, NextResponse } from 'next/server';
import { getEnvVar, hasEnvVar } from '@/lib/env';

// 인천논현역 중심 좌표 (Suin·Bundang Line)
const NONHYEON_LAT = 37.4011;
const NONHYEON_LON = 126.7229;

// API 키들은 GET 함수 내에서 검증

// 전역 캐시 (메모리) 설정 - 10분간 유지
const CACHE_TTL = 10 * 60 * 1000; // 10분(ms)
let hiraHospitalCache: { items: HiraHospitalItem[]; timestamp: number } | null = null;
let hiraPharmacyCache: { items: unknown[]; timestamp: number } | null = null;

// 환경변수 검증은 GET 함수 내에서 수행

interface MedicalInfo {
  id: string;
  name: string;
  category: string;
  address: string;
  roadAddress: string;
  phone?: string;
  distance: number;
  x: string; // 경도
  y: string; // 위도
  url?: string;
  isOpen?: boolean;
  openTime?: string;
  type: 'hospital' | 'pharmacy';
  specialties?: string[]; // 진료과목
  hasEmergency?: boolean; // 응급실 여부
  hasNightCare?: boolean; // 야간진료 여부

  // --- 추가 필드: 주말/공휴일 운영 정보 ---
  weekendHours?: {
    sat?: string; // 예: "09:00~18:00"
    sun?: string; // 예: "09:00~18:00"
  };
  holidayHours?: string;  // 공휴일 운영시간
  is24Hours?: boolean;    // 365일 24시간 여부
  weekdayHours?: string; // 평일 진료시간
}

interface KakaoSearchResult {
  documents: Array<{
    id: string;
    place_name: string;
    category_name: string;
    address_name: string;
    road_address_name: string;
    phone: string;
    place_url: string;
    distance: string;
    x: string;
    y: string;
  }>;
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
}



// 진료과목 추출 함수
function extractSpecialties(categoryName: string): string[] {
  const specialties: string[] = [];
  
  if (categoryName.includes('종합병원')) specialties.push('종합진료');
  if (categoryName.includes('내과')) specialties.push('내과');
  if (categoryName.includes('외과')) specialties.push('외과');
  if (categoryName.includes('정형외과')) specialties.push('정형외과');
  if (categoryName.includes('산부인과')) specialties.push('산부인과');
  if (categoryName.includes('소아청소년과') || categoryName.includes('소아과')) {
    specialties.push('소아청소년과');
  }
  if (categoryName.includes('이비인후과')) specialties.push('이비인후과');
  if (categoryName.includes('안과')) specialties.push('안과');
  if (categoryName.includes('치과')) specialties.push('치과');
  if (categoryName.includes('피부과')) specialties.push('피부과');
  if (categoryName.includes('비뇨기과')) specialties.push('비뇨기과');
  if (categoryName.includes('신경과')) specialties.push('신경과');
  if (categoryName.includes('정신건강의학과') || categoryName.includes('정신과')) specialties.push('정신건강의학과');
  if (categoryName.includes('성형외과')) specialties.push('성형외과');
  if (categoryName.includes('통증') || categoryName.includes('마취통증')) specialties.push('통증의학과');
  if (categoryName.includes('가정의학과') || categoryName.includes('일반의원')) specialties.push('가정의학과');
  if (categoryName.includes('한방')) specialties.push('한방');
  
  return specialties;
}

// 응급실 여부 확인
function hasEmergency(categoryName: string, placeName: string): boolean {
  return categoryName.includes('응급실') || 
         placeName.includes('응급') || 
         placeName.includes('24시간') ||
         categoryName.includes('종합병원');
}

// 야간진료 여부 확인 (추정)
function hasNightCare(placeName: string, categoryName: string): boolean {
  return placeName.includes('24시간') || 
         placeName.includes('야간') || 
         placeName.includes('24H') ||
         categoryName.includes('응급실');
}

// HIRA 약국 목록 조회 (남동구 논현동 전체)
async function fetchHiraPharmacyList(HIRA_API_KEY?: string) {
  // 캐시 확인
  if (hiraPharmacyCache && Date.now() - hiraPharmacyCache.timestamp < CACHE_TTL) {
    return hiraPharmacyCache.items;
  }

  if (!HIRA_API_KEY) return [];

  const tryFetch = async (svcKey: string) => {
    const params = new URLSearchParams({
      serviceKey: svcKey,
      Q0: '인천광역시',
      Q1: '남동구',
      ORD: 'NAME',
      pageNo: '1',
      numOfRows: '1000'
    });
    const url = `http://apis.data.go.kr/B552657/ErmctInsttInfoInqireService/getParmacyListInfoInqire?${params}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.error('❌ HIRA 약국 API 호출 실패', response.status);
      return [];
    }
    const xml = await response.text();
    try {
      const { XMLParser } = await import('fast-xml-parser');
      const parser = new XMLParser({ ignoreAttributes: false });
      const json = parser.parse(xml);
      const items = json?.response?.body?.items?.item;
      return items ? (Array.isArray(items) ? items : [items]) : [];
    } catch (err) {
      console.error('❌ HIRA XML 파싱 실패', err);
      return [];
    }
  };

  // 1차: 디코딩한 키 사용 (중복 인코딩 방지)
  const decodedKey = HIRA_API_KEY.includes('%') ? decodeURIComponent(HIRA_API_KEY) : HIRA_API_KEY;
  let list = await tryFetch(decodedKey);

  // 2차: 원본 키 재시도 (응답이 없을 때)
  if (list.length === 0 && decodedKey !== HIRA_API_KEY) {
    console.warn('⚠️ 디코딩 키로 결과 없음, 원본 키로 재시도');
    list = await tryFetch(HIRA_API_KEY);
  }

  console.log('ℹ️ HIRA 원본 약국 건수:', list.length);

  // 캐시 저장
  hiraPharmacyCache = { items: list, timestamp: Date.now() };

  return list;
}

// ---------------------------------------------------------------------------
// HIRA 병원 목록 조회 (남동구 논현동/논현지구)
//   - 종합병원, 병원, 요양병원, 정신병원 등 포함
//   - 좌표 미제공 시 Kakao 지오코딩으로 보정
// ---------------------------------------------------------------------------
interface HiraHospitalItem {
  addr: string;
  clCd: string;      // 11: 종합병원, 21: 병원, 28: 요양병원, 29: 정신병원 등
  clCdNm: string;
  emdongNm?: string;
  sgguCd: string;
  sidoCd: string;
  telno?: string;
  hospUrl?: string;  // 병원 홈페이지 URL
  XPos?: string;     // 경도
  YPos?: string;     // 위도
  yadmNm: string;    // 병원명
  ykiho: string;     // 고유 ID
}

async function fetchHiraHospitalList(HIRA_API_KEY?: string): Promise<HiraHospitalItem[]> {
  // 캐시 확인
  if (hiraHospitalCache && Date.now() - hiraHospitalCache.timestamp < CACHE_TTL) {
    return hiraHospitalCache.items;
  }

  if (!HIRA_API_KEY) return [];

  const tryFetchPage = async (svcKey: string, page: number): Promise<{ items: HiraHospitalItem[]; total: number }> => {
    const params = new URLSearchParams({
      ServiceKey: svcKey,
      sidoCd: '220000',      // 인천광역시 코드
      sgguCd: '220006',      // 인천 남동구
      emdongNm: '논현동',    // 행정동(논현동)으로 범위 제한
      numOfRows: '100',
      pageNo: String(page)
    });
    const url = `https://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList?${params}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.error('❌ HIRA 병원 API 호출 실패', response.status);
      return { items: [], total: 0 };
    }
    const xml = await response.text();
    try {
      const { XMLParser } = await import('fast-xml-parser');
      const parser = new XMLParser({ ignoreAttributes: false });
      const json = parser.parse(xml);
      const body = json?.response?.body;
      const totalCount = parseInt(body?.totalCount || '0', 10);
      const rawItems = body?.items?.item;
      const items: HiraHospitalItem[] = rawItems ? (Array.isArray(rawItems) ? rawItems : [rawItems]) : [];
      return { items, total: totalCount };
    } catch (err) {
      console.error('❌ HIRA 병원 XML 파싱 실패', err);
      return { items: [], total: 0 };
    }
  };

  // 1차: 디코딩된 키 사용
  const decodedKey = HIRA_API_KEY.includes('%') ? decodeURIComponent(HIRA_API_KEY) : HIRA_API_KEY;
  const allItems: HiraHospitalItem[] = [];

  let page = 1;
  let total = 0;
  while (true) {
    const { items, total: t } = await tryFetchPage(decodedKey, page);
    total = t;
    if (items.length === 0) break;
    allItems.push(...items);
    if (allItems.length >= total) break;
    page += 1;
  }

  // 2차: 결과 없을 때 원본 키로 재시도
  if (allItems.length === 0 && decodedKey !== HIRA_API_KEY) {
    page = 1;
    while (true) {
      const { items, total: t } = await tryFetchPage(HIRA_API_KEY, page);
      total = t;
      if (items.length === 0) break;
      allItems.push(...items);
      if (allItems.length >= total) break;
      page += 1;
    }
  }

  console.log('ℹ️ HIRA 병원 원본 건수:', allItems.length);

  // 캐시 저장
  hiraHospitalCache = { items: allItems, timestamp: Date.now() };

  return allItems;
}
// ----------------------------------------------------------------

// HIRA 응답의 시간 필드(0830) → HH:MM 문자열 변환
function formatTime(t?: string | number): string | undefined {
  if (t === undefined || t === null) return undefined;
  let s = typeof t === 'number' ? t.toString() : String(t).trim();
  // pad with leading zeros if needed
  if (s.length === 3) s = '0' + s;
  if (s.length !== 4) return undefined;
  return `${s.slice(0, 2)}:${s.slice(2)}`;
}

// 시작~종료 시간 조합
function makeHourRange(start?: string, end?: string): string | undefined {
  const s = formatTime(start);
  const e = formatTime(end);
  return s && e ? `${s}~${e}` : undefined;
}

// 1) Kakao 주소 지오코딩 유틸 추가 -------------------------------
async function geocodeAddress(address: string) {
  if (!KAKAO_API_KEY) return null;
  try {
    const res = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
      { headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.documents?.length) return null;
    const { x, y } = data.documents[0];
    const lat = parseFloat(y);
    const lon = parseFloat(x);
    return isNaN(lat) || isNaN(lon) ? null : { lat, lon };
  } catch {
    return null;
  }
}
// ----------------------------------------------------------------

export async function GET(request: NextRequest) {
  // 환경변수 검증
  const KAKAO_API_KEY = hasEnvVar('KAKAO_API_KEY') ? getEnvVar('KAKAO_API_KEY') : undefined;
  const HIRA_API_KEY = hasEnvVar('HIRA_SERVICE_KEY') ? getEnvVar('HIRA_SERVICE_KEY') : undefined;
  
  console.log('🏥 의료기관 API 키 검증:', {
    kakao: KAKAO_API_KEY ? '✅ 설정됨' : '⚠️ 없음',
    hira: HIRA_API_KEY ? '✅ 설정됨' : '⚠️ 없음'
  });

  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'all'; // hospital, pharmacy, all
    const categoryParam = searchParams.get('category'); // 내과, 외과 등
    const emergency = searchParams.get('emergency') === 'true';
    const night = searchParams.get('night') === 'true';
    const radius = parseInt(searchParams.get('radius') || '2000'); // 기본 2km
    // 내 위치(위도, 경도) 파라미터
    const userLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : NONHYEON_LAT;
    const userLon = searchParams.get('lon') ? parseFloat(searchParams.get('lon')!) : NONHYEON_LON;

    console.log('🏥 의료기관 정보 요청:', {
      type,
      category: categoryParam,
      emergency,
      night,
      radius,
      userLat,
      userLon
    });

    if (!KAKAO_API_KEY) {
      // API 키 없이도 작동하도록 더미 데이터 제공
      console.log('⚠️ 카카오 API 키 없음, 더미 데이터 제공');
      return NextResponse.json({
        success: true,
        data: getDummyMedicalData(type),
        timestamp: new Date().toISOString(),
        note: '테스트 데이터 - 실제 서비스를 위해서는 카카오 API 키가 필요합니다'
      });
    }

    const results: MedicalInfo[] = [];

    // 카카오맵 API 카테고리 코드 매핑 (병원은 HIRA를 우선 사용)
    const categoryQueries: { code: string; name: string }[] = [];
    const useKakaoHospital = !HIRA_API_KEY; // 서비스키가 없을 때만 Kakao 병원 데이터 사용
    if (useKakaoHospital && (type === 'all' || type === 'hospital')) {
      categoryQueries.push({ code: 'HP8', name: '병원' });
    }

    // 소아과 → 소아청소년과로 정규화 (카카오 표기와 맞추기)
    let category: string | null = categoryParam;
    if (categoryParam === '소아과') {
      category = '소아청소년과';
    }

    // 카테고리별로 카카오맵 API 호출 (페이징 포함)
    for (const categoryQuery of categoryQueries) {
      console.log(`🔍 ${categoryQuery.name} 검색 중... (${categoryQuery.code})`);
      
      // Kakao API: 최대 45페이지(15*45=675개) 지원 → is_end=true 시 조기 종료
      for (let page = 1; page <= 45; page++) {
        try {
          const apiUrl = `https://dapi.kakao.com/v2/local/search/category.json`;
          const params = new URLSearchParams({
            category_group_code: categoryQuery.code,
            x: userLon.toString(),
            y: userLat.toString(),
            radius: radius.toString(),
            sort: 'distance',
            size: '15',
            page: page.toString()
          });

          const response = await fetch(`${apiUrl}?${params}`, {
            headers: {
              'Authorization': `KakaoAK ${KAKAO_API_KEY}`
            }
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ ${categoryQuery.name} ${page}페이지 API 호출 실패 (${response.status}): ${errorText}`);
            break; // 이 카테고리는 중단하고 다음 카테고리로
          }

          const data: KakaoSearchResult = await response.json();
          console.log(`✅ ${categoryQuery.name} ${page}페이지: ${data.documents.length}개 발견`);
          
          // 마지막 페이지(is_end) 이거나 결과가 없으면 루프 종료
          if (data.documents.length === 0 || data.meta.is_end) {
            console.log(`📄 ${categoryQuery.name} 검색 완료 (${page}페이지에서 종료)`);
            break;
          }
          
          data.documents.forEach(place => {
            const medicalType: 'hospital' | 'pharmacy' = 
              place.category_name.includes('약국') ? 'pharmacy' : 'hospital';
            
            // 타입 필터링
            if (type !== 'all' && type !== medicalType) return;
            
            // 진료과목 추출(다중 사용)
            const specialties = extractSpecialties(place.category_name);

            // 카테고리 필터링 (명칭 + 추출된 진료과목 모두 고려)
            if (category) {
              // 기타 카테고리는 지정된 특수 과목 집합과 매칭
              if (category === '기타') {
                const etcSet = ['정신건강의학과', '성형외과', '통증의학과', '가정의학과', '한방'];
                const hasEtc = specialties.some(sp => etcSet.includes(sp));
                if (!hasEtc) return;
              } else {
                const inName = place.category_name.includes(category);
                const inSpecialties = specialties.includes(category);
                if (!inName && !inSpecialties) {
                  return;
                }
              }
            }
            
            const isEmergency = hasEmergency(place.category_name, place.place_name);
            const isNightCare = hasNightCare(place.place_name, place.category_name);
            
            // 응급실 필터링
            if (emergency && !isEmergency) return;
            
            // 야간진료 필터링
            if (night && !isNightCare) return;

            // 중복 제거 (같은 장소명과 주소)
            const isDuplicate = results.some(existing => 
              existing.name === place.place_name && 
              existing.address === place.address_name
            );
            
            if (!isDuplicate) {
              results.push({
                id: place.id,
                name: place.place_name,
                category: place.category_name,
                address: place.address_name,
                roadAddress: place.road_address_name,
                phone: place.phone || undefined,
                distance: parseInt(place.distance),
                x: place.x,
                y: place.y,
                url: place.place_url,
                type: medicalType,
                specialties: specialties.length > 0 ? specialties : undefined,
                hasEmergency: isEmergency,
                hasNightCare: isNightCare
                // 주말/공휴일 정보는 나중에 HIRA 데이터를 합쳐서 채움
              });
            }
          });

        } catch (error) {
          console.error('❌ 카테고리 검색 실패:', categoryQuery.name, `${page}페이지`, error);
          break; // 이 카테고리는 중단
        }
      }
    }

    // 병원·약국 데이터를 병렬로 가져오기 위한 Promise 생성
    const hospitalPromise = (type === 'hospital' || type === 'all') && HIRA_API_KEY
      ? fetchHiraHospitalList(HIRA_API_KEY)
      : Promise.resolve([] as HiraHospitalItem[]);

    const pharmacyPromise = (type === 'pharmacy' || type === 'all') && HIRA_API_KEY
      ? fetchHiraPharmacyList(HIRA_API_KEY)
      : Promise.resolve([]);

    const [hiraHospitals, hiraList] = await Promise.all([hospitalPromise, pharmacyPromise]);

    // --- 병원 데이터: HIRA -------------------------------------------
    if (hiraHospitals.length) {
      console.log('🏥 HIRA 병원 데이터:', hiraHospitals.length, '건 수신');

      // 거리 계산 함수 (Haversine)
      const toRad = (deg: number) => (deg * Math.PI) / 180;
      // 내 위치 기준으로 거리 계산
      const calcDistance = (lat: number, lon: number) => {
        const R = 6371000; // 지구 반경(m)
        const dLat = toRad(lat - userLat);
        const dLon = toRad(lon - userLon);
        const a = Math.sin(dLat / 2) ** 2 +
                  Math.cos(toRad(userLat)) * Math.cos(toRad(lat)) *
                  Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
      };

      for (const item of hiraHospitals) {
        // 논현동/논현지구 필터링 (주소 또는 행정동명)
        const isInNonhyeon = (item.emdongNm && item.emdongNm.includes('논현')) ||
                             item.addr?.includes('논현동') ||
                             item.addr?.includes('논현지구');
        if (!isInNonhyeon) continue;

        let lat = parseFloat(item.YPos ?? '');
        let lon = parseFloat(item.XPos ?? '');

        // 좌표가 없으면 주소 보정
        if (isNaN(lat) || isNaN(lon)) {
          const fixed = await geocodeAddress(item.addr);
          if (!fixed) continue;
          lat = fixed.lat;
          lon = fixed.lon;
        }

        // 거리 계산 및 반경 필터
        const distance = calcDistance(lat, lon);
        if (distance > radius) continue;

        const combinedCategory = `${item.clCdNm}`;

        // 진료과목 추출 (병원명 + 분류명으로 추정)
        const specialties = extractSpecialties(`${item.yadmNm} ${item.clCdNm}`);

        // 카테고리 필터링 (사용자가 지정한 경우)
        if (category) {
          if (category === '기타') {
            const etcSet = ['정신건강의학과', '성형외과', '통증의학과', '가정의학과', '한방'];
            const hasEtc = specialties.some(sp => etcSet.includes(sp));
            if (!hasEtc) continue;
          } else {
            const inName = combinedCategory.includes(category) || item.yadmNm.includes(category);
            const inSpecialties = specialties.includes(category);
            if (!inName && !inSpecialties) continue;
          }
        }

        const isEmergency = hasEmergency(combinedCategory, item.yadmNm);
        const isNightCare = hasNightCare(item.yadmNm, combinedCategory);

        // 응급실/야간진료 필터
        if (emergency && !isEmergency) continue;
        if (night && !isNightCare) continue;

        // 중복 체크 (이름 + 주소)
        const isDuplicate = results.some(existing =>
          existing.name === item.yadmNm && existing.address === item.addr
        );
        if (isDuplicate) continue;

        results.push({
          id: item.ykiho,
          name: item.yadmNm,
          category: combinedCategory,
          address: item.addr,
          roadAddress: item.addr,
          phone: item.telno,
          distance,
          x: lon.toString(),
          y: lat.toString(),
          type: 'hospital',
          url: item.hospUrl || undefined,
          specialties: specialties.length ? specialties : undefined,
          hasEmergency: isEmergency,
          hasNightCare: isNightCare
        });
      }
    }
    // ----------------------------------------------------------------

    // --- 약국 데이터: HIRA -------------------------------------------------
    if (hiraList.length) {
      console.log('💊 HIRA 약국 데이터:', hiraList.length, '건 수신');

      // 거리 계산 함수 (Haversine)
      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const calcDistance = (lat: number, lon: number) => {
        const R = 6371000; // 지구 반경(m)
        const dLat = toRad(lat - userLat);
        const dLon = toRad(lon - userLon);
        const a = Math.sin(dLat / 2) ** 2 +
                  Math.cos(toRad(userLat)) * Math.cos(toRad(lat)) *
                  Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
      };

      for (const item of hiraList) {
        let lat = parseFloat(item.wgs84Lat);
        let lon = parseFloat(item.wgs84Lon);

        // 좌표가 없으면 주소로 보정
        if (isNaN(lat) || isNaN(lon)) {
          const fixed = await geocodeAddress(item.dutyAddr);
          if (!fixed) continue;
          lat = fixed.lat;
          lon = fixed.lon;
        }

        // 논현동/논현지구 여부
        const isInNonhyeon = item.dutyAddr?.includes('논현동') || item.dutyAddr?.includes('논현지구');
        if (!isInNonhyeon) continue;

        // 좌표가 없거나 반경 밖이면 Kakao 지오코딩으로 보정
        if (isNaN(lat) || isNaN(lon)) {
          const fixed = await geocodeAddress(item.dutyAddr);
          if (!fixed) continue;   // 보정 실패 → 제외
          ({ lat, lon } = fixed);
        }

        // 거리 계산
        let distance = calcDistance(lat, lon);
        if (distance > radius) {
          const fixed = await geocodeAddress(item.dutyAddr); // 좌표 오등록 의심 → 재보정
          if (fixed) {
            ({ lat, lon } = fixed);
            distance = calcDistance(lat, lon);
          }
        }
        if (distance > radius) continue; // 최종 반경 초과 시 제외

        const sat = makeHourRange(item.dutyTime6s, item.dutyTime6c);
        const sun = makeHourRange(item.dutyTime7s, item.dutyTime7c);
        const hol = makeHourRange(item.dutyTime8s, item.dutyTime8c);

        // 평일(월) 진료시간을 대표값으로 사용 (대부분 동일하게 운영)
        const weekday = makeHourRange(item.dutyTime1s, item.dutyTime1c);
 
        results.push({
          id: item.hpid,
          name: item.dutyName,
          category: '약국',
          address: item.dutyAddr,
          roadAddress: item.dutyAddr,
          phone: item.dutyTel1,
          distance,
          x: lon.toString(),
          y: lat.toString(),
          type: 'pharmacy',
          hasNightCare: false,
          hasEmergency: false,
          weekdayHours: weekday,
          ...(sat || sun ? { weekendHours: { sat, sun } } : {}),
          holidayHours: hol,
          is24Hours: sat === '00:00~24:00' && sun === '00:00~24:00'
        });
      }
    }
    // ----------------------------------------------------------------

    // 거리순 정렬
    results.sort((a, b) => a.distance - b.distance);

    console.log(`✅ 의료기관 검색 완료: ${results.length}개 발견`);

    return NextResponse.json({
      success: true,
      data: results, // 모든 결과 반환
      total: results.length,
      timestamp: new Date().toISOString(),
      params: {
        type,
        category: categoryParam,
        emergency,
        night,
        radius
      }
    });

  } catch (error) {
    console.error('🏥 의료기관 API 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: '의료기관 정보를 가져오는데 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}

// 더미 데이터 생성 함수
function getDummyMedicalData(type: string): MedicalInfo[] {
  const hospitals: MedicalInfo[] = [
    {
      id: 'dummy_1',
      name: '논현종합병원',
      category: '의료,건강 > 병원 > 종합병원',
      address: '인천 남동구 논현동 680-1',
      roadAddress: '인천 남동구 논현로 123',
      phone: '032-123-4567',
      distance: 500,
      x: '126.7327',
      y: '37.3904',
      type: 'hospital',
      specialties: ['종합진료', '내과', '외과'],
      hasEmergency: true,
      hasNightCare: true
    },
    {
      id: 'dummy_2',
      name: '미래내과의원',
      category: '의료,건강 > 병원 > 내과',
      address: '인천 남동구 논현동 834-5',
      roadAddress: '인천 남동구 논현로 89',
      phone: '032-234-5678',
      distance: 800,
      x: '126.7337',
      y: '37.3884',
      type: 'hospital',
      specialties: ['내과'],
      hasEmergency: false,
      hasNightCare: false
    },
    {
      id: 'dummy_3',
      name: '논현정형외과',
      category: '의료,건강 > 병원 > 정형외과',
      address: '인천 남동구 논현동 512-3',
      roadAddress: '인천 남동구 논현로 156',
      phone: '032-345-6789',
      distance: 1200,
      x: '126.7347',
      y: '37.3874',
      type: 'hospital',
      specialties: ['정형외과'],
      hasEmergency: false,
      hasNightCare: false
    }
  ];

  const pharmacies: MedicalInfo[] = [
    {
      id: 'dummy_4',
      name: '논현온누리약국',
      category: '의료,건강 > 약국',
      address: '인천 남동구 논현동 791-2',
      roadAddress: '인천 남동구 논현로 67',
      phone: '032-456-7890',
      distance: 300,
      x: '126.7317',
      y: '37.3894',
      type: 'pharmacy',
      hasEmergency: false,
      hasNightCare: false
    },
    {
      id: 'dummy_5',
      name: '24시간 미래약국',
      category: '의료,건강 > 약국',
      address: '인천 남동구 논현동 623-1',
      roadAddress: '인천 남동구 논현로 234',
      phone: '032-567-8901',
      distance: 900,
      x: '126.7357',
      y: '37.3864',
      type: 'pharmacy',
      hasEmergency: false,
      hasNightCare: true
    }
  ];

  if (type === 'hospital') return hospitals;
  if (type === 'pharmacy') return pharmacies;
  return [...hospitals, ...pharmacies];
} 