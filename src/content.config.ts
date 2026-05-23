import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const topicEnum = z.enum([
  'Information System Management',
  'Communication Protocol',
  'Artificial Intelligence'
]);

const topics = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/topics' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    importance: z.string(),
    subtopics: z.array(z.string()),
    learningOutcomes: z.array(z.string()),
    featured: z.boolean().default(false),
    order: z.number().default(0)
  })
});

const resources = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/resources' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    topic: topicEnum,
    level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
    format: z.enum(['Article', 'Module', 'Lecture Note', 'Guide', 'Toolkit']),
    featured: z.boolean().default(false),
    publishedAt: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    downloadUrl: z.string().optional(),
    ctaLabel: z.string().optional()
  })
});

const publications = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/publications' }),
  schema: z.object({
    title: z.string(),
    year: z.number(),
    type: z.string(),
    topic: topicEnum,
    summary: z.string(),
    status: z.string(),
    externalUrl: z.url().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false)
  })
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    topic: topicEnum,
    publishedAt: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false)
  })
});

export const collections = { topics, resources, publications, blog };
