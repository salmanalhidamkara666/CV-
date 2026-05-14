/**
 * Utility to convert Gregorian Year to Japanese Emperor Era (Show, Heisei, Reiwa).
 * Extremely useful for professional Japanese CV forms!
 */
export function toJapaneseEra(yearNum: number | string): string {
  const year = typeof yearNum === 'string' ? parseInt(yearNum, 10) : yearNum;
  if (isNaN(year) || year < 1868) return "";

  if (year >= 2019) {
    const eraYear = year - 2019 + 1;
    return `令和${eraYear === 1 ? '元' : eraYear}年`;
  } else if (year >= 1989) {
    const eraYear = year - 1989 + 1;
    return `平成${eraYear === 1 ? '元' : eraYear}年`;
  } else if (year >= 1926) {
    const eraYear = year - 1926 + 1;
    return `昭和${eraYear === 1 ? '元' : eraYear}年`;
  } else if (year >= 1912) {
    const eraYear = year - 1912 + 1;
    return `大正${eraYear === 1 ? '元' : eraYear}年`;
  } else {
    const eraYear = year - 1868 + 1;
    return `明治${eraYear === 1 ? '元' : eraYear}年`;
  }
}

/**
 * Convert user birthdate info to standard Japanese Age format
 */
export function calculateJapaneseAge(birthYear: string, birthMonth: string, birthDay: string): number {
  const y = parseInt(birthYear);
  const m = parseInt(birthMonth);
  const d = parseInt(birthDay);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return 0;
  
  const today = new Date();
  let age = today.getFullYear() - y;
  const birthDateThisYear = new Date(today.getFullYear(), m - 1, d);
  if (today < birthDateThisYear) {
    age--;
  }
  return age;
}
