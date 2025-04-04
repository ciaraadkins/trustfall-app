# Trustfall App

A game exploration of trust and strategy between humans and AI.

## Environment Variables

This application requires the following environment variables to be set in a `.env.local` file in the root directory:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Getting Started

1. Create a `.env.local` file with the required environment variables
2. Install dependencies: `npm install` or `pnpm install`
3. Run the development server: `npm run dev` or `pnpm dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Building for Production

```bash
npm run build
# or
pnpm build
```

Then start the production server:

```bash
npm start
# or
pnpm start
```
