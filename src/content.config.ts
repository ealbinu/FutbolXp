import { defineCollection, z } from 'astro:content';

// Colección de equipos
export const teams = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string(),
    name: z.string(),
    flag: z.string().url().optional(),
    code: z.string().length(3),
    group: z.string().optional(),
    continent: z.string(),
    qualified: z.boolean().default(true),
    players: z.array(z.string()).optional(), // slugs de jugadores
    news: z.array(
      z.object({
        title: z.string(),
        url: z.string().url(),
        source: z.string(),
        published: z.string().datetime(),
      })
    ).optional(),
    social: z.object({
      twitter: z.string().url().optional(),
      instagram: z.string().url().optional(),
      officialSite: z.string().url().optional(),
    }).optional(),
  }),
});

// Colección de jugadores
export const players = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string(),
    name: z.string(),
    team: z.string(), // slug del equipo
    position: z.string(),
    number: z.number().optional(),
    photo: z.string().url().optional(),
    nationality: z.string(),
    birth: z.string().optional(),
    social: z.object({
      twitter: z.string().url().optional(),
      instagram: z.string().url().optional(),
      tiktok: z.string().url().optional(),
      facebook: z.string().url().optional(),
    }),
    news: z.array(
      z.object({
        title: z.string(),
        url: z.string().url(),
        source: z.string(),
        published: z.string().datetime(),
      })
    ).optional(),
  }),
});

// Colección de contenido (noticias generales)
export const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updated: z.date().optional(),
    author: z.string(),
    image: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { teams, players, posts };