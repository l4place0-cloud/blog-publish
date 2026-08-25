# 个人博客

一个以内容关系为核心的静态个人博客，使用 Astro、TypeScript、Content Collections、Markdown / MDX 与 Tailwind CSS 构建。

站点包含四种节奏不同的内容：

- **文章**：完整、可长期阅读的主题内容。
- **项目**：展示问题、角色、方案、过程与结果。
- **题解**：从独立 Git 子模块读取的算法题解、复盘与代码。
- **空间**：按时间流记录想法、进展、链接、图片、书影音和代码片段。

站主身份、首页文案、各栏目标题与说明、联系信息、About、Now、页脚、语言、时区和站点 URL 全部集中在 `src/config/site.ts`。`astro.config.ts`、SEO、RSS 与页面会自动读取同一份配置；正式发布前只需修改这一处，再用自己的 Markdown 内容替换内容目录中的初始文章与项目。

## 本地运行

需要 Node.js 22.12 或更高版本，以及 pnpm 7 或更高版本。

```bash
pnpm install
pnpm dev
```

开发服务器默认运行在 `http://localhost:4321`。

首次克隆时建议同时初始化题解子模块：

```bash
git clone --recurse-submodules <博客仓库地址>
```

## 使用 Obsidian 写作

将 `src/content` 作为 Vault 在 Obsidian 中打开。仓库已启用核心 Templates 插件并配置 `Templates/` 模板目录，提供文章、项目及六种空间内容模板；图片附件默认保存在 `attachments/`。

推荐流程：在 `articles/`、`projects/` 或 `space/` 中先创建以英文 slug 命名的文件，然后通过命令面板执行“模板：插入模板”，选择对应模板。更完整的说明见 Vault 根目录中的 `写作说明.md`。

## 检查与构建

```bash
pnpm check
pnpm build
pnpm preview
```

构建产物位于 `dist/`，可以部署到任意普通静态托管平台。

## GitHub Pages 与个人域名

`.github/workflows/deploy.yml` 会在 `main` 更新后自动构建并发布 GitHub Pages。部署地址和项目路径不硬编码在页面中，而是由仓库变量控制：

```text
SITE_URL=https://l4place0.github.io
BASE_PATH=/l4p-blog
PAGES_DEPLOY_MODE=actions
```

以后切换到个人域名时，只需将 `SITE_URL` 改为个人域名、将 `BASE_PATH` 改为 `/`，再完成 Pages 自定义域名与 DNS 配置。站内导航、静态资源、RSS、Canonical URL 和 Sitemap 会在下一次构建时自动切换，不需要批量修改页面链接。

`PAGES_DEPLOY_MODE` 设为 `actions` 时才会启动 Actions 部署任务；使用分支发布作为临时托管方案时可设为 `branch`，避免重复启动工作流。

## 主要目录

```text
src/
├── assets/                 # 由 Astro 优化的本地图片
├── components/             # 导航、SEO、内容卡片与关联内容
├── config/site.ts          # 站主信息、链接、Now 与状态文案
├── content/
│   ├── articles/           # 长文章 Markdown / MDX
│   ├── projects/           # 项目案例 Markdown / MDX
│   └── space/              # 轻量时间流 Markdown / MDX
├── content.config.ts       # 四个集合的 schema 与条件校验
├── layouts/                # 全站、文章与项目布局
├── lib/content.ts          # 查询、排序、路径与格式化工具
├── pages/                  # 页面路由、RSS 与 404
└── styles/global.css       # Tailwind 入口、设计变量与全站样式
sources/
└── my-solve/               # 独立题解 Git 子模块
scripts/
└── sync-solutions.mjs      # 初始化、更新并校验题解内容
```

## 更新题解

题解原稿位于独立仓库 `sources/my-solve`，博客构建会直接读取其中五个平台目录，不会复制 Markdown。`@ROOT.md` 与 Obsidian 的 `KanBan.md` 不会发布。

