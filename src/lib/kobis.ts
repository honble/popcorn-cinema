// src/lib/kobis.ts

import { PosterInfo, fetchPosterInfo } from './tmdb';

// KOBIS 영화 ID 데이터 타입
export interface Movie {
  movieCd: string; // 영화 고유 코드
  movieNm: string; // 영화 제목
}

// KOBIS 영화 정보 데이터 타입 (openDt 포함)
export interface MovieList extends Movie {
  audiAcc: string; // 누적 관객 수
  openDt: string; // 개봉일 (YYYYMMDD)
  posterInfo?: PosterInfo; // TMDB 포스터 및 개요 정보
}

// KOBIS 영화 상세 정보 데이터 타입
export interface MovieDetail extends Movie {
  prdtYear: string;
  showTm: string;
  genres: string[];
  directors: string[];
  actors: string[];
  posterInfo: PosterInfo;
}

// 엔드포인트와 파라미터로 KOBIS API URL 생성
function buildKobisUrl(
  endpoint: string, // e.g. 'boxoffice/...json' or 'movie/...json'
  params: Record<string, string>
): string {
  const key = process.env.NEXT_PUBLIC_KOBIS_API_KEY!;
  const searchParams = new URLSearchParams({ key, ...params }).toString();
  return `https://www.kobis.or.kr/kobisopenapi/webservice/rest/${endpoint}?${searchParams}`;
  // e.g. https://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=YOUR_API_KEY&targetDt=20250609
  // e.g. https://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieInfo.json?key=YOUR_API_KEY&movieCd=20212345
}

// 전체 박스오피스
const urlAll = buildKobisUrl('boxoffice/searchDailyBoxOfficeList.json', {
  targetDt: '20250610',
});

// 다양성 영화만
const urlDiv = buildKobisUrl('boxoffice/searchDailyBoxOfficeList.json', {
  targetDt: '20250610',
  multiMovieYn: 'Y',
});

// 상업 영화만
const urlComm = buildKobisUrl('boxoffice/searchDailyBoxOfficeList.json', {
  targetDt: '20250610',
  multiMovieYn: 'N',
});

// KOBIS 박스오피스 리스트 공통 호출
async function fetchBoxofficeList(
  endpoint: string,
  params: Record<string, string>
): Promise<MovieList[]> {
  const url = buildKobisUrl(endpoint, params).replace(/\s+/g, '');
  const res = await fetch(url, { cache: 'no-store' }); // 캐시를 사용하지 않음, 항상 최신 데이터를 서버에서 직접 가져옴(실시간 데이터가 필요한 경우 : 박스오피스, 날씨, 주식 등)
  if (!res.ok) throw new Error(`KOBIS API error: ${res.status}`);
  const { boxOfficResult } = await res.json();
  return (
    (boxOfficResult.dailyBoxOfficeList as MovieList[]) ||
    (boxOfficResult.weeklyBoxOfficeList as MovieList[]) ||
    []
  );
}

// 박스오피스 카테고리
export type BoxOfficeCategory = 'daily' | 'weekly' | 'weekend';

// 통합 박스오피스 호출
export async function fetchBoxOffice(
  category: BoxOfficeCategory,
  targetDt?: string
): Promise<MovieList[]> {
  let endpoint: string;
  let params: Record<string, string>;
}
