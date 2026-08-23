// Fichier utilisé par défaut (build de production). En prod, le frontend
// est généralement servi par le même domaine/reverse-proxy que l'API, donc
// une URL relative "/api" suffit — pas besoin de coder en dur un nom de
// domaine ici.
export const environment = {
  production: true,
  apiUrl: '/api',
};
