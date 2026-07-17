import rss from '@astrojs/rss';
import { site } from '../config/site';
import { getArticles } from '../lib/content';
import { withBase } from '../lib/paths';

export async function GET(context: { site?: URL }) {
  const articles = await getArticles();
  return rss({
    title: `${site.name}的文章`,
    description: site.description,
    site: context.site ?? new URL(site.url),
    customData: `<language>${site.language}</language>`,
    items: articles.map((article) => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.publishedAt,
      link: withBase(`/articles/${article.id}`),
      categories: article.data.tags,
    })),
  });
}
