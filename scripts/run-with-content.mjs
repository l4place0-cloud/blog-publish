import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repositoryRoot = realpathSync(new URL('..', import.meta.url));
const mode = process.argv[2];

if (!['build', 'check'].includes(mode)) {
  throw new Error('Usage: node scripts/run-with-content.mjs <build|check>');
}

const git = (cwd, args) => execFileSync('git', ['-C', cwd, ...args], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
}).trim();

const inspectContentRepository = (environmentName, requiredDirectories) => {
  const configuredRoot = process.env[environmentName];
  if (!configuredRoot) {
    throw new Error(`${environmentName} is required`);
  }

  const root = resolve(configuredRoot);
  if (!existsSync(root)) {
    throw new Error(`${environmentName} does not exist: ${root}`);
  }

  const canonicalRoot = realpathSync(root);
  let gitRoot;
  try {
    gitRoot = realpathSync(git(canonicalRoot, ['rev-parse', '--show-toplevel']));
  } catch {
    throw new Error(`${environmentName} must point to a Git working-tree root: ${canonicalRoot}`);
  }
  if (gitRoot !== canonicalRoot) {
    throw new Error(`${environmentName} must point to the repository root: ${canonicalRoot}`);
  }

  const missingDirectories = requiredDirectories.filter(
    (directory) => !existsSync(resolve(canonicalRoot, directory)),
  );
  if (missingDirectories.length > 0) {
    throw new Error(`${environmentName} is missing directories: ${missingDirectories.join(', ')}`);
  }

  const changes = git(canonicalRoot, ['status', '--porcelain', '--untracked-files=all']);
  if (changes) {
    throw new Error(`${environmentName} must be clean; commit or discard these changes:\n${changes}`);
  }

  return {
    root: canonicalRoot,
    sha: git(canonicalRoot, ['rev-parse', 'HEAD']),
  };
};

const blog = inspectContentRepository('BLOG_CONTENT_ROOT', ['articles', 'projects', 'space']);
const solutions = inspectContentRepository('SOLUTIONS_CONTENT_ROOT', [
  'codeforces.com',
  'leetcode.cn',
  'luogu.com.cn',
  'nowcoder.com',
  'poj.org',
]);
const displaySha = git(repositoryRoot, ['rev-parse', 'HEAD']);

process.stdout.write(`Content version: display=${displaySha} blog=${blog.sha} solutions=${solutions.sha}\n`);

// Astro's persistent content store can retain entries when an external root
// changes or becomes empty. A controlled build must derive it only from this input.
rmSync(resolve(repositoryRoot, '.astro'), { recursive: true, force: true });
rmSync(resolve(repositoryRoot, 'node_modules/.astro'), { recursive: true, force: true });

const result = spawnSync('pnpm', ['exec', 'astro', mode], {
  cwd: repositoryRoot,
  env: {
    ...process.env,
    BLOG_CONTENT_ROOT: blog.root,
    SOLUTIONS_CONTENT_ROOT: solutions.root,
  },
  stdio: 'inherit',
});

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

if (mode === 'build') {
  const version = {
    displaySha,
    blogSha: blog.sha,
    solutionsSha: solutions.sha,
  };
  writeFileSync(
    resolve(repositoryRoot, 'dist/content-version.json'),
    `${JSON.stringify(version, null, 2)}\n`,
  );
  process.stdout.write('Wrote dist/content-version.json\n');
}
