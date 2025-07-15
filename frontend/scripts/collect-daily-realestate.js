#!/usr/bin/env node

/**
 * 매일 부동산 데이터 자동 수집 스크립트
 * GitHub Actions에서 실행되어 당일 부동산 거래 데이터를 수집하고 파일로 저장
 */

const fs = require('fs').promises;
const path = require('path');
const { XMLParser } = require('fast-xml-parser');

// 국토교통부 실거래가 API 설정
const MOLIT_API_KEY = 'aTgFhrZehAYOxHq4Z3z1iSYeysHfG9Tu43JQhF26U3mdGzr0H8+jR9MzrwPoqr8yOegDO5OO56GmvXzS7rwkdw==';
const MOLIT_BASE_URL = 'https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade';
const AREA_CODE = '28200'; // 인천 남동구

// 유틸리티 함수들
function parsePrice(priceStr) {
  return parseInt(priceStr.replace(/,/g, '').trim());
}

function calculatePricePerPyeong(price, area) {
  const areaNum = parseFloat(area);
  const pyeong = areaNum / 3.3;
  const pricePerPyeong = Math.round(price / pyeong);
  return `${pricePerPyeong.toLocaleString()}만원`;
}

function formatDealDate(year, month, day) {
  const formattedMonth = String(month).padStart(2, '0');
  const formattedDay = String(day).padStart(2, '0');
  return `${year}-${formattedMonth}-${formattedDay}`;
}

function formatPrice(price) {
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

function generateDealId(deal) {
  return `${deal.apartment_name}_${deal.area}_${deal.floor}_${deal.deal_date}_${deal.price_numeric}`;
}

function getTodayDateString() {
  // 한국시간(KST, UTC+9) 기준으로 날짜 생성
  const now = new Date();
  const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC + 9시간
  
  return kstTime.getFullYear() + '-' + 
         String(kstTime.getMonth() + 1).padStart(2, '0') + '-' + 
         String(kstTime.getDate()).padStart(2, '0');
}

// 현재 시점에서 이용 가능한 모든 부동산 데이터 수집 (최근 3개월)
async function collectRealEstateDataForDate(targetDate) {
  console.log('🎯 ===== 부동산 데이터 수집 시작 =====');
  console.log(`📅 수집 대상 날짜: ${targetDate}`);
  console.log(`🏠 수집 범위: 최근 3개월 전체 거래`);
  
  const deals = [];
  const parser = new XMLParser({ ignoreAttributes: false, trimValues: true });
  
  // 현재 날짜 기준으로 최근 3개월 yearMonth 리스트 생성
  const now = new Date(targetDate);
  const yearMonths = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    yearMonths.push(`${y}${m}`);
  }
  
  console.log(`📊 API 호출 대상 연월: ${yearMonths.join(', ')}`);
  console.log('');
  
  const numOfRows = 100;
  
  // 각 월별로 데이터 수집
  let totalApiCalls = 0;
  let totalProcessedItems = 0;
  
  for (const yearMonth of yearMonths) {
    console.log(`📅 === ${yearMonth} 월 데이터 수집 시작 ===`);
    let pageNo = 1;
    let monthlyDeals = 0;
    
    while (true) {
      const apiUrl = new URL(MOLIT_BASE_URL);
      apiUrl.searchParams.append('serviceKey', MOLIT_API_KEY);
      apiUrl.searchParams.append('LAWD_CD', AREA_CODE);
      apiUrl.searchParams.append('DEAL_YMD', yearMonth);
      apiUrl.searchParams.append('numOfRows', numOfRows.toString());
      apiUrl.searchParams.append('pageNo', pageNo.toString());

      try {
        console.log(`📡 ${yearMonth} API 호출 중... (페이지 ${pageNo})`);
        totalApiCalls++;
        
        const response = await fetch(apiUrl.toString());
        const xmlText = await response.text();
        const parsed = parser.parse(xmlText);
        const items = parsed?.response?.body?.items?.item;

        if (!items) {
          console.log(`✅ ${yearMonth} ${pageNo}페이지: 데이터 없음 (수집 완료)`);
          break;
        }

        const itemArray = Array.isArray(items) ? items : [items];
        console.log(`📊 ${yearMonth} ${pageNo}페이지: ${itemArray.length}건 처리 중`);
        totalProcessedItems += itemArray.length;

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
              monthlyDeals++;
            }
          } catch (parseError) {
            console.error('❌ 개별 데이터 파싱 오류:', parseError);
          }
        }

        if (itemArray.length < numOfRows) {
          console.log(`✅ ${yearMonth} ${pageNo}페이지: 마지막 페이지 (수집 완료)`);
          break;
        }
        
        pageNo += 1;
      } catch (pageError) {
        console.error(`❌ ${yearMonth} ${pageNo}페이지 데이터 수집 실패:`, pageError);
        break;
      }
    }
    
    console.log(`📈 ${yearMonth} 월 논현동 거래: ${monthlyDeals}건`);
    console.log('');
  }
  
  console.log('🔄 ===== 데이터 정제 및 중복 제거 =====');
  console.log(`📊 총 API 호출 횟수: ${totalApiCalls}회`);
  console.log(`📊 총 처리된 아이템: ${totalProcessedItems}건`);
  console.log(`📊 송도동 필터링 후: ${deals.length}건`);
  
  // 중복 제거 (unique_id 기준)
  const uniqueDeals = [];
  const seenIds = new Set();
  
  deals.forEach(deal => {
    if (!seenIds.has(deal.unique_id)) {
      seenIds.add(deal.unique_id);
      uniqueDeals.push(deal);
    }
  });
  
  const duplicateCount = deals.length - uniqueDeals.length;
  console.log(`🔍 중복 제거 결과:`);
  console.log(`   - 중복 제거 전: ${deals.length}건`);
  console.log(`   - 중복 제거 후: ${uniqueDeals.length}건`);
  console.log(`   - 중복된 거래: ${duplicateCount}건`);
  
  if (duplicateCount > 0) {
    console.log(`   - 중복 제거율: ${((duplicateCount / deals.length) * 100).toFixed(1)}%`);
  }
  
  // 데이터 품질 검증
  const invalidIds = uniqueDeals.filter(deal => !deal.unique_id || deal.unique_id.trim() === '');
  if (invalidIds.length > 0) {
    console.log(`⚠️  데이터 품질 경고: unique_id가 없는 거래 ${invalidIds.length}건`);
  } else {
    console.log(`✅ 데이터 품질: 모든 거래에 unique_id 생성됨`);
  }
  
  console.log('');
  console.log(`🎯 ${targetDate} 시점 데이터 수집 완료: ${uniqueDeals.length}건 (최근 3개월: ${yearMonths.join(', ')})`);
  
  return uniqueDeals;
}

