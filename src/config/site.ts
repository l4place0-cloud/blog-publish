export const site = {
  // 站点与 SEO
  name: 'L4place',
  shortName: 'L.',
  monogram: 'L',
  title: 'L4place，知晓一切的妖精',
  description: '记录独立开发、内容产品与 AI 辅助创作的个人博客。',
  url: 'https://l4place.dev',
  language: 'zh-CN',
  ogLocale: 'zh_CN',
  timeZone: 'Asia/Shanghai',

  // 首页身份信息
  author: 'L4place',
  location: '中国',
  heroKicker: 'Independent maker',
  systemLabel: '个人表达系统',
  role: '独立创作者',
  intro: '在生活之余，不忘以独特的视角观察世界。',
  bio: '在繁忙之余，不要忘了驻足欣赏风景。',

  // 联系方式
  email: 'helloworld@l4.place',
  social: {
    github: 'https://github.com/l4place0',
    email: 'mailto:helloworld@l4.place',
    rss: '/rss.xml',
  },

  // 栏目页标题与说明
  pages: {
    articles: {
      eyebrow: 'Articles',
      title: '文章',
      description: '我所思考的.',
      seoDescription: '完整、经过整理、适合深度阅读的技术与产品文章。',
    },
    projects: {
      eyebrow: 'Projects',
      title: '项目',
      description: '我所创造的.',
      seoDescription: '实际做过的产品、工具、实验和案例。',
    },
    space: {
      eyebrow: 'Space',
      title: '空间',
      description: '灵光一现.',
      seoDescription: '随笔、项目动态、链接收藏，以及一些想法。',
    },
    about: {
      eyebrow: 'About',
      title: '关于',
    },
  },

  // 首页 Now
  now: {
    doing: '打磨一个低摩擦的个人知识工作台，并持续整理这套博客的写作工作流。',
    learning: '关注本地优先软件、AI 协作界面，以及更诚实的产品叙事。',
    updatedAt: new Date('2026-07-12T08:00:00+08:00'),
  },

  // 关于页
  about: {
    pageDescription: '我如何工作、正在关注什么，以及为什么维护这个站点。',
    introduction: '无名的创作者，专注于将脑内灵光一现的的空想具现',
    focus: ' ...',
    workingStyle: '...',
    topics: ['...', '...', '...'],
    colophon: '在浮躁的互联网里的一块小小自留地。',
  },

  // 页脚
  footer: {
    tagline: ['把想法做成东西，', '再把过程写下来。'],
    note: 'build by astro',
  },
} as const;

export const socialLinks = [
  { label: 'GitHub', href: site.social.github, rel: 'me' },
  { label: 'Email', href: site.social.email },
  { label: 'RSS', href: site.social.rss },
] as const;

export const navItems = [
  { href: '/articles', label: '文章' },
  { href: '/projects', label: '项目' },
  { href: '/space', label: '空间' },
  { href: '/about', label: '关于' },
] as const;

export const projectStatus = {
  active: '正在开发',
  maintained: '持续维护',
  completed: '已完成',
  experiment: '实验项目',
  archived: '已归档',
} as const;

export const spaceType = {
  thought: '想法',
  progress: '项目动态',
  link: '链接',
  photo: '图片',
  media: '书影音',
  snippet: '代码片段',
} as const;
