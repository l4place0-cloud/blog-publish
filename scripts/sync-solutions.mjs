import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url);
const repository = new URL('sources/my-solve/', root);
const shouldPull = process.argv.includes('--pull');

const runGit = (args) => execFileSync('git', args, {
  cwd: root,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'inherit'],
});

if (!existsSync(new URL('.git', repository))) {
  process.stdout.write('Initializing solutions submodule...\n');
  runGit(['submodule', 'update', '--init', '--recursive', 'sources/my-solve']);
}

if (shouldPull) {
  process.stdout.write('Pulling latest solutions...\n');
  const output = runGit(['submodule', 'update', '--init', '--remote', '--checkout', 'sources/my-solve']);
  process.stdout.write(output);
}

const platformDirectories = ['codeforces.com', 'leetcode.cn', 'luogu.com.cn', 'nowcoder.com', 'poj.org'];
const markdownFiles = platformDirectories.flatMap((directory) => {
  const absoluteDirectory = new URL(`${directory}/`, repository);
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

process.stdout.write(`Solutions ready: ${markdownFiles.length} entries.\n`);