// 데이터를 파일로 저장
async function saveDataToFile(deals, targetDate) {
  try {
    const dataDir = path.join(__dirname, '..', 'public', 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    const fileName = `realestate_${targetDate}.json`;
    const filePath = path.join(dataDir, fileName);
    
    const dataToSave = {
      deals,
      timestamp: new Date().toISOString(),
      total_count: deals.length,
      date: targetDate,
      collection_method: 'github_actions_auto',
      note: `${targetDate} 시점에서 수집된 최근 3개월 전체 거래 데이터`
    };
    
    await fs.writeFile(filePath, JSON.stringify(dataToSave, null, 2));
    console.log('💾 ===== 데이터 저장 완료 =====');
    console.log(`📁 파일명: ${fileName}`);
    console.log(`📊 저장된 거래: ${deals.length}건`);
    console.log(`📍 저장 경로: ${filePath}`);
    
    return filePath;
  } catch (error) {
    console.error('❌ 파일 저장 실패:', error);
    throw error;
  }
}

// 메인 함수
async function main() {
  try {
    console.log('🚀 ===== 인천논현 부동산 데이터 자동 수집 시작 =====');
    console.log('');
    
    // 한국시간(KST) 표시
    const now = new Date();
    const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    console.log('⏰ === 실행 시간 정보 ===');
    console.log(`   UTC: ${now.toISOString()}`);
    console.log(`   KST: ${kstTime.toISOString().replace('Z', '+09:00')}`);
    
    const today = getTodayDateString();
    console.log(`📅 수집 대상 날짜: ${today} (KST 기준)`);
    console.log('');
    
    // 데이터 수집
    const deals = await collectRealEstateDataForDate(today);
    
    if (deals.length === 0) {
      console.log('⚠️  ===== 데이터 없음 경고 =====');
      console.log('해당 월의 거래 데이터가 없습니다');
      console.log('💡 이는 API 응답 문제이거나 실제로 데이터가 없는 상황입니다');
      console.log('');
    }
    
    // 파일로 저장
    const savedPath = await saveDataToFile(deals, today);
    console.log('');
    
    // 통계 정보
    if (deals.length > 0) {
      const prices = deals.map(deal => deal.price_numeric);
      const avgPrice = Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length);
      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);
      
      console.log('📈 ===== 거래 통계 =====');
      console.log(`   평균 가격: ${formatPrice(avgPrice)}`);
      console.log(`   최고 가격: ${formatPrice(maxPrice)}`);
      console.log(`   최저 가격: ${formatPrice(minPrice)}`);
      
      // 최신 거래 5건 표시
      const recentDeals = deals
        .sort((a, b) => new Date(b.deal_date).getTime() - new Date(a.deal_date).getTime())
        .slice(0, 5);
      
      console.log('');
      console.log('🏠 ===== 최신 거래 TOP 5 =====');
      recentDeals.forEach((deal, index) => {
        console.log(`   ${index + 1}. ${deal.apartment_name} ${deal.area} ${deal.floor} - ${deal.price} (${deal.deal_date})`);
      });
    }
    
    console.log('');
    console.log('✅ ===== 자동 수집 성공 완료 =====');
    console.log(`📂 저장 경로: ${savedPath}`);
    console.log(`📊 최종 수집 건수: ${deals.length}건`);
    console.log(`🔗 API 확인: /api/realestate?checkNew=true`);
    
  } catch (error) {
    console.error('❌ ===== 자동 수집 실패 =====');
    console.error('오류 내용:', error);
    console.error('스택 트레이스:', error.stack);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}