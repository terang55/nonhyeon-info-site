import { NextRequest, NextResponse } from 'next/server';

interface TrainInfo {
  station: string;
  line: string;
  direction: string;
  destination: string;
  arrivalTime: string;
  trainType: string;
  status: string;
  currentLocation: string;
  stationsLeft?: string; // 몇 개 역 남았는지
  remainingMinutes?: number; // 남은 시간(분)
  updatedAt: string;
}

// 역명 매핑: UI에서 보여주는 이름 → API 요청용 이름
const stationNameMapping: { [key: string]: string } = {
  '호구포역': '호구포',
  '인천논현역': '인천논현',
  '소래포구역': '소래포구'
};

// 서울교통공사 API 키 (환경변수에서 가져오기)
const SUBWAY_API_KEY = process.env.SEOUL_OPEN_API_KEY;

export async function GET(request: NextRequest) {
  try {
    // 환경변수 디버깅
    console.log('🔧 환경변수 디버깅:');
    console.log('  - SEOUL_OPEN_API_KEY:', process.env.SEOUL_OPEN_API_KEY ? 'EXISTS' : 'NOT_FOUND');
    console.log('  - NODE_ENV:', process.env.NODE_ENV);
    console.log('  - 전체 env 키들:', Object.keys(process.env).filter(key => key.includes('SEOUL')));
    
    const searchParams = request.nextUrl.searchParams;
    const stationParam = searchParams.get('station');
    
    if (!stationParam) {
      return NextResponse.json({
        success: false,
        error: '역명이 필요합니다.'
      }, { status: 400 });
    }

    console.log('🚇 요청된 역명:', stationParam);
    console.log('🔑 API 키 상태:', SUBWAY_API_KEY ? `로드됨 (${SUBWAY_API_KEY.substring(0, 10)}...)` : '❌ 로드 실패');
    
    // 역명 매핑 적용
    const mappedStationName = stationNameMapping[stationParam] || stationParam;
    console.log('🚇 매핑된 역명:', mappedStationName);

    // 테스트용 더미 데이터 (실제 API 연동 전까지)
    const dummyTrainData: TrainInfo[] = [
      {
        station: mappedStationName,
        line: '수인분당선',
        direction: '상행',
        destination: '미운행중',
        arrivalTime: '미운행중',
        trainType: '일반',
        status: '미운행중',
        currentLocation: '미운행중',
        stationsLeft: '미운행중',
        remainingMinutes: undefined,
        updatedAt: new Date().toISOString()
      },
      {
        station: mappedStationName,
        line: '수인분당선',
        direction: '하행',
        destination: '미운행중',
        arrivalTime: '미운행중',
        trainType: '일반',
        status: '미운행중',
        currentLocation: '미운행중',
        stationsLeft: '미운행중',
        remainingMinutes: undefined,
        updatedAt: new Date().toISOString()
      }
    ];

    // 실제 서울교통공사 API 호출 (.env.local에서 가져오기)
    // 임시: 환경변수 로딩 실패 시 폴백 키 사용
    const apiKey = SUBWAY_API_KEY || '496144506174657239334644787245';
    console.log('🔑 사용할 API 키:', apiKey ? `${apiKey.substring(0, 10)}...` : '❌ API 키 없음');
    console.log('🔑 키 출처:', SUBWAY_API_KEY ? '환경변수' : '폴백 키');
    
    if (apiKey) {
      try {
        // XML 형태로 API 호출
        const apiUrl = `http://swopenapi.seoul.go.kr/api/subway/${apiKey}/xml/realtimeStationArrival/0/5/${encodeURIComponent(mappedStationName)}`;
        
        console.log('🚇 API 호출:', apiUrl);
        
        const response = await fetch(apiUrl);
        const xmlText = await response.text();
        
        console.log('🚇 API XML 응답:', xmlText);
        
                 // XML 파싱 (간단한 정규식 사용)
         const trainDataRegex = /<row>([\s\S]*?)<\/row>/g;
        const trains = [];
        let match;
        
        while ((match = trainDataRegex.exec(xmlText)) !== null) {
          const rowData = match[1];
          
          // 각 필드 추출
          const bstatnNm = rowData.match(/<bstatnNm>(.*?)<\/bstatnNm>/)?.[1] || '';
          const updnLine = rowData.match(/<updnLine>(.*?)<\/updnLine>/)?.[1] || '';
          const arvlMsg2 = rowData.match(/<arvlMsg2>(.*?)<\/arvlMsg2>/)?.[1] || '';
          const arvlMsg3 = rowData.match(/<arvlMsg3>(.*?)<\/arvlMsg3>/)?.[1] || '';
          const btrainSttus = rowData.match(/<btrainSttus>(.*?)<\/btrainSttus>/)?.[1] || '';
          const barvlDtStr = rowData.match(/<barvlDt>(.*?)<\/barvlDt>/)?.[1] || '';
          const remainingSeconds = parseInt(barvlDtStr, 10);
          const remainingMinutes = !isNaN(remainingSeconds) && remainingSeconds > 0 ? Math.ceil(remainingSeconds / 60) : undefined;
          
          // stationsLeft 정보 추출 (예: "[6]번째 전역 (인하대)" -> "6개 역 전")
          let stationsLeft = '';
          const stationMatch = arvlMsg3.match(/\[(\d+)\]번째 전역 \(([^)]+)\)/);
          if (stationMatch) {
            const count = stationMatch[1];
            stationsLeft = `${count}개 역 전`;
          }
          
          trains.push({
            station: mappedStationName,
            line: '수인분당선',
            direction: updnLine || '정보없음',
            destination: bstatnNm || '종착역',
            arrivalTime: arvlMsg2 || '정보 없음',
            trainType: btrainSttus || '일반',
            status: '운행',
            currentLocation: arvlMsg3 || '위치 정보 없음',
            stationsLeft: stationsLeft || undefined,
            remainingMinutes: remainingMinutes,
            updatedAt: new Date().toISOString()
          });
        }
        
        if (trains.length > 0) {
          console.log('✅ 실시간 데이터 파싱 완료:', trains);
          
          return NextResponse.json({
            success: true,
            data: trains,
            timestamp: new Date().toISOString(),
            note: '실시간 데이터'
          });
        }
        
      } catch (apiError) {
        console.error('🚇 실제 API 호출 실패:', apiError);
        // API 실패 시 더미 데이터로 폴백
      }
    }

    // API 키가 없거나 실패한 경우 더미 데이터 반환
    console.log('🚇 더미 데이터 반환');
    
    return NextResponse.json({
      success: true,
      data: dummyTrainData,
      timestamp: new Date().toISOString(),
      note: '테스트 데이터 - 현재는 지하철 정보가 없습니다'
    });

  } catch (error) {
    console.error('🚇 지하철 API 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: '지하철 정보를 가져오는데 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
} 