import { NextRequest, NextResponse } from 'next/server';

// 이 API는 실시간으로 NEIS 학원·교습소 정보를 호출한 뒤
// 도로명주소(FA_RDNMA, FA_RDNDA)에 '논현동' 키워드가 포함된 항목만 필터링하여 반환합니다.
// 환경변수에 ACADEMY_API_KEY 가 설정돼 있어야 합니다.

export const dynamic = 'force-dynamic'; // 호출마다 fresh

interface AcademyItem {
  ACA_NM: string;
  REALM_SC_NM: string;
  LE_CRSE_NM: string;
  FA_RDNMA: string;
  FA_RDNDA: string;
  FA_TELNO: string | null;
  [key: string]: unknown;
}

interface NEISResponse {
  acaInsTiInfo?: [Record<string, unknown>, { row: AcademyItem[] }];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const dongKeyword = searchParams.get('dong') || '논현동';
  const keywordRegex = new RegExp(dongKeyword, 'i');

  const apiKey = process.env.ACADEMY_API_KEY || 'be1e77cd70ae4203b94e26667165c55d';

  const baseUrl =
    'https://open.neis.go.kr/hub/acaInsTiInfo?Type=json&pSize=100&ATPT_OFCDC_SC_CODE=E10&ADMST_ZONE_NM=%EB%82%A8%EB%8F%99%EA%B5%AC';

  const makeUrl = (page: number) => `${baseUrl}&pIndex=${page}&KEY=${apiKey}`;

  const rows: AcademyItem[] = [];

  try {
    // 최대 5페이지(500건)까지만 조회하여 과도한 호출 방지
    for (let page = 1; page <= 15; page++) {
      const res = await fetch(makeUrl(page), { next: { revalidate: 3600 } }); // 1시간 CDN 캐시
      const json = (await res.json()) as NEISResponse;
      const pageRows: AcademyItem[] | undefined = json.acaInsTiInfo?.[1]?.row;
      if (!pageRows || pageRows.length === 0) break;
      rows.push(...pageRows);
      // 리스트가 100건 미만이면 마지막 페이지
      if (pageRows.length < 100) break;
    }
  } catch (error) {
    console.error('ACADEMY API 오류:', error);
    return NextResponse.json({ success: false, error: 'External API error' }, { status: 500 });
  }

  const filtered = rows.filter(
    (item) => keywordRegex.test(item.FA_RDNMA || '') || keywordRegex.test(item.FA_RDNDA || '')
  );

  return NextResponse.json({ success: true, total: filtered.length, data: filtered }, { status: 200 });
} 