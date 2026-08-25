import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { parse } from 'yaml';
import {
  compositeVersion,
  planPublish,
  repositoryRemote,
  resolveLocalHead,
  resolveRemoteSha,
} from '../scripts/publish-control.mjs';

const fixture = (name) => {
  const repository = mkdtempSync(join(tmpdir(), `blog-publish-${name}-`));
  execFileSync('git', ['-C', repository, 'init', '-q']);
  execFileSync('git', ['-C', repository, 'config', 'user.name', 'Publish Test']);
  execFileSync('git', ['-C', repository, 'config', 'user.email', 'publish-test@example.invalid']);
  writeFileSync(join(repository, 'README.md'), `${name}\n`);
  execFileSync('git', ['-C', repository, 'add', 'README.md']);
  execFileSync('git', ['-C', repository, 'commit', '-qm', `Create ${name} fixture`]);
  return repository;
};

const blogFixture = fixture('blog');
const solutionsFixture = fixture('solutions');

test('resolves exact SHAs and creates a stable composite version', () => {
  const displaySha = resolveLocalHead(new URL('..', import.meta.url).pathname);
  const blogSha = resolveRemoteSha(blogFixture, 'HEAD');
  const solutionsSha = resolveRemoteSha(solutionsFixture, 'HEAD');
  const version = compositeVersion({ displaySha, blogSha, solutionsSha });

  assert.match(displaySha, /^[0-9a-f]{40}$/);
  assert.match(blogSha, /^[0-9a-f]{40}$/);
  assert.match(solutionsSha, /^[0-9a-f]{40}$/);
  assert.equal(version, `${displaySha}-${blogSha}-${solutionsSha}`);
});

test('converts GitHub owner/repository names to public HTTPS remotes', () => {
  assert.equal(repositoryRemote('l4place0/blog'), 'https://github.com/l4place0/blog.git');
  assert.equal(repositoryRemote(blogFixture), blogFixture);
});

test('rejects a content ref that does not exist', () => {
  assert.throws(
    () => resolveRemoteSha(blogFixture, 'refs/heads/does-not-exist'),
    /Cannot resolve/,
  );
});

test('plans new, unchanged, and manually forced publication', () => {
  assert.deepEqual(
    planPublish({ eventName: 'schedule', cacheHit: false }),
    { shouldPublish: true, reason: 'new-version' },
  );
  assert.deepEqual(
    planPublish({ eventName: 'schedule', cacheHit: true }),
    { shouldPublish: false, reason: 'already-published' },
  );
  assert.deepEqual(
    planPublish({ eventName: 'workflow_dispatch', force: true, cacheHit: true }),
    { shouldPublish: true, reason: 'manual-force' },
  );
});

test('workflow preserves exact-version and post-deployment marker contracts', () => {
  const source = readFileSync(new URL('../.github/workflows/deploy.yml', import.meta.url), 'utf8');
  const workflow = parse(source);
  const discover = workflow.jobs.discover;
  const build = workflow.jobs.build;
  const deploy = workflow.jobs.deploy;
  const mark = workflow.jobs.mark_success;

  assert.deepEqual(workflow.on.push.branches, ['main']);
  assert.equal(workflow.on.workflow_dispatch.inputs.force.type, 'boolean');
  assert.equal(workflow.on.workflow_dispatch.inputs.force.default, true);
  assert.equal(workflow.on.schedule.length, 1);
  assert.equal(workflow.env.BLOG_REPOSITORY, 'l4place0/blog');
  assert.equal(workflow.env.SOLUTIONS_REPOSITORY, 'l4place0/solutions');
  assert.equal(discover.steps.find((step) => step.id === 'published').uses, 'actions/cache/restore@v6');
  assert.equal(discover.steps.find((step) => step.id === 'published').with['lookup-only'], true);
  assert.match(build.if, /should_publish/);
  assert.equal(build.steps.filter((step) => step.uses === 'actions/checkout@v7').length, 3);
  assert.equal(build.steps.find((step) => step.name === 'Checkout blog content').with.ref, '${{ needs.discover.outputs.blog_sha }}');
  assert.equal(build.steps.find((step) => step.name === 'Checkout solutions').with.ref, '${{ needs.discover.outputs.solutions_sha }}');
  assert.equal(build.steps.find((step) => step.uses === 'withastro/action@v6').with['build-cmd'], 'pnpm run build:content');
  assert.deepEqual(deploy.needs, ['discover', 'build']);
  assert.deepEqual(mark.needs, ['discover', 'deploy']);
  assert.match(mark.if, /needs\.deploy\.result == 'success'/);
  assert.equal(mark.steps.at(-1).uses, 'actions/cache/save@v6');
});
