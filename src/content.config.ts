import { defineCollection, z } from 'astro:content';

const topics = defineCollection({
  type: 'content',
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
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    topic: z.string(),
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
  type: 'content',
  schema: z.object({
    title: z.string(),
    year: z.number(),
    type: z.string(),
    summary: z.string(),
    status: z.string(),
    externalUrl: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false)
  })
});

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    publishedAt: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false)
  })
});

export const collections = { topics, resources, publications, blog };
