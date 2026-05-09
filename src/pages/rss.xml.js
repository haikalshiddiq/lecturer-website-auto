import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { siteConfig } from '../data/site';
import { toSlug } from '../lib/content';

export async function GET(context) {
  const posts = await getCollection('blog');
  return rss({
    title: `${siteConfig.name} Blog`,
    description: 'Academic insights and teaching reflections from Haikal Shiddiq S.Kom., M.T.',
    site: context.site ?? siteConfig.siteUrl,
    items: posts
      .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf())
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.publishedAt,
        description: post.data.summary,
        link: `/blog/${toSlug(post.id)}/`
      }))
  });
}