```bash
pnpm solutions:check       # 初始化并校验当前锁定版本
pnpm solutions:pull        # 增量拉取远端 main
pnpm build:latest          # 拉取最新题解后构建
```

普通的 `pnpm build` 使用博客仓库当前锁定的子模块提交，适合可复现部署。`pnpm solutions:pull` 更新后，父仓库会显示 `sources/my-solve` 的 Gitlink 发生变化；确认内容无误后再提交该引用。

题解列表位于 `/solutions`，支持题号、标题与标签搜索，以及平台和热门算法标签筛选。详情页地址根据原题链接生成，不依赖包含空格或中文的本地文件名。

## 添加文章

在 `src/content/articles/` 新建 `.md` 或 `.mdx` 文件。文件名会成为永久链接，例如 `my-note.md` 对应 `/articles/my-note`。

```yaml
---
title: 文章标题
description: 一句话摘要
publishedAt: 2026-07-15
updatedAt: 2026-07-16 # 可选
tags: [Astro, 写作]
featured: false
cover: ../../assets/example.png # 可选
draft: false
projects: [project-file-name] # 可选，显式关联项目
sourceSpace: [space-file-name] # 可选，显式关联来源记录
---
```

正文从 Front Matter 后开始。仅在需要嵌入 Astro 组件时使用 MDX。

## 添加项目

在 `src/content/projects/` 新建 `.md` 或 `.mdx` 文件：

```yaml
---
title: 项目名称
description: 一句话介绍
status: active # active | maintained | completed | experiment | archived
startedAt: 2026-01-01
endedAt: 2026-06-01 # 可选
role: [产品设计, 开发]
stack: [Astro, TypeScript]
links:
  website: https://your-domain.com # 可选
  github: https://github.com/example/repo # 可选
cover: ../../assets/example.png # 可选
featured: false
order: 3 # 可选，数字越小越靠前
draft: false
---
```

项目详情正文建议说明背景、目标、个人角色、方案、过程、结果与下一步。项目页会自动聚合所有显式引用它的文章和空间动态。

## 添加空间记录

在 `src/content/space/` 新建 `.md` 或 `.mdx` 文件。所有记录都有独立永久链接。

```yaml
---
type: thought # thought | progress | link | photo | media | snippet
publishedAt: 2026-07-15T09:30:00+08:00
title: 可选标题
excerpt: 用于列表和 SEO 的简短摘要
tags: [随笔]
draft: false
project: project-file-name # progress 类型必填
relatedArticle: article-file-name # 可选
---
```

不同类型还有条件字段：

- `progress` 必须提供 `project`。
- `link` 必须提供合法的 `url`。
- `photo` 必须在 `images` 中提供至少一张本地图片。
- `media` 必须提供 `mediaKind` 和 `mediaTitle`，可选 `mediaCreator`。

字段缺失、类型错误或引用不存在时，内容同步或构建会给出错误，避免静默生成坏链接。

## 草稿、RSS 与 Sitemap

将任意内容的 `draft` 设为 `true` 后，它不会进入生产列表、详情路由或文章 RSS。动态详情页只由已发布集合生成，因此 Sitemap 也不会包含草稿永久链接。

- 文章 RSS：`/rss.xml`
- Sitemap 索引：`/sitemap-index.xml`
- 404：`/404`

## 主题与站点信息

全站身份、联系链接、Now 状态和站点 URL 集中在 `src/config/site.ts`。明暗主题默认跟随系统，访客手动切换后会写入本地存储。

发布前还应同步修改：

1. `astro.config.ts` 中的 `site`；
2. `src/config/site.ts` 中的 `url`、姓名、邮箱和社交链接；
3. `public/og.png` 社交分享图；
4. `public/favicon.svg` 站点图标。

## MVP 暂不包含

全站搜索、标签聚合页、全站归档、空间类型筛选、自动相关文章推荐、空间独立 RSS、评论、Newsletter、图片灯箱，以及独立的 Now / Uses / Colophon 页面均留作后续扩展。当前实现不包含数据库、登录、CMS、SSR 或客户端框架运行时。
