import { z } from 'zod';

// Schéma Zod = la "source de vérité" de ce que doivent contenir les
// variables d'environnement. `@nestjs/config` appelle cette fonction une
// seule fois, au démarrage, avec l'objet `process.env` brut (toutes les
// valeurs sont des strings à ce stade, même les nombres et booléens).
//
// Si une variable manque ou a le mauvais format, `.parse()` lève une
// exception → l'application s'arrête immédiatement au boot avec un message
// clair, plutôt que de démarrer "à moitié" et de planter plus tard au
// premier appel Prisma avec une erreur cryptique.
export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  PORT: z.coerce.number().int().positive().default(3000),

  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL est requis (voir .env.example)')
    .url('DATABASE_URL doit être une URL valide (postgresql://...)'),

  // z.coerce.string() n'existe pas nativement pour les listes : on prend la
  // string brute ici, et c'est main.ts qui fait le .split(',').
  CORS_ORIGIN: z.string().optional(),
});

// Type TypeScript dérivé automatiquement du schéma Zod — jamais désynchronisé
// du schéma puisqu'il est généré à partir de lui.
export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `❌ Variables d'environnement invalides :\n${details}\n\nVérifie ton fichier .env (voir .env.example).`,
    );
  }

  return result.data;
}
