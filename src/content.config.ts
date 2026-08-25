import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { resolve } from 'node:path';

const requiredContentRoot = (name: 'BLOG_CONTENT_ROOT' | 'SOLUTIONS_CONTENT_ROOT') => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required; point it at a clean checkout of the corresponding content repository`);
  }
  return resolve(value);
};

const blogContentRoot = requiredContentRoot('BLOG_CONTENT_ROOT');
const solutionsContentRoot = requiredContentRoot('SOLUTIONS_CONTENT_ROOT');

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: resolve(blogContentRoot, 'articles') }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    cover: image().optional(),
    draft: z.boolean().default(false),
    projects: z.array(reference('projects')).default([]),
    sourceSpace: z.array(reference('space')).default([]),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: resolve(blogContentRoot, 'projects') }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    status: z.enum(['active', 'maintained', 'completed', 'experiment', 'archived']),
    startedAt: z.coerce.date(),
    endedAt: z.coerce.date().optional(),
    role: z.array(z.string()).default([]),
    stack: z.array(z.string()).default([]),
    links: z.object({
      website: z.url().optional(),
      github: z.url().optional(),
    }).default({}),
    cover: image().optional(),
    featured: z.boolean().default(false),
    order: z.number().optional(),
    draft: z.boolean().default(false),
  }),
});

const space = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: resolve(blogContentRoot, 'space') }),
  schema: ({ image }) => z.object({
    type: z.enum(['thought', 'progress', 'link', 'photo', 'media', 'snippet']),
    publishedAt: z.coerce.date(),
    title: z.string().optional(),
    excerpt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    project: reference('projects').optional(),
    relatedArticle: reference('articles').optional(),
    url: z.url().optional(),
    images: z.array(image()).default([]),
    mediaKind: z.enum(['book', 'movie', 'podcast', 'video', 'other']).optional(),
    mediaTitle: z.string().optional(),
    mediaCreator: z.string().optional(),
  }).superRefine((data, ctx) => {
    // Obsidian 中的新草稿允许暂缺类型专属字段；正式发布时再严格校验。
    if (data.draft) return;
    if (data.type === 'progress' && !data.project) ctx.addIssue({ code: 'custom', path: ['project'], message: 'progress 类型必须关联 project' });
    if (data.type === 'link' && !data.url) ctx.addIssue({ code: 'custom', path: ['url'], message: 'link 类型必须提供 url' });
    if (data.type === 'photo' && data.images.length === 0) ctx.addIssue({ code: 'custom', path: ['images'], message: 'photo 类型至少需要一张图片' });
    if (data.type === 'media' && (!data.mediaKind || !data.mediaTitle)) ctx.addIssue({ code: 'custom', path: ['mediaTitle'], message: 'media 类型必须提供 mediaKind 和 mediaTitle' });
  }),
});

const solutions = defineCollection({
  loader: glob({
    pattern: [
      'codeforces.com/**/*.md',
      'leetcode.cn/**/*.md',
      'luogu.com.cn/**/*.md',
      'nowcoder.com/**/*.md',
      'poj.org/**/*.md',
    ],
    base: solutionsContentRoot,
  }),
  schema: z.object({
    type: z.literal('solution'),
    tags: z.array(z.string()).default([]),
    date: z.coerce.date(),
    source: z.url(),
  }),
});

export const collections = { articles, projects, space, solutions };
