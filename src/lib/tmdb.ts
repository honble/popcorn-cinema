// src/lib/tmdb.ts

// TMDB에서 가져온 포스터 및 줄거리 정보
export interface PosterInfo {
  posterUrl: string; // 포스터 이미지 URL 또는 대체 이미지
  overview: string; // 영화 줄거리
}

// API를 중복 호출(영화정보를 중복 요청)하지 않도록 메모리에 저장
const posterInfoCache = new Map<string, PosterInfo>();

// TMDB에서 포스터 URL과 개요 검색 (캐시 사용)
export async function fetchPosterInfo(
  title: string,
  year?: string
): Promise<PosterInfo> {
  const cacheKey = year ? `${title}_${year}` : title;
  if (posterInfoCache.has(cacheKey)) {
    return posterInfoCache.get(cacheKey)!;
  }

  const tmdbKey = process.env.NEXT_PUBLIC_TMDB_API_KEY!;
  const params: Record<string, string> = {
    api_key: tmdbKey,
    language: 'ko',
    query: title,
  };
  if (year) params['year'] = year;

  const url = `https://api.themoviedb.org/3/search/movie?${new URLSearchParams(
    params
  )}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const fallback: PosterInfo = {
      posterUrl: '/images/noImage.jpg',
      overview: '',
    };
    posterInfoCache.set(cacheKey, fallback);
    return fallback;
  }

  const json = await res.json();
  const first = json.results?.[0] || {};
  const overview = first.overview ?? '';
  const path = first.poster_path;
  const posterUrl = path
    ? `https://image.tmdb.org/t/p/w500${path}`
    : '/images/noImage.jpg';

  const info: PosterInfo = { posterUrl, overview };
  posterInfoCache.set(cacheKey, info);
  return info;
}
