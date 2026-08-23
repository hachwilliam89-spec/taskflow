// Ce fichier REMPLACE environment.ts uniquement pour la configuration de
// build "development" (voir apps/frontend/project.json → targets.build.
// configurations.development.fileReplacements). C'est le même mécanisme
// que "environment" en Node/Nest, mais résolu par le bundler AU BUILD
// plutôt qu'au runtime : le code final ne contient que la bonne valeur, pas
// un `if (isProd) {...} else {...}`.
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001/api',
};
