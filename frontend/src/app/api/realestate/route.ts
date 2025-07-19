import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';
import { NextRequest } from 'next/server';
import { createRealEstateLogger } from '@/lib/logger';
import { getEnvVar } from '@/lib/env';

const logger = createRealEstateLogger();

// API 기반 실시간 비교 (Vercel KV 없이 해결)

// 국토교통부 실거래가 API 설정
const MOLIT_BASE_URL = 'https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade';

const AREA_CODE = '28200'; // 인천 남동구

interface ProcessedDeal {
  apartment_name: string;
  area: string;
  floor: string;
  price: string;
  price_numeric: number;
  deal_date: string;
  build_year: string;
  location: string;
  price_per_pyeong: string;
  unique_id?: string; // 거래 고유 식별자 추가
}

// 거래 고유 식별자 생성 함수
function generateDealId(deal: Omit<ProcessedDeal, 'unique_id'>): string {
  return `${deal.apartment_name}_${deal.area}_${deal.floor}_${deal.deal_date}_${deal.price_numeric}`;
}

// 가격 문자열을 숫자로 변환 (쉼표 제거)
function parsePrice(priceStr: string): number {
  return parseInt(priceStr.replace(/,/g, '').trim());
}

// 평당 가격 계산 (㎡를 평으로 변환: 1평 = 3.3㎡)
function calculatePricePerPyeong(price: number, area: string): string {
  const areaNum = parseFloat(area);
  const pyeong = areaNum / 3.3;
  const pricePerPyeong = Math.round(price / pyeong);
  return `${pricePerPyeong.toLocaleString()}만원`;
}

// 특정 날짜의 부동산 데이터를 국토교통부 API에서 직접 가져오기
async function fetchRealEstateDataByDate(targetDate: string, MOLIT_API_KEY: string): Promise<ProcessedDeal[]> {
  const deals: ProcessedDeal[] = [];
  const parser = new XMLParser({ ignoreAttributes: false, trimValues: true });
  
  // 타겟 날짜의 연월 추출 (YYYY-MM-DD -> YYYYMM)
  const yearMonth = targetDate.substring(0, 7).replace('-', '');
  
  logger.debug(`${targetDate} (${yearMonth}) 데이터 API 호출 시작`);
  
  let pageNo = 1;
  const numOfRows = 100;
  
  while (true) {
    const apiUrl = new URL(MOLIT_BASE_URL);
    apiUrl.searchParams.append('serviceKey', MOLIT_API_KEY);
    apiUrl.searchParams.append('LAWD_CD', AREA_CODE);
    apiUrl.searchParams.append('DEAL_YMD', yearMonth);
    apiUrl.searchParams.append('numOfRows', numOfRows.toString());
    apiUrl.searchParams.append('pageNo', pageNo.toString());

    try {
      const response = await fetch(apiUrl.toString());
      const xmlText = await response.text();
      const parsed = parser.parse(xmlText);
      const items = parsed?.response?.body?.items?.item;

      if (!items) break;

      const itemArray = Array.isArray(items) ? items : [items];

      for (const item of itemArray) {
        try {
          const apartment = item.aptNm || '';
          const area = item.excluUseAr || '';
          const floor = item.floor || '';
          const priceStr = item.dealAmount || '';
          const year = item.dealYear || '';
          const month = item.dealMonth || '';
          const day = item.dealDay || '';
          const buildYear = item.buildYear || '';
          const dong = item.umdNm || '';

          if (apartment && priceStr && dong === '논현동') {
            const dealDate = formatDealDate(year, month, day);
            
            // 특정 날짜의 거래만 필터링
            if (dealDate === targetDate) {
              const price = parsePrice(priceStr);
              const pricePerPyeong = calculatePricePerPyeong(price, area);

              const uniqueId = generateDealId({
                apartment_name: apartment,
                area: `${area}㎡`,
                floor: `${floor}층`,
                price: formatPrice(price),
                price_numeric: price,
                deal_date: dealDate,
                build_year: buildYear,
                location: dong,
                price_per_pyeong: pricePerPyeong,
              });

              deals.push({
                apartment_name: apartment,
                area: `${area}㎡`,
                floor: `${floor}층`,
                price: formatPrice(price),
                price_numeric: price,
                deal_date: dealDate,
                build_year: buildYear,
                location: dong,
                price_per_pyeong: pricePerPyeong,
                unique_id: uniqueId,
              });
            }
          }
        } catch (parseError) {
          logger.error('개별 데이터 파싱 오류', parseError);
        }
      }

      if (itemArray.length < numOfRows) break;
      pageNo += 1;
    } catch (pageError) {
      logger.error(`${yearMonth} ${pageNo}페이지 데이터 수집 실패`, pageError);
      break;
    }
  }
  
  logger.debug(`${targetDate} 데이터 수집 완료: ${deals.length}건`);
  return deals;
}

