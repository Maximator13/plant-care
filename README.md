# 🌿 Plant Care

**Application en ligne : [plant-care-nine-olive.vercel.app](https://plant-care-nine-olive.vercel.app)**

Suivi d'arrosage pour plantes d'intérieur et d'extérieur, au style provençal (aquarelles, lavande et lin). L'app calcule la prochaine date d'arrosage de chaque plante à partir de son espèce, de la saison et de la météo locale, puis envoie un rappel le matin.

Conçue et développée par Maxime Coquet.

## Fonctionnalités

- **Calcul d'arrosage déterministe** : intervalle de l'espèce × facteur saison × facteur météo (évapotranspiration ET0 d'Open-Meteo). Aucune IA, chaque date est expliquée.
- **Conseils et alertes** par règles : gel, canicule, pluie (≥ 10 mm compte comme un arrosage pour les plantes d'extérieur), retard d'arrosage.
- **Catalogue intégré de 145 plantes** illustrées en aquarelle SVG, recherche étendue via Perenual, saisie manuelle.
- **Reconnaissance par photo** avec Pl@ntNet.
- **Notifications Web Push** envoyées par le site (activables par appareil) et rappel par email.
- **PWA installable** sur iPhone et Android, plantes archivables, historique des arrosages.

## Stack

Next.js 16 (App Router, Server Actions) · TypeScript strict · Tailwind CSS v4 + shadcn/ui · Drizzle ORM + Neon Postgres · Clerk (authentification) · Vercel Workflow + Cron (tâche quotidienne) · Zod · Vitest

## Sécurité

- Accès vérifié sur chaque page et action serveur ; un utilisateur ne voit que ses propres données.
- Content-Security-Policy, HSTS, en-têtes durcis, honeypot anti-spam, quotas quotidiens par utilisateur sur les API gratuites.
- Cron protégé par jeton (comparaison en temps constant), webhook Clerk signé.
- `npm run security:check -- <url>` lance un test d'intrusion boîte noire (26 contrôles).

## Lancer en local

```bash
npm install
cp .env.example .env.local   # puis renseigner les clés
npm run db:migrate
npm run dev
```

Autres scripts : `npm test`, `npm run typecheck`, `npm run build`.

## Données

Météo : [Open-Meteo](https://open-meteo.com) (CC BY 4.0) · Espèces : [Perenual](https://perenual.com) · Reconnaissance : [Pl@ntNet](https://plantnet.org)
