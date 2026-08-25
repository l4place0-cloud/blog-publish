import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const shaPattern = /^[0-9a-f]{40}$/;

const assertSha = (value, label) => {
  const normalized = value.trim().toLowerCase();
  if (!shaPattern.test(normalized)) {
    throw new Error(`${label} did not resolve to one 40-character commit SHA: ${value}`);
  }
  return normalized;
};

export const resolveLocalHead = (repositoryRoot) => assertSha(
  execFileSync('git', ['-C', resolve(repositoryRoot), 'rev-parse', 'HEAD'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }),
  `Display repository ${repositoryRoot}`,
);

export const repositoryRemote = (repository) => {
  if (!repository) throw new Error('Repository is required');
  return /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)
    ? `https://github.com/${repository}.git`
    : repository;
};

export const resolveRemoteSha = (repository, ref = 'refs/heads/main') => {
  const remote = repositoryRemote(repository);
  let output;
  try {
    output = execFileSync('git', ['ls-remote', '--exit-code', remote, ref], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch {
    throw new Error(`Cannot resolve ${repository} at ${ref}`);
  }

  const matches = output.trim().split('\n').filter(Boolean);
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one match for ${repository} at ${ref}, found ${matches.length}`);
  }
  return assertSha(matches[0].split(/\s+/)[0], `${repository} ${ref}`);
};

export const compositeVersion = ({ displaySha, blogSha, solutionsSha }) => [
  assertSha(displaySha, 'displaySha'),
  assertSha(blogSha, 'blogSha'),
  assertSha(solutionsSha, 'solutionsSha'),
].join('-');

const booleanValue = (value) => value === true || value === 'true';

export const planPublish = ({ eventName, force = false, cacheHit = false }) => {
  const forced = eventName === 'workflow_dispatch' && booleanValue(force);
  const alreadyPublished = booleanValue(cacheHit);
  const shouldPublish = forced || !alreadyPublished;
  return {
    shouldPublish,
    reason: forced ? 'manual-force' : alreadyPublished ? 'already-published' : 'new-version',
  };
};

const writeOutputs = (values) => {
  const outputPath = process.env.GITHUB_OUTPUT;
  for (const [name, value] of Object.entries(values)) {
    const rendered = typeof value === 'boolean' ? String(value) : value;
    if (outputPath) appendFileSync(outputPath, `${name}=${rendered}\n`);
  }
  process.stdout.write(`${JSON.stringify(values)}\n`);
};

const main = () => {
  const command = process.argv[2];
  if (command === 'resolve') {
    const displaySha = resolveLocalHead(process.env.DISPLAY_ROOT ?? process.cwd());
    const blogSha = resolveRemoteSha(
      process.env.BLOG_REPOSITORY,
      process.env.BLOG_REF ?? 'refs/heads/main',
    );
    const solutionsSha = resolveRemoteSha(
      process.env.SOLUTIONS_REPOSITORY,
      process.env.SOLUTIONS_REF ?? 'refs/heads/main',
    );
    writeOutputs({
      display_sha: displaySha,
      blog_sha: blogSha,
      solutions_sha: solutionsSha,
      version: compositeVersion({ displaySha, blogSha, solutionsSha }),
    });
    return;
  }
  if (command === 'plan') {
    const plan = planPublish({
      eventName: process.env.EVENT_NAME,
      force: process.env.FORCE,
      cacheHit: process.env.CACHE_HIT,
    });
    writeOutputs({ should_publish: plan.shouldPublish, reason: plan.reason });
    return;
  }
  throw new Error('Usage: node scripts/publish-control.mjs <resolve|plan>');
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
