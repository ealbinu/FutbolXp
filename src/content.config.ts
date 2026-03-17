import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { file } from 'astro/loaders';

export const collections = {
  teams: defineCollection({
    loader: file('src/content/teams/data.json'),
    schema: z.object({
      id: z.string(),
      name: z.string(),
      flag: z.string().optional(),
      code: z.string(),
      group: z.string().optional(),
      continent: z.string(),
      qualified: z.boolean().default(false),
      players: z.array(z.string()).default([]),
      news: z.array(
        z.object({
          title: z.string(),
          url: z.string(),
          source: z.string(),
          published: z.string(),
        })
      ).default([]),
      social: z.object({
        twitter: z.string().optional(),
        instagram: z.string().optional(),
        officialSite: z.string().optional(),
      }).optional(),
    }),
  }),

  players: defineCollection({
    loader: file('src/content/players/data.json'),
    schema: z.object({
      id: z.string(),
      name: z.string(),
      team: z.string(),
      position: z.string(),
      number: z.number().optional(),
      photo: z.string().optional(),
      nationality: z.string(),
      birth: z.string().optional(),
      social: z.object({
        twitter: z.string().optional(),
        instagram: z.string().optional(),
        tiktok: z.string().optional(),
        facebook: z.string().optional(),
      }).default({}),
      news: z.array(
        z.object({
          title: z.string(),
          url: z.string(),
          source: z.string(),
          published: z.string(),
        })
      ).default([]),
    }),
  }),
};
