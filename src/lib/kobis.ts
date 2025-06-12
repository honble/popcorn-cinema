// src/lib/kobis.ts

import { getLastSundayYMD, getYesterdayYMD } from '@/utils/date';
import { PosterInfo, fetchPosterInfo } from './tmdb';

// KOBIS 영화 ID 데이터 타입
export interface Movie {
  movieCd: string; // 영화 고유 코드
  movieNm: string; // 영화 제목
  multiMovieYn : string // 다양성 영화 'Y', 상업 옇화 'N'
}

// KOBIS 영화 정보 데이터 타입 (openDt 포함)
export interface MovieList extends Movie {
  audiAcc: string; // 누적 관객 수
  openDt: string; // 개봉일 (YYYYMMDD)
  posterInfo?: PosterInfo; // TMDB 포스터 및 개요 정보
}

// KOBIS 영화 상세 정보 원시 데이터 타입
type Named<T extends string> = {[k in `${T}Nm`]: string}
type Genre = Named<'genre'>;
type Director = Named<'people'>;
type Actor = Named<'people'>;

export interface RawMovieDetail extends Movie {
  prdtYear: string;
  showTm: string;
  genres: Genre[];
  directors: Director[];
  actors: Actor[];
  posterInfo: PosterInfo; 
}

// KOBIS 영화 상세 정보 가공 데이터 타입
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

  switch (category) {
    case 'daily':
      endpoint = 'boxoffice/searchDailyBoxOfficeList.json';
      params = { targetDt: targetDt ?? getYesterdayYMD() };
      break;
    case 'weekly':
      endpoint = 'boxoffice/searchWeeklyBoxOfficeList.json';
      params = { targetDt: targetDt ?? getLastSundayYMD(), weekGb: '0' };
      break;
    case 'weekend':
      endpoint = 'boxoffice/searchWeeklyBoxOfficeList.json';
      params = { targetDt: targetDt ?? getLastSundayYMD(), weekGb: '1' };
      break;
  }

  const list = await fetchBoxofficeList(endpoint, params);
  const diversityMovies = list.filter(item => item.multiMovieYn === 'Y'); // 다양성 영화 필터링
  return Promise.all(
    diversityMovies.map(async(item) => {
      const year = item.openDt?.slice(0, 4) ?? '';
      const posterInfo = await fetchPosterInfo(item.movieNm, year);
      return {
        ...item,
        posterInfo,
      }
    })
  )
}

// KOBIS 영화 상세정보 호출
export async function fetchMovieDetail(movieCd: string): Promise<MovieDetail> {
  const endpoint = 'movie/searchMovieInfo.json';
  const url = buildKobisUrl(endpoint, { movieCd }).replace(/\s+/g, '');
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    console.error('[fetchMovieDetail] 응답 바디 →', await res.text());
    throw new Error(`KOBIS API error: ${res.status}`);
  }

  const json = await res.json();
  const info: RawMovieDetail = json.movieInfoResult.movieInfo;
  const genres = info.genres.map(g => g.genreNm);
  const directors = info.directors.map(d => d.peopleNm);
  const actors = info.actors.map(a => a.peopleNm);
  const posterInfo = await fetchPosterInfo(info.movieNm); // 상세페이지에서는 개봉연도 제외

  return {
    movieCd: info.movieCd,
    movieNm: info.movieNm,
    prdtYear: info.prdtYear,
    showTm: info.showTm,
    multiMovieYn: info.multiMovieYn,
    genres,
    directors,
    actors,
    posterInfo,
  }
}

// 검색어로 KOBIS 영화 정보 호출
export const searchMovieByTitle = async (title: string) => {
  const url = buildKobisUrl('movie/searchMovieList.json', {
    movieNm: title,
  });
  const res = await fetch(url);
  const data = await res.json();

  return data.movieListResult.movieList;
};