// 거래일 포맷팅
function formatDealDate(year: string | number, month: string | number, day: string | number): string {
  const formattedMonth = String(month).padStart(2, '0');
  const formattedDay = String(day).padStart(2, '0');
  return `${year}-${formattedMonth}-${formattedDay}`;
}

// 가격 포맷팅 (만원 단위)
function formatPrice(price: number): string {
  if (price >= 10000) {
    const eok = Math.floor(price / 10000);
    const man = price % 10000;
    if (man === 0) {
      return `${eok}억원`;
    } else {
      return `${eok}억 ${man.toLocaleString()}만원`;
    }
  } else {
    return `${price.toLocaleString()}만원`;
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  // 환경변수 검증
  let MOLIT_API_KEY: string;
  try {
    MOLIT_API_KEY = getEnvVar('MOLIT_API_KEY');
    logger.info('MOLIT API 키 검증 완료');
  } catch (error) {
    logger.error('MOLIT_API_KEY 환경변수가 설정되지 않았습니다:', error);
    return NextResponse.json({ 
      success: false,
      error: 'API 설정 오류가 발생했습니다.',
      data: [],
      total_count: 0,
      is_new_deals: false
    }, { status: 500 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const checkNew = searchParams.get('checkNew') === 'true';
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : null; // limit 파라미터 추가
    
    logger.info(`부동산 API 호출 시작 (신규체크: ${checkNew}, 제한: ${limit || '없음'})`);
    
    if (checkNew) {
      logger.info('신규 거래 확인 모드 (파일 기반 비교)');
      const todayDate = getTodayDateString();
      const yesterdayDate = getYesterdayDateString();
      
      logger.info(`어제(${yesterdayDate}) vs 오늘(${todayDate}) 파일 기반 비교 시작`);
      
      // 어제와 오늘 데이터 파일 로드
      const [yesterdayDeals, todayDeals] = await Promise.all([
        loadDailyDataFromFile(yesterdayDate),
        loadDailyDataFromFile(todayDate)
      ]);
      
      logger.info(`어제 거래: ${yesterdayDeals.length}건, 오늘 거래: ${todayDeals.length}건`);
      
      // 파일 로드 결과에 따른 처리 로직
      logger.info(`파일 로드 결과 - 어제: ${yesterdayDeals.length}건, 오늘: ${todayDeals.length}건`);
      
      // 두 파일 모두 없는 경우에만 API 대체 로직 사용
      if (yesterdayDeals.length === 0 && todayDeals.length === 0) {
        logger.warn('어제와 오늘 데이터 파일이 모두 없습니다. API 실시간 수집으로 대체합니다.');
        return await handleFallbackApiComparison(yesterdayDate, todayDate, MOLIT_API_KEY);
      }
      
      // 어제 파일만 없는 경우: 오늘 모든 거래를 신규로 처리
      if (yesterdayDeals.length === 0 && todayDeals.length > 0) {
        logger.info('어제 파일 없음. 오늘 모든 거래를 신규로 처리합니다.');
      }
      
      // 오늘 파일만 없는 경우: 신규 거래 0건
      if (yesterdayDeals.length > 0 && todayDeals.length === 0) {
        logger.info('오늘 파일 없음. 신규 거래 0건으로 처리합니다.');
      }
      
      // 어제 거래의 고유 ID 세트 생성
      const yesterdayUniqueIds = new Set(
        yesterdayDeals.map(deal => deal.unique_id).filter(id => id !== undefined) as string[]
      );
      
      // 오늘 거래 중 어제에 없던 신규 거래 찾기
      const newDeals = todayDeals.filter(deal => 
        deal.unique_id && !yesterdayUniqueIds.has(deal.unique_id)
      );
      
      logger.info(`🆕 신규 거래 발견: ${newDeals.length}건`);
      
      // 신규 거래를 API 응답 형식으로 변환
      const transformedNewDeals = newDeals.map(deal => ({
        unique_id: deal.unique_id || '',
        법정동: deal.location,
        아파트: deal.apartment_name,
        전용면적: deal.area.replace('㎡', ''),
        거래금액: deal.price_numeric.toString(),
        거래년월: deal.deal_date.substring(0, 7).replace('-', ''),
        거래일: deal.deal_date.substring(8, 10),
        층: deal.floor.replace('층', ''),
        deal_date: deal.deal_date
      }));
      
      // 신규 거래에 대한 통계 계산
      const newAvgPrice = newDeals.length > 0 ? Math.round(newDeals.reduce((sum, deal) => sum + deal.price_numeric, 0) / newDeals.length) : 0;
      const newMaxPrice = newDeals.length > 0 ? Math.max(...newDeals.map(deal => deal.price_numeric)) : 0;
      const newMinPrice = newDeals.length > 0 ? Math.min(...newDeals.map(deal => deal.price_numeric)) : 0;

      return NextResponse.json({
        success: true,
        data: transformedNewDeals,
        total_count: newDeals.length,
        is_new_deals: true,
        new_deals_count: newDeals.length,
        comparison_info: {
          yesterday_deals: yesterdayDeals.length,
          today_deals: todayDeals.length,
          yesterday_date: yesterdayDate,
          today_date: todayDate,
          data_source: 'file_based'
        },
        stats: {
          avg_price: formatPrice(newAvgPrice),
          max_price: formatPrice(newMaxPrice),
          min_price: formatPrice(newMinPrice),
          avg_price_numeric: newAvgPrice,
          max_price_numeric: newMaxPrice,
          min_price_numeric: newMinPrice,
        },
        timestamp: new Date().toISOString(),
      });
      
    } else {
      logger.info('인천 남동구 논현동 아파트 실거래가 최근 3개월 조회 시작');
    }
    
    const deals: ProcessedDeal[] = [];
    const parser = new XMLParser({ ignoreAttributes: false, trimValues: true });
    const now = new Date();
    // 최근 3개월 yearMonth 리스트 생성
    const yearMonths: string[] = [];
    for (let i = 0; i < 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      yearMonths.push(`${y}${m}`);
    }
    for (const yearMonth of yearMonths) {
      logger.debug(`${yearMonth} 데이터 수집 중`);
      // 페이지네이션 처리: 100건(1페이지) 초과 시 다음 페이지 반복 호출
      let pageNo = 1;
      const numOfRows = 100;

      while (true) {
        const apiUrl = new URL(MOLIT_BASE_URL);
        apiUrl.searchParams.append('serviceKey', MOLIT_API_KEY);
        apiUrl.searchParams.append('LAWD_CD', AREA_CODE);
        apiUrl.searchParams.append('DEAL_YMD', yearMonth);
        apiUrl.searchParams.append('numOfRows', numOfRows.toString());
        apiUrl.searchParams.append('pageNo', pageNo.toString());

        try {
          const response = await fetch(apiUrl.toString());
          const xmlText = await response.text();
          const parsed = parser.parse(xmlText);
          const items = parsed?.response?.body?.items?.item;

          // items가 없으면 해당 월의 페이지 루프 종료
          if (!items) {
            break;
          }

          const itemArray = Array.isArray(items) ? items : [items];

          for (const item of itemArray) {
            try {
              const apartment = item.aptNm || '';
              const area = item.excluUseAr || '';
              const floor = item.floor || '';
              const priceStr = item.dealAmount || '';
              const year = item.dealYear || '';
              const month = item.dealMonth || '';
              const day = item.dealDay || '';
              const buildYear = item.buildYear || '';
              const dong = item.umdNm || '';

              if (apartment && priceStr) {
                const price = parsePrice(priceStr);
                const dealDate = formatDealDate(year, month, day);
                const pricePerPyeong = calculatePricePerPyeong(price, area);

                // 논현동 필터 적용
                if (dong === '논현동') {
                  const uniqueId = generateDealId({
                    apartment_name: apartment,
                    area: `${area}㎡`,
                    floor: `${floor}층`,
                    price: formatPrice(price),
                    price_numeric: price,
                    deal_date: dealDate,
                    build_year: buildYear,
                    location: dong,
                    price_per_pyeong: pricePerPyeong,
                  });

                  deals.push({
                    apartment_name: apartment,
                    area: `${area}㎡`,
                    floor: `${floor}층`,
                    price: formatPrice(price),
                    price_numeric: price,
                    deal_date: dealDate,
                    build_year: buildYear,
                    location: dong,
                    price_per_pyeong: pricePerPyeong,
                    unique_id: uniqueId,
                  });
                }
              }
            } catch (parseError) {
              logger.error('개별 데이터 파싱 오류', parseError);
            }
          }

          // 마지막 페이지 체크: 가져온 레코드 수가 페이지당 요청 수보다 적으면 종료
          if (itemArray.length < numOfRows) {
            break;
          }

          pageNo += 1;
        } catch (pageError) {
          logger.error(`${yearMonth} ${pageNo}페이지 데이터 수집 실패`, pageError);
          break; // 에러 발생 시 루프 탈출
        }
      }
    }
    // 최신 거래일 순으로 정렬
    deals.sort((a, b) => new Date(b.deal_date).getTime() - new Date(a.deal_date).getTime());
    // 중복 제거 (아파트명+면적+층+거래일 기준)
    const uniqueDeals = deals.filter((deal, idx, arr) =>
      arr.findIndex(d => d.apartment_name === deal.apartment_name && d.area === deal.area && d.floor === deal.floor && d.deal_date === deal.deal_date) === idx
    );
    // 통계 계산
    const totalDeals = uniqueDeals.length;
    const avgPrice = totalDeals > 0 ? Math.round(uniqueDeals.reduce((sum, deal) => sum + deal.price_numeric, 0) / totalDeals) : 0;
    const maxPrice = totalDeals > 0 ? Math.max(...uniqueDeals.map(deal => deal.price_numeric)) : 0;
    const minPrice = totalDeals > 0 ? Math.min(...uniqueDeals.map(deal => deal.price_numeric)) : 0;

    // 아파트별 통계 계산
    interface ApartmentStatMapEntry {
      name: string;
      count: number;
      totalPrice: number;
      deals: ProcessedDeal[];
    }

    const apartmentStatsMap: Record<string, ApartmentStatMapEntry> = {};

    for (const deal of uniqueDeals) {
      const key = deal.apartment_name;
      if (!apartmentStatsMap[key]) {
        apartmentStatsMap[key] = {
          name: key,
          count: 0,
          totalPrice: 0,
          deals: []
        };
      }
      apartmentStatsMap[key].count += 1;
      apartmentStatsMap[key].totalPrice += deal.price_numeric;
      apartmentStatsMap[key].deals.push(deal);
    }

    const apartmentStatsArray = Object.values(apartmentStatsMap).map((entry) => {
      const avgNumeric = Math.round(entry.totalPrice / entry.count);
      return {
        name: entry.name,
        count: entry.count,
        avg_price: formatPrice(avgNumeric),
        avg_price_numeric: avgNumeric,
      };
    }).sort((a, b) => b.avg_price_numeric - a.avg_price_numeric);
    console.log(`✅ 논현동 실거래가 최근 3개월 수집 완료: ${totalDeals}건`);
    
    // 전체 거래 조회 모드 - limit 파라미터 적용
    const dealsToTransform = limit ? uniqueDeals.slice(0, limit) : uniqueDeals;
    
    const transformedDeals = dealsToTransform.map(deal => ({
        unique_id: deal.unique_id || '',
        법정동: deal.location,
        아파트: deal.apartment_name,
        전용면적: deal.area.replace('㎡', ''),
        거래금액: deal.price_numeric.toString(),
        거래년월: deal.deal_date.substring(0, 7).replace('-', ''),
        거래일: deal.deal_date.substring(8, 10),
        층: deal.floor.replace('층', ''),
        deal_date: deal.deal_date
    }));
    
    logger.info(`전체 거래 조회 완료: ${transformedDeals.length}건 반환 (전체 ${uniqueDeals.length}건 중)`);
    
    return NextResponse.json({
        success: true,
        data: {
          deals: uniqueDeals, // 영문 필드명 그대로 반환
          statistics: {
            avg_price: formatPrice(avgPrice),
            max_price: formatPrice(maxPrice),
            min_price: formatPrice(minPrice),
            avg_price_numeric: avgPrice,
            max_price_numeric: maxPrice,
            min_price_numeric: minPrice,
            total_deals: uniqueDeals.length,
            period: '최근 3개월'
          },
          apartment_stats: apartmentStatsArray
        },
        timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('부동산 API 오류:', error);
    return NextResponse.json({ 
      success: false,
      error: '부동산 데이터를 가져오는 중 오류가 발생했습니다.',
      data: [],
      total_count: 0,
      is_new_deals: false
    }, { status: 500 });
  }
}

// 사용하지 않는 함수 제거

// 파일 기반 데이터 로드 함수
async function loadDailyDataFromFile(date: string): Promise<ProcessedDeal[]> {
  try {
    if (typeof window !== 'undefined') {
      return [];
    }
    
    // 개발 환경: 로컬 파일 시스템에서 읽기
    if (process.env.NODE_ENV === 'development') {
      try {
        const fs = await import('fs/promises');
        const path = await import('path');
        const filePath = path.join(process.cwd(), 'public', 'data', `realestate_${date}.json`);
        const data = await fs.readFile(filePath, 'utf-8');
        const parsed = JSON.parse(data);
        const deals = parsed.deals || [];
        
        // 중복 제거 (unique_id 기준)
        const uniqueDeals = deals.filter((deal: ProcessedDeal, index: number, arr: ProcessedDeal[]) => 
          arr.findIndex(d => d.unique_id === deal.unique_id) === index
        );
        
        logger.debug(`${date} 로컬 파일에서 데이터 로드: 총 ${deals.length}건 → 중복 제거 후 ${uniqueDeals.length}건`);
        if (deals.length !== uniqueDeals.length) {
          logger.debug(`${date} 파일에서 중복 제거됨: ${deals.length - uniqueDeals.length}건`);
        }
        
        return uniqueDeals;
      } catch {
        logger.debug(`${date} 로컬 파일 없음`);
        return [];
      }
    } else {
      // 프로덕션 환경: public 디렉토리에서 fetch로 읽기
      try {
        // 프로덕션에서는 실제 도메인 사용
        const baseUrl = (process.env.NODE_ENV as string) === 'development' 
          ? 'http://localhost:3001' 
          : 'https://nonhyeon.life';
        const fileUrl = `${baseUrl}/data/realestate_${date}.json`;
        logger.debug(`${date} 파일 접근 시도: ${fileUrl}`);
        const response = await fetch(fileUrl);
        if (response.ok) {
          const parsed = await response.json();
          const deals = parsed.deals || [];
          
          // 중복 제거 (unique_id 기준)
          const uniqueDeals = deals.filter((deal: ProcessedDeal, index: number, arr: ProcessedDeal[]) => 
            arr.findIndex(d => d.unique_id === deal.unique_id) === index
          );
          
          logger.info(`${date} 프로덕션에서 데이터 로드 성공: 총 ${deals.length}건 → 중복 제거 후 ${uniqueDeals.length}건`);
          if (deals.length !== uniqueDeals.length) {
            logger.info(`${date} 프로덕션 파일에서 중복 제거됨: ${deals.length - uniqueDeals.length}건`);
          }
          
          return uniqueDeals;
        } else {
          logger.warn(`${date} 파일 응답 실패: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        logger.error(`${date} 프로덕션 파일 fetch 실패:`, error);
      }
      logger.debug(`${date} 데이터 파일을 찾을 수 없음`);
      return [];
    }
    
  } catch (error) {
    logger.error(`${date} 데이터 로드 실패:`, error);
    return [];
  }
}

// 파일이 없는 경우 대체 API 호출 (기존 fetchRealEstateDataByDate 함수 활용)
async function handleFallbackApiComparison(yesterdayDate: string, todayDate: string, MOLIT_API_KEY: string) {
  logger.info('대체 API 비교 모드 시작');
  
  try {
    const [yesterdayDeals, todayDeals] = await Promise.all([
      fetchRealEstateDataByDate(yesterdayDate, MOLIT_API_KEY),
      fetchRealEstateDataByDate(todayDate, MOLIT_API_KEY)
    ]);
    
    const yesterdayUniqueIds = new Set(
      yesterdayDeals.map(deal => deal.unique_id).filter(id => id !== undefined) as string[]
    );
    
    const newDeals = todayDeals.filter(deal => 
      deal.unique_id && !yesterdayUniqueIds.has(deal.unique_id)
    );
    
    const transformedNewDeals = newDeals.map(deal => ({
      unique_id: deal.unique_id || '',
      법정동: deal.location,
      아파트: deal.apartment_name,
      전용면적: deal.area.replace('㎡', ''),
      거래금액: deal.price_numeric.toString(),
      거래년월: deal.deal_date.substring(0, 7).replace('-', ''),
      거래일: deal.deal_date.substring(8, 10),
      층: deal.floor.replace('층', ''),
      deal_date: deal.deal_date
    }));
    
    const newAvgPrice = newDeals.length > 0 ? Math.round(newDeals.reduce((sum, deal) => sum + deal.price_numeric, 0) / newDeals.length) : 0;
    const newMaxPrice = newDeals.length > 0 ? Math.max(...newDeals.map(deal => deal.price_numeric)) : 0;
    const newMinPrice = newDeals.length > 0 ? Math.min(...newDeals.map(deal => deal.price_numeric)) : 0;
    
    return NextResponse.json({
      success: true,
      data: transformedNewDeals,
      total_count: newDeals.length,
      is_new_deals: true,
      new_deals_count: newDeals.length,
      comparison_info: {
        yesterday_deals: yesterdayDeals.length,
        today_deals: todayDeals.length,
        yesterday_date: yesterdayDate,
        today_date: todayDate,
        data_source: 'fallback_api'
      },
      stats: {
        avg_price: formatPrice(newAvgPrice),
        max_price: formatPrice(newMaxPrice),
        min_price: formatPrice(newMinPrice),
        avg_price_numeric: newAvgPrice,
        max_price_numeric: newMaxPrice,
        min_price_numeric: newMinPrice,
      },
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    logger.error('대체 API 비교 실패:', error);
    throw error;
  }
}

// 오늘 날짜 문자열 가져오기 (YYYY-MM-DD) - KST 기준
function getTodayDateString(): string {
  // 한국시간(KST, UTC+9) 기준으로 날짜 계산
  const now = new Date();
  const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC + 9시간
  
  return kstTime.getFullYear() + '-' + 
         String(kstTime.getMonth() + 1).padStart(2, '0') + '-' + 
         String(kstTime.getDate()).padStart(2, '0');
}

// 어제 날짜 문자열 가져오기 (YYYY-MM-DD) - KST 기준
function getYesterdayDateString(): string {
  // 한국시간(KST, UTC+9) 기준으로 어제 날짜 계산
  const now = new Date();
  const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC + 9시간
  kstTime.setDate(kstTime.getDate() - 1); // KST 기준 어제
  
  return kstTime.getFullYear() + '-' + 
         String(kstTime.getMonth() + 1).padStart(2, '0') + '-' + 
         String(kstTime.getDate()).padStart(2, '0');
}

// 서버 이전 데이터 파일 관리
const PREVIOUS_DATA_PATH = './public/data/realestate_previous.json';

interface PreviousDataFile {
  deals: ProcessedDeal[];
  timestamp: string;
  total_count: number;
}

// 이전 데이터 읽기
async function loadPreviousData(): Promise<ProcessedDeal[]> {
  try {
    const fs = await import('fs/promises');
    const data = await fs.readFile(PREVIOUS_DATA_PATH, 'utf-8');
    const parsed: PreviousDataFile = JSON.parse(data);
    logger.debug(`이전 데이터 로드: ${parsed.total_count}건 (${parsed.timestamp})`);
    return parsed.deals || [];
  } catch {
    logger.debug('이전 데이터 파일이 없어서 새로 생성합니다');
    return [];
  }
}

// 현재 데이터 저장
async function savePreviousData(deals: ProcessedDeal[]): Promise<void> {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    // 디렉토리 생성
    const dir = path.dirname(PREVIOUS_DATA_PATH);
    await fs.mkdir(dir, { recursive: true });
    
    const dataToSave: PreviousDataFile = {
      deals,
      timestamp: new Date().toISOString(),
      total_count: deals.length
    };
    
    await fs.writeFile(PREVIOUS_DATA_PATH, JSON.stringify(dataToSave, null, 2));
    logger.debug(`현재 데이터 저장: ${deals.length}건`);
  } catch (error) {
    logger.error('데이터 저장 실패', error);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest): Promise<NextResponse> {
  // 환경변수 검증
  let MOLIT_API_KEY: string;
  try {
    MOLIT_API_KEY = getEnvVar('MOLIT_API_KEY');
    logger.info('MOLIT API 키 검증 완료');
  } catch (error) {
    logger.error('MOLIT_API_KEY 환경변수가 설정되지 않았습니다:', error);
    return NextResponse.json({ 
      success: false,
      error: 'API 설정 오류가 발생했습니다.',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }

  try {
    logger.info('신규 거래 비교 모드 시작 (서버 파일 기준)');
    
    // 1. 이전 데이터 로드
    const previousDeals = await loadPreviousData();
    const previousUniqueIds = new Set(previousDeals.map(deal => deal.unique_id));
    logger.debug(`이전 데이터: ${previousDeals.length}건`);

    // 2. 현재 데이터 수집 (GET과 동일한 로직)
    const deals: ProcessedDeal[] = [];
    const parser = new XMLParser({ ignoreAttributes: false, trimValues: true });
    const now = new Date();
    
    // 최근 3개월 yearMonth 리스트 생성
    const yearMonths: string[] = [];
    for (let i = 0; i < 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      yearMonths.push(`${y}${m}`);
    }

    for (const yearMonth of yearMonths) {
      logger.debug(`${yearMonth} 데이터 수집 중`);
      let pageNo = 1;
      const numOfRows = 100;

      while (true) {
        const apiUrl = new URL(MOLIT_BASE_URL);
        apiUrl.searchParams.append('serviceKey', MOLIT_API_KEY);
        apiUrl.searchParams.append('LAWD_CD', AREA_CODE);
        apiUrl.searchParams.append('DEAL_YMD', yearMonth);
        apiUrl.searchParams.append('numOfRows', numOfRows.toString());
        apiUrl.searchParams.append('pageNo', pageNo.toString());

        try {
          const response = await fetch(apiUrl.toString());
          const xmlText = await response.text();
          const parsed = parser.parse(xmlText);
          const items = parsed?.response?.body?.items?.item;

          if (!items) break;

          const itemArray = Array.isArray(items) ? items : [items];

          for (const item of itemArray) {
            try {
              const apartment = item.aptNm || '';
              const area = item.excluUseAr || '';
              const floor = item.floor || '';
              const priceStr = item.dealAmount || '';
              const year = item.dealYear || '';
              const month = item.dealMonth || '';
              const day = item.dealDay || '';
              const buildYear = item.buildYear || '';
              const dong = item.umdNm || '';

              if (apartment && priceStr && dong === '논현동') {
                const price = parsePrice(priceStr);
                const dealDate = formatDealDate(year, month, day);
                const pricePerPyeong = calculatePricePerPyeong(price, area);

                const uniqueId = generateDealId({
                  apartment_name: apartment,
                  area: `${area}㎡`,
                  floor: `${floor}층`,
                  price: formatPrice(price),
                  price_numeric: price,
                  deal_date: dealDate,
                  build_year: buildYear,
                  location: dong,
                  price_per_pyeong: pricePerPyeong,
                });

                deals.push({
                  apartment_name: apartment,
                  area: `${area}㎡`,
                  floor: `${floor}층`,
                  price: formatPrice(price),
                  price_numeric: price,
                  deal_date: dealDate,
                  build_year: buildYear,
                  location: dong,
                  price_per_pyeong: pricePerPyeong,
                  unique_id: uniqueId,
                });
              }
            } catch (parseError) {
              logger.error('개별 데이터 파싱 오류', parseError);
            }
          }

          if (itemArray.length < numOfRows) break;
          pageNo += 1;
        } catch (pageError) {
          logger.error(`${yearMonth} ${pageNo}페이지 데이터 수집 실패`, pageError);
          break;
        }
      }
    }

    // 최신 거래일 순으로 정렬
    deals.sort((a, b) => new Date(b.deal_date).getTime() - new Date(a.deal_date).getTime());
    
    // 중복 제거
    const uniqueDeals = deals.filter((deal, idx, arr) =>
      arr.findIndex(d => d.apartment_name === deal.apartment_name && d.area === deal.area && d.floor === deal.floor && d.deal_date === deal.deal_date) === idx
    );

    // 3. 신규 거래 찾기 (이전 데이터에 없는 unique_id)
    const newDeals = uniqueDeals.filter(deal => 
      !previousUniqueIds.has(deal.unique_id)
    );

    logger.info(`시스템 신규 추가 거래: ${newDeals.length}건 (전체 ${uniqueDeals.length}건 중)`);
    
    // 4. 현재 데이터를 다음 비교를 위해 저장
    await savePreviousData(uniqueDeals);

    // 통계 계산
    const totalDeals = uniqueDeals.length;
    const avgPrice = totalDeals > 0 ? Math.round(uniqueDeals.reduce((sum, deal) => sum + deal.price_numeric, 0) / totalDeals) : 0;
    const maxPrice = totalDeals > 0 ? Math.max(...uniqueDeals.map(deal => deal.price_numeric)) : 0;
    const minPrice = totalDeals > 0 ? Math.min(...uniqueDeals.map(deal => deal.price_numeric)) : 0;

    // 아파트별 통계 계산
    interface ApartmentStatMapEntry {
      name: string;
      count: number;
      totalPrice: number;
      deals: ProcessedDeal[];
    }

    const apartmentStatsMap: Record<string, ApartmentStatMapEntry> = {};

    for (const deal of uniqueDeals) {
      const key = deal.apartment_name;
      if (!apartmentStatsMap[key]) {
        apartmentStatsMap[key] = {
          name: key,
          count: 0,
          totalPrice: 0,
          deals: []
        };
      }
      apartmentStatsMap[key].count += 1;
      apartmentStatsMap[key].totalPrice += deal.price_numeric;
      apartmentStatsMap[key].deals.push(deal);
    }

    const apartmentStatsArray = Object.values(apartmentStatsMap).map((entry) => {
      const avgNumeric = Math.round(entry.totalPrice / entry.count);
      return {
        name: entry.name,
        count: entry.count,
        avg_price: formatPrice(avgNumeric),
        avg_price_numeric: avgNumeric,
      };
    }).sort((a, b) => b.avg_price_numeric - a.avg_price_numeric);

    return NextResponse.json({
      success: true,
      data: {
        deals: uniqueDeals,
        new_deals: newDeals, // 신규 거래만
        statistics: {
          total_deals: totalDeals,
          new_deals_count: newDeals.length,
          avg_price: formatPrice(avgPrice),
          max_price: formatPrice(maxPrice),
          min_price: formatPrice(minPrice),
          period: `최근 3개월`
        },
        apartment_stats: apartmentStatsArray,
        comparison_mode: true
      },
      location: '인천 남동구 논현동',
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    logger.error('신규 거래 비교 API 오류', err);
    return NextResponse.json({
      success: false,
      error: 'Internal Server Error',
      message: '신규 거래 비교 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
} 