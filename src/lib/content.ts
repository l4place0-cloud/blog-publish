import { getCollection, type CollectionEntry } from 'astro:content';
import { site } from '../config/site';
import { withBase } from './paths';

const isPublished = <T extends { data: { draft: boolean } }>(entry: T) => !entry.data.draft;

export const byDateDesc = <T extends { data: { publishedAt: Date } }>(a: T, b: T) =>
  b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf();

export async function getArticles() {
  return (await getCollection('articles')).filter(isPublished).sort(byDateDesc);
}

export async function getProjects() {
  return (await getCollection('projects')).filter(isPublished).sort((a, b) =>
    (a.data.order ?? 99) - (b.data.order ?? 99) || b.data.startedAt.valueOf() - a.data.startedAt.valueOf()
  );
}

export async function getSpace() {
  return (await getCollection('space')).filter(isPublished).sort(byDateDesc);
}

export const articlePath = (entry: CollectionEntry<'articles'>) => withBase(`/articles/${entry.id}`);
export const projectPath = (entry: CollectionEntry<'projects'>) => withBase(`/projects/${entry.id}`);
export const spacePath = (entry: CollectionEntry<'space'>) => withBase(`/space/${entry.id}`);

export function formatDate(date: Date, withYear = true) {
  return new Intl.DateTimeFormat(site.language, {
    year: withYear ? 'numeric' : undefined,
    month: 'long', day: 'numeric', timeZone: site.timeZone,
  }).format(date);
}

export function formatMonth(date: Date) {
  return new Intl.DateTimeFormat(site.language, { year: 'numeric', month: 'long', timeZone: site.timeZone }).format(date);
}

export function readingTime(body = '') {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  const chars = body.replace(/\s/g, '').length;
  return Math.max(1, Math.ceil(Math.max(words / 220, chars / 500)));
}

export function externalDomain(url?: string) {
  if (!url) return '';
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}
