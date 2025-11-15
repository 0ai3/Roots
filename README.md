This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment variables

Create a `.env.local` file (or `.env` for local-only work) with the following keys so the dashboard features can connect to data and to Google Gemini:

```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster-url/
# optional, defaults to roots-app
MONGODB_DB=<database name>

# used by /api/attractions/plan to contact Gemini
GEMINI_API_KEY=AIza...your key...
# optional override, defaults to gemini-2.5-flash
GEMINI_MODEL=gemini-2.5-flash

# required for /api/recipes/speak to generate audio with ElevenLabs
ELEVENLABS_API_KEY=your-elevenlabs-key
# optional overrides for the selected voice + model
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
ELEVENLABS_MODEL=eleven_turbo_v2

# public token for LiveLocationMap routing (Mapbox Directions API)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your-mapbox-public-token
```

`MONGODB_URI` is required by `app/lib/mongo.ts` whenever user data is fetched (for example, the dashboard view), while `GEMINI_API_KEY` is read inside `app/api/attractions/plan/route.ts` to generate activity suggestions for the attractions planner. `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` is consumed on the client when `LiveLocationMap` fetches directions from Mapbox—use a public token and restart the dev server after editing `.env.local`. Without these values the corresponding features will throw a helpful error so you know what needs to be configured.

### Live location map tips

- The map now stores saved attractions per profile via `POST /api/profile/attractions`, so make sure you are authenticated (the `roots_user` cookie) and MongoDB is reachable.
- Tap anywhere on the map to drop a pin, give it a label, and persist it. Saved entries appear in the "Saved attractions" dropdown and can be routed to again at any time.
- Directions use Mapbox Directions API—if calls fail double-check the `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` value.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
