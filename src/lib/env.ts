import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  // Prefer server-side key `GEMINI_API_KEY`. `NEXT_PUBLIC_GEMINI_API_KEY` is kept optional
  // for backwards-compatibility but should NOT be used in production (it exposes the key).
  GEMINI_API_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_GEMINI_API_KEY: z.string().min(1).optional(),
  ELASTICSEARCH_URL: z.string().url().optional(),
  // Accept both `ELASTICSEARCH_API_KEY` and `ELASTIC_SEARCH_API_KEY` from Vercel
  ELASTICSEARCH_API_KEY: z.string().min(1).optional(),
  ELASTIC_SEARCH_API_KEY: z.string().min(1).optional(),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  ELASTICSEARCH_URL: process.env.ELASTICSEARCH_URL,
  ELASTICSEARCH_API_KEY: process.env.ELASTICSEARCH_API_KEY ?? process.env.ELASTIC_SEARCH_API_KEY,
  ELASTIC_SEARCH_API_KEY: process.env.ELASTIC_SEARCH_API_KEY,
});
