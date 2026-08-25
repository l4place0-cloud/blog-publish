# Blog Publish

L4place 博客的展示与发布仓库，使用 Astro、TypeScript、Content Collections、Markdown / MDX 与 Tailwind CSS 构建。

线上站点：[https://l4place0-cloud.github.io/blog-publish/](https://l4place0-cloud.github.io/blog-publish/)

## 仓库职责

发布链路由三个公开仓库组成：

- [`l4place0-cloud/blog-publish`](https://github.com/l4place0-cloud/blog-publish)：页面、样式、内容 schema 与 GitHub Pages 工作流。
- [`l4place0/blog`](https://github.com/l4place0/blog)：文章、项目和空间记录。
- [`l4place0/solutions`](https://github.com/l4place0/solutions)：算法题解。

本仓库不保存内容副本，也不使用 Git 子模块。构建时必须通过 `BLOG_CONTENT_ROOT` 和 `SOLUTIONS_CONTENT_ROOT` 指向两个内容仓库的干净 Git 工作树。

## 本地运行

需要 Node.js 22.12 或更高版本，以及 pnpm 7 或更高版本。先分别克隆三个仓库：

```bash
git clone https://github.com/l4place0-cloud/blog-publish.git
git clone https://github.com/l4place0/blog.git
git clone https://github.com/l4place0/solutions.git
cd blog-publish
pnpm install
```

设置内容仓库路径后运行开发、检查或构建：

```bash
export BLOG_CONTENT_ROOT=/absolute/path/to/blog
export SOLUTIONS_CONTENT_ROOT=/absolute/path/to/solutions

pnpm dev
pnpm check
pnpm build
pnpm preview
```

受控命令会确认两个内容仓库存在、目录结构完整且工作树干净，并在构建日志与 `dist/content-version.json` 中记录展示、博客内容和题解的精确提交。

## 内容写作

内容只在对应内容仓库中维护：

- `l4place0/blog/articles/`：文章。
- `l4place0/blog/projects/`：项目。
- `l4place0/blog/space/`：空间记录。
- `l4place0/solutions/` 下的平台目录：题解。

`blog` 仓库可以直接作为 Obsidian Vault 使用。展示仓库中的 `src/content.config.ts` 负责集合 schema 与发布校验。

## 自动发布

`.github/workflows/deploy.yml` 在以下情况检查三个仓库的最新提交：

- 展示仓库 `main` 更新；
- 每小时的第 17、47 分钟；
- 手动触发工作流。

工作流解析并锁定三个精确 SHA，再 checkout 内容、构建并发布 GitHub Pages。成功部署的版本会写入 Actions cache；没有任何仓库变化时，后续定时运行会跳过重复构建。

仓库变量：

```text
SITE_URL=https://l4place0-cloud.github.io
BASE_PATH=/blog-publish
PAGES_DEPLOY_MODE=actions
```

以后切换自定义域名时，修改 `SITE_URL` 和 `BASE_PATH`，再配置 GitHub Pages 与 DNS 即可。

## 主要目录

```text
.github/workflows/deploy.yml  # 内容发现、构建与 Pages 部署
scripts/                     # 发布控制与受控内容构建
src/
├── assets/                  # 由 Astro 优化的展示资源
├── components/              # 导航、SEO、内容卡片与关联内容
├── config/site.ts           # 站点身份、链接和文案
├── content.config.ts        # 外部内容集合 schema
├── layouts/                 # 页面布局
├── lib/                     # 内容查询、路径与 Markdown 处理
├── pages/                   # 页面路由、RSS 与 404
└── styles/global.css        # 设计变量与全站样式
tests/                       # 发布控制测试
```

## 站点配置

站主身份、联系链接、首页文案、Now 状态、页脚、语言和时区集中在 `src/config/site.ts`。站点 URL 和项目路径由 GitHub 仓库变量注入；SEO、RSS、Sitemap、导航和静态资源路径会随构建配置生成。
