import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

// 국토교통부 실거래가 API 설정
const MOLIT_API_KEY = 'aTgFhrZehAYOxHq4Z3z1iSYeysHfG9Tu43JQhF26U3mdGzr0H8+jR9MzrwPoqr8yOegDO5OO56GmvXzS7rwkdw==';
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

export async function GET(): Promise<NextResponse> {
  try {
    console.log('🏠 인천 남동구 논현동 아파트 실거래가 최근 3개월 조회 시작');
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

                if (dong === '논현동') {
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
                  });
                }
              }
            } catch (parseError) {
              console.error('❌ 개별 데이터 파싱 오류:', parseError);
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
    return NextResponse.json({
      success: true,
      data: {
        deals: uniqueDeals, // 모든 거래 반환 (중복 제거된)
        statistics: {
          total_deals: totalDeals,
          avg_price: formatPrice(avgPrice),
          max_price: formatPrice(maxPrice),
          min_price: formatPrice(minPrice),
          period: `최근 3개월`
        },
        apartment_stats: apartmentStatsArray
      },
      location: '인천 남동구 논현동',
      timestamp: new Date().toISOString()
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