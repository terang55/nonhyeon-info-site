import { NextRequest, NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import path from 'path';

// 국토교통부 실거래가 API 설정
const MOLIT_API_KEY = 'aTgFhrZehAYOxHq4Z3z1iSYeysHfG9Tu43JQhF26U3mdGzr0H8+jR9MzrwPoqr8yOegDO5OO56GmvXzS7rwkdw==';
const MOLIT_BASE_URL = 'https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade'; 

const AREA_CODE = '28200'; // 인천 남동구

// 서버 기반 기준 데이터 파일 경로
const BASELINE_DATA_PATH = path.join(process.cwd(), 'data', 'realestate_baseline.json');

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
  uniqueId?: string;
  isNew?: boolean;
}

interface ApartmentStat {
  name: string;
  count: number;
  avg_price: string;
  avg_price_numeric: number;
  newCount?: number;
}

// 고유 ID 생성 함수
function generateUniqueId(deal: ProcessedDeal): string {
  return `${deal.apartment_name}-${deal.area}-${deal.floor}-${deal.deal_date}-${deal.price_numeric}`;
}

// 서버 기반 기준 데이터 관리 함수들
interface BaselineData {
  deals: ProcessedDeal[];
  timestamp: string;
  lastUpdateDate: string;
}

// 기준 데이터 읽기
function readBaselineData(): BaselineData | null {
  try {
    if (!fs.existsSync(BASELINE_DATA_PATH)) {
      return null;
    }
    const data = fs.readFileSync(BASELINE_DATA_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ 기준 데이터 읽기 오류:', error);
    return null;
  }
}

// 기준 데이터 저장
function saveBaselineData(deals: ProcessedDeal[]): void {
  try {
    // data 디렉토리 생성 (존재하지 않는 경우)
    const dataDir = path.dirname(BASELINE_DATA_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const baselineData: BaselineData = {
      deals,
      timestamp: new Date().toISOString(),
      lastUpdateDate: new Date().toISOString().split('T')[0] // YYYY-MM-DD 형식
    };
    
    fs.writeFileSync(BASELINE_DATA_PATH, JSON.stringify(baselineData, null, 2));
    console.log('✅ 기준 데이터 저장 완료:', deals.length, '건');
  } catch (error) {
    console.error('❌ 기준 데이터 저장 오류:', error);
  }
}

// 기준 데이터 업데이트 필요 여부 확인 (1일 1회)
function shouldUpdateBaseline(): boolean {
  const baseline = readBaselineData();
  if (!baseline) return true;
  
  const today = new Date().toISOString().split('T')[0];
  return baseline.lastUpdateDate !== today;
}

// 신규 거래 비교 함수
function findNewTransactions(currentData: ProcessedDeal[], previousData: ProcessedDeal[]): ProcessedDeal[] {
  // 이전 데이터의 고유 ID Set 생성
  const previousIds = new Set(previousData.map(generateUniqueId));
  
  // 현재 데이터에서 이전에 없던 거래 찾기
  return currentData.filter(deal => {
    const currentId = generateUniqueId(deal);
    return !previousIds.has(currentId);
  }).map(deal => ({
    ...deal,
    uniqueId: generateUniqueId(deal),
    isNew: true
  }));
}

// 가격 파싱 함수
function parsePrice(priceStr: unknown): number {
  return parseInt(String(priceStr || '').replace(/,/g, '').trim()) || 0;
}

// 거래일 포맷팅 함수
function formatDealDate(year: unknown, month: unknown, day: unknown): string {
  const y = String(year || '').padStart(4, '0');
  const m = String(month || '').padStart(2, '0');
  const d = String(day || '').padStart(2, '0');
  return `${y}.${m}.${d}`;
}

// 가격 포맷팅 함수
function formatPrice(price: number): string {
  if (price >= 10000) {
    const eok = Math.floor(price / 10000);
    const man = price % 10000;
    return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
  }
  return `${price.toLocaleString()}만원`;
}

// 평당가 계산 함수 (3.3㎡ 기준)
function calculatePricePerPyeong(price: number, area: unknown): string {
  const areaNum = parseFloat(String(area || ''));
  if (areaNum <= 0 || isNaN(areaNum)) return '계산불가';
  const pyeong = areaNum / 3.3;
  const pricePerPyeong = Math.round(price / pyeong);
  return formatPrice(pricePerPyeong);
}

export async function GET(): Promise<NextResponse> {
  try {
    console.log('🏠 인천 남동구 논현동 아파트 실거래가 최근 3개월 조회 시작');
    
    // 기준 데이터 읽기 (신규 거래 표시용)
    const baselineData = readBaselineData();
    console.log('📊 기준 데이터:', baselineData ? `${baselineData.deals.length}건 (${baselineData.lastUpdateDate})` : '없음');
    
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
      console.log(`📅 ${yearMonth} 데이터 수집 중...`);
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
              const apartment = String(item.aptNm || '');
              const area = String(item.excluUseAr || '');
              const floor = String(item.floor || '');
              const priceStr = String(item.dealAmount || '');
              const year = String(item.dealYear || '');
              const month = String(item.dealMonth || '');
              const day = String(item.dealDay || '');
              const buildYear = String(item.buildYear || '');
              const dong = String(item.umdNm || '');

              if (apartment && priceStr) {
                const price = parsePrice(priceStr);
                const dealDate = formatDealDate(year, month, day);
                const pricePerPyeong = calculatePricePerPyeong(price, area);

                if (dong === '논현동' && price > 0) {
                  const deal: ProcessedDeal = {
                    apartment_name: apartment,
                    area: `${area}㎡`,
                    floor: `${floor}층`,
                    price: formatPrice(price),
                    price_numeric: price,
                    deal_date: dealDate,
                    build_year: buildYear,
                    location: dong,
                    price_per_pyeong: pricePerPyeong,
                    uniqueId: generateUniqueId({
                      apartment_name: apartment,
                      area: `${area}㎡`,
                      floor: `${floor}층`,
                      price: formatPrice(price),
                      price_numeric: price,
                      deal_date: dealDate,
                      build_year: buildYear,
                      location: dong,
                      price_per_pyeong: pricePerPyeong
                    })
                  };
                  deals.push(deal);
                }
              }
            } catch (parseError) {
              console.error('❌ 개별 데이터 파싱 오류:', parseError);
              console.error('❌ 문제 데이터:', {
                aptNm: item.aptNm,
                excluUseAr: item.excluUseAr,
                floor: item.floor,
                dealAmount: item.dealAmount,
                dealYear: item.dealYear,
                dealMonth: item.dealMonth,
                dealDay: item.dealDay,
                buildYear: item.buildYear,
                umdNm: item.umdNm
              });
            }
          }

          // 마지막 페이지 체크: 가져온 레코드 수가 페이지당 요청 수보다 적으면 종료
          if (itemArray.length < numOfRows) {
            break;
          }

          pageNo += 1;
        } catch (pageError) {
          console.error(`❌ ${yearMonth} ${pageNo}페이지 데이터 수집 실패:`, pageError);
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
    
    // 신규 거래 표시 (기준 데이터와 비교)
    let dealsWithNewFlag = uniqueDeals;
    if (baselineData) {
      const newTransactions = findNewTransactions(uniqueDeals, baselineData.deals);
      const newTransactionIds = new Set(newTransactions.map(generateUniqueId));
      
      dealsWithNewFlag = uniqueDeals.map(deal => ({
        ...deal,
        uniqueId: generateUniqueId(deal),
        isNew: newTransactionIds.has(generateUniqueId(deal))
      }));
      
      console.log('🆕 신규 거래:', newTransactions.length, '건 발견');
    } else {
      // 기준 데이터가 없으면 모든 거래에 고유 ID만 추가
      dealsWithNewFlag = uniqueDeals.map(deal => ({
        ...deal,
        uniqueId: generateUniqueId(deal),
        isNew: false
      }));
    }
    
    // 통계 계산 (신규 표시가 포함된 데이터 기준)
    const totalDeals = dealsWithNewFlag.length;
    const avgPrice = totalDeals > 0 ? Math.round(dealsWithNewFlag.reduce((sum, deal) => sum + deal.price_numeric, 0) / totalDeals) : 0;
    const maxPrice = totalDeals > 0 ? Math.max(...dealsWithNewFlag.map(deal => deal.price_numeric)) : 0;
    const minPrice = totalDeals > 0 ? Math.min(...dealsWithNewFlag.map(deal => deal.price_numeric)) : 0;

    // 아파트별 통계 계산 (신규 거래 수 포함)
    interface ApartmentStatMapEntry {
      name: string;
      count: number;
      totalPrice: number;
      deals: ProcessedDeal[];
      newCount: number;
    }

    const apartmentStatsMap: Record<string, ApartmentStatMapEntry> = {};

    for (const deal of dealsWithNewFlag) {
      const key = deal.apartment_name;
      if (!apartmentStatsMap[key]) {
        apartmentStatsMap[key] = {
          name: key,
          count: 0,
          totalPrice: 0,
          deals: [],
          newCount: 0
        };
      }
      apartmentStatsMap[key].count += 1;
      apartmentStatsMap[key].totalPrice += deal.price_numeric;
      apartmentStatsMap[key].deals.push(deal);
      
      // 신규 거래 수 계산
      if (deal.isNew) {
        apartmentStatsMap[key].newCount += 1;
      }
    }

    const apartmentStatsArray: ApartmentStat[] = Object.values(apartmentStatsMap).map((entry) => {
      const avgNumeric = Math.round(entry.totalPrice / entry.count);
      return {
        name: entry.name,
        count: entry.count,
        avg_price: formatPrice(avgNumeric),
        avg_price_numeric: avgNumeric,
        newCount: entry.newCount
      };
    }).sort((a, b) => b.avg_price_numeric - a.avg_price_numeric);
    
    console.log(`✅ 논현동 실거래가 최근 3개월 수집 완료: ${totalDeals}건`);
    
    // 신규 거래 정보 추가
    const newTransactions = dealsWithNewFlag.filter(deal => deal.isNew);
    
    return NextResponse.json({
      success: true,
      data: {
        deals: dealsWithNewFlag, // 신규 표시가 포함된 모든 거래 반환
        statistics: {
          total_deals: totalDeals,
          avg_price: formatPrice(avgPrice),
          max_price: formatPrice(maxPrice),
          min_price: formatPrice(minPrice),
          period: `최근 3개월`
        },
        apartment_stats: apartmentStatsArray
      },
      newTransactions,
      newCount: newTransactions.length,
      baselineDate: baselineData?.lastUpdateDate || null,
      location: '인천 남동구 논현동',
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, max-age=1800, s-maxage=1800', // 30분 캐시
        'CDN-Cache-Control': 'public, max-age=1800',
        'Vercel-CDN-Cache-Control': 'public, max-age=1800'
      }
    });
  } catch (error) {
    console.error('❌ 실거래가 API 오류:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal Server Error',
      message: '실거래가 정보를 가져오는데 실패했습니다.'
    }, { status: 500 });
  }
} 

