import { getCollection, type CollectionEntry } from 'astro:content';

export const toSlug = (id: string) => id.replace(/\.(md|mdx)$/, '');

type Topic = CollectionEntry<'topics'>['data'] & {
  id: CollectionEntry<'topics'>['id'];
  slug: string;
};

type Resource = CollectionEntry<'resources'>['data'] & {
  id: CollectionEntry<'resources'>['id'];
  slug: string;
};

type BlogPost = CollectionEntry<'blog'>['data'] & {
  id: CollectionEntry<'blog'>['id'];
  slug: string;
};

type Publication = CollectionEntry<'publications'>['data'] & {
  id: CollectionEntry<'publications'>['id'];
  slug: string;
};

const withSlug = <Entry extends { id: string; data: Record<string, unknown> }>(entry: Entry) => ({
  ...entry.data,
  id: entry.id,
  slug: toSlug(entry.id)
});

export const getTopics = async (): Promise<Topic[]> =>
  (await getCollection('topics'))
    .sort((a, b) => a.data.order - b.data.order)
    .map((topic) => withSlug(topic) as Topic);

export const getResources = async (): Promise<Resource[]> =>
  (await getCollection('resources'))
    .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf())
    .map((resource) => withSlug(resource) as Resource);

export const getBlogPosts = async (): Promise<BlogPost[]> =>
  (await getCollection('blog'))
    .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf())
    .map((post) => withSlug(post) as BlogPost);

export const getPublications = async (): Promise<Publication[]> =>
  (await getCollection('publications'))
    .sort((a, b) => b.data.year - a.data.year)
    .map((publication) => withSlug(publication) as Publication);

interface TopicCoverageInput {
  topics: Pick<Topic, 'title'>[];
  posts: Pick<BlogPost, 'title' | 'topic' | 'slug'>[];
  resources: Pick<Resource, 'title' | 'topic' | 'slug'>[];
  publications: Pick<Publication, 'title' | 'topic' | 'externalUrl'>[];
}

export const buildTopicCoverage = ({ topics, posts, resources, publications }: TopicCoverageInput) =>
  topics.map((topic) => {
    const latestPost = posts.find((post) => post.topic === topic.title);
    const latestResource = resources.find((resource) => resource.topic === topic.title);
    const latestPublication = publications.find((item) => item.topic === topic.title);

    return {
      topic: topic.title,
      postsCount: posts.filter((post) => post.topic === topic.title).length,
      resourcesCount: resources.filter((resource) => resource.topic === topic.title).length,
      publicationsCount: publications.filter((item) => item.topic === topic.title).length,
      latestPost: latestPost ? { title: latestPost.title, href: `/blog/${latestPost.slug}` } : undefined,
      latestResource: latestResource ? { title: latestResource.title, href: `/resources/${latestResource.slug}` } : undefined,
      latestPublication: latestPublication ? { title: latestPublication.title, href: latestPublication.externalUrl ?? '/publications' } : undefined
    };
  });
