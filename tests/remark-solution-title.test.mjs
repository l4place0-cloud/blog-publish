import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolve } from 'node:path';

import remarkSolutionTitle from '../src/lib/remark-solution-title.mjs';

test('removes the source heading only for files in the configured solutions repository', () => {
  const previousRoot = process.env.SOLUTIONS_CONTENT_ROOT;
  process.env.SOLUTIONS_CONTENT_ROOT = '/tmp/blog-publish-solutions';

  try {
    const transform = remarkSolutionTitle();
    const solutionTree = {
      children: [
        { type: 'heading', depth: 1, children: [] },
        { type: 'paragraph', children: [] },
      ],
    };
    const articleTree = {
      children: [{ type: 'heading', depth: 1, children: [] }],
    };

    transform(solutionTree, {
      path: resolve('/tmp/blog-publish-solutions/leetcode.cn/example.md'),
    });
    transform(articleTree, {
      path: resolve('/tmp/blog-publish-content/articles/example.md'),
    });

    assert.deepEqual(solutionTree.children, [{ type: 'paragraph', children: [] }]);
    assert.equal(articleTree.children.length, 1);
  } finally {
    if (previousRoot === undefined) delete process.env.SOLUTIONS_CONTENT_ROOT;
    else process.env.SOLUTIONS_CONTENT_ROOT = previousRoot;
  }
});