// 기준 데이터 업데이트를 위한 POST 메서드
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 기준 데이터 업데이트 시작');
    
    const body = await request.json();
    const { action } = body;
    
    if (action === 'update_baseline') {
      // 현재 최신 데이터 가져오기
      const currentResponse = await GET();
      const currentResult = await currentResponse.json();
      
      if (!currentResult.success) {
        throw new Error('현재 데이터를 가져오는데 실패했습니다.');
      }
      
      // 기준 데이터로 저장 (isNew 플래그 제거)
      const cleanDeals = currentResult.data.deals.map((deal: ProcessedDeal) => ({
        apartment_name: deal.apartment_name,
        area: deal.area,
        floor: deal.floor,
        price: deal.price,
        price_numeric: deal.price_numeric,
        deal_date: deal.deal_date,
        build_year: deal.build_year,
        location: deal.location,
        price_per_pyeong: deal.price_per_pyeong
      }));
      
      saveBaselineData(cleanDeals);
      
      return NextResponse.json({
        success: true,
        message: '기준 데이터가 업데이트되었습니다.',
        baselineCount: cleanDeals.length,
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }
    
    // 기본적으로는 현재 데이터 반환 (GET과 동일)
    return await GET();
    
  } catch (error) {
    console.error('❌ POST 요청 처리 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: 'POST 요청 처리에 실패했습니다.',
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
} 