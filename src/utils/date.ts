// Date 객체를 YYYYMMDD 문자열로 변환
export function formatDateYMD(date: Date): string {
  const YYYY = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const DD = String(date.getDate()).padStart(2, '0');
  return `${YYYY}${MM}${DD}`;
}

// 어제 날짜의 YYYYMMDD 반환
export function getYesterdayYMD(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDateYMD(d);
}

// 가장 최근 일요일의 YYYYMMDD 반환
export function getLastSundayYMD(): string {
  const today = new Date();
  const diff = today.getDay(); // 일요일=0
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - diff);
  return formatDateYMD(sunday);
}
