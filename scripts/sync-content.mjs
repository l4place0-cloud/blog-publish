import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url);
const blogRepository = new URL('sources/l4p-blog-content/', root);
const solutionsRepository = new URL('sources/my-solve/', root);
const submodules = ['sources/l4p-blog-content', 'sources/my-solve'];
const shouldPull = process.argv.includes('--pull');

const runGit = (args) => execFileSync('git', args, {
  cwd: root,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'inherit'],
});

if ([blogRepository, solutionsRepository].some((repository) => !existsSync(new URL('.git', repository)))) {
  process.stdout.write('Initializing content submodules...\n');
  runGit(['submodule', 'update', '--init', '--recursive', ...submodules]);
}

if (shouldPull) {
  process.stdout.write('Pulling latest content...\n');
  const output = runGit(['submodule', 'update', '--init', '--remote', '--checkout', ...submodules]);
  process.stdout.write(output);
}

const blogDirectories = ['articles', 'projects', 'space'];
const missingBlogDirectories = blogDirectories.filter(
  (directory) => !existsSync(new URL(`${directory}/`, blogRepository)),
);
if (missingBlogDirectories.length) {
  throw new Error(`Missing blog content directories: ${missingBlogDirectories.join(', ')}`);
}

const blogEntries = blogDirectories.flatMap((directory) =>
  readdirSync(new URL(`${directory}/`, blogRepository), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.mdx?$/.test(entry.name)),
);

const platformDirectories = ['codeforces.com', 'leetcode.cn', 'luogu.com.cn', 'nowcoder.com', 'poj.org'];
const markdownFiles = platformDirectories.flatMap((directory) => {
  const absoluteDirectory = new URL(`${directory}/`, solutionsRepository);
  if (!existsSync(absoluteDirectory)) return [];
  return readdirSync(absoluteDirectory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => join(entry.parentPath, entry.name));
});

const invalid = markdownFiles.filter((file) => {
  const source = readFileSync(file, 'utf8');
  return !/^---[\s\S]*?^type:\s*solution\s*$[\s\S]*?^source:\s*https?:\/\//m.test(source);
});

if (invalid.length) {
  throw new Error(`Invalid solution frontmatter:\n${invalid.join('\n')}`);
}

process.stdout.write(`Blog content ready: ${blogEntries.length} entries.\n`);
process.stdout.write(`Solutions ready: ${markdownFiles.length} entries.\n`);
