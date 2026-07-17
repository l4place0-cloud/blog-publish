import { getCollection, type CollectionEntry } from 'astro:content';
import { withBase } from './paths';

export const solutionPlatforms = {
  luogu: { label: '洛谷', host: 'luogu.com.cn' },
  leetcode: { label: 'LeetCode', host: 'leetcode.cn' },
  codeforces: { label: 'Codeforces', host: 'codeforces.com' },
  nowcoder: { label: '牛客', host: 'nowcoder.com' },
  poj: { label: 'POJ', host: 'poj.org' },
} as const;

export type SolutionPlatform = keyof typeof solutionPlatforms;
export type SolutionEntry = CollectionEntry<'solutions'>;

export async function getSolutions() {
  return (await getCollection('solutions')).sort((a, b) =>
    b.data.date.valueOf() - a.data.date.valueOf() || solutionTitle(a).localeCompare(solutionTitle(b), 'zh-CN')
  );
}

const fallbackSlug = (value: string) => value
  .normalize('NFKD')
  .toLowerCase()
  .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
  .replace(/^-+|-+$/g, '') || 'solution';

export function solutionTitle(entry: SolutionEntry) {
  return entry.body?.match(/^#\s+(.+)$/m)?.[1]?.trim() || entry.id.split('/').at(-1) || '未命名题解';
}

export function solutionPlatform(entry: SolutionEntry): SolutionPlatform {
  const hostname = new URL(entry.data.source).hostname.replace(/^www\./, '');
  if (hostname.endsWith('luogu.com.cn')) return 'luogu';
  if (hostname.endsWith('leetcode.cn')) return 'leetcode';
  if (hostname.endsWith('codeforces.com')) return 'codeforces';
  if (hostname.endsWith('nowcoder.com')) return 'nowcoder';
  return 'poj';
}

export function solutionSlug(entry: SolutionEntry) {
  const url = new URL(entry.data.source);
  const platform = solutionPlatform(entry);

  if (platform === 'luogu') {
    return fallbackSlug(url.pathname.match(/\/problem\/([^/]+)/i)?.[1] || solutionTitle(entry));
  }
  if (platform === 'leetcode') {
    return fallbackSlug(url.pathname.match(/\/problems\/([^/]+)/i)?.[1] || solutionTitle(entry));
  }
  if (platform === 'codeforces') {
    const match = url.pathname.match(/\/contest\/(\d+)\/problem\/([^/]+)/i);
    if (match) return `${match[1]}/${fallbackSlug(match[2])}`;
  }
  if (platform === 'nowcoder') {
    return fallbackSlug(url.pathname.match(/\/problem\/(\d+)/i)?.[1] || solutionTitle(entry));
  }
  if (platform === 'poj') {
    return fallbackSlug(url.searchParams.get('id') || solutionTitle(entry));
  }

  return fallbackSlug(solutionTitle(entry));
}

export function solutionRoute(entry: SolutionEntry) {
  return `/solutions/${solutionPlatform(entry)}/${solutionSlug(entry)}`;
}

export function solutionPath(entry: SolutionEntry) {
  return withBase(solutionRoute(entry));
}

export function solutionTags(entry: SolutionEntry) {
  return entry.data.tags.map((tag) => tag.replace(/^算法\//, ''));
}

export function solutionSearchText(entry: SolutionEntry) {
  const platform = solutionPlatform(entry);
  return [
    solutionTitle(entry),
    solutionPlatforms[platform].label,
    platform,
    ...entry.data.tags,
    ...solutionTags(entry),
  ].join(' ').toLocaleLowerCase('zh-CN');
}

export function formatSolutionDate(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Shanghai',
  }).format(date).replaceAll('/', '.');
}
