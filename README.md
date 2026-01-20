# MindFrame

AI-powered personalized affirmations platform with professional voice synthesis and binaural beats.

**Domain:** mindframe.space

## Features

- AI-generated personalized affirmation text (Claude)
- Professional TTS with ElevenLabs
- Voice cloning option
- Binaural beats mixing (Alpha, Beta, Theta, Delta, Gamma)
- Telegram Web App + PWA
- Multilingual (Russian + English)
- Freemium model with subscriptions

## Tech Stack

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **UI:** shadcn/ui components
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **i18n:** next-intl
- **AI:** Claude Haiku (text), ElevenLabs (TTS), Whisper (STT)
- **Payments:** Telegram Stars, LemonSqueezy

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Setup environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

Required variables:
- `TELEGRAM_BOT_TOKEN` - from @BotFather
- `ANTHROPIC_API_KEY` - from Anthropic Console
- `ELEVENLABS_API_KEY` - from ElevenLabs
- `NEXT_PUBLIC_SUPABASE_URL` - from Supabase project
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - from Supabase project
- `SUPABASE_SERVICE_ROLE_KEY` - from Supabase project

### 3. Setup Supabase

1. Create a new Supabase project
2. Run the migration in `supabase/migrations/001_initial_schema.sql`

### 4. Create Telegram Bot

1. Open @BotFather in Telegram
2. Create a new bot: `/newbot`
3. Copy the token to `TELEGRAM_BOT_TOKEN`

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Setup Telegram Bot (after deployment)

After deploying to Vercel, run:

```bash
npx tsx scripts/setup-telegram-bot.ts
```

This will configure:
- Webhook URL
- Bot commands
- Menu button (Web App)

## Project Structure

```
src/
├── app/
│   ├── [locale]/              # i18n routing (ru/en)
│   │   ├── (marketing)/       # Landing page
│   │   └── (webapp)/          # Web app pages
│   │       ├── generate/      # Affirmation generator
│   │       ├── library/       # Saved tracks
│   │       └── settings/      # User settings
│   └── api/
│       ├── generate/          # Generation API
│       └── webhook/telegram/  # Telegram webhook
├── components/
│   ├── ui/                    # shadcn/ui
│   ├── AudioPlayer.tsx
│   └── BottomNav.tsx
├── hooks/
│   └── useTelegram.ts         # Telegram Web App SDK
├── lib/
│   ├── supabase/
│   ├── elevenlabs.ts
│   ├── llm.ts
│   └── telegram.ts
└── messages/                  # Translations
    ├── ru.json
    └── en.json
```

## Deployment

### Vercel

1. Connect your repository to Vercel
2. Add environment variables
3. Deploy

### After deployment

1. Update `NEXT_PUBLIC_APP_URL` with your domain
2. Run `npx tsx scripts/setup-telegram-bot.ts` to configure the bot

## Pricing Tiers

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | 3 generations, standard voice |
| Basic | $9.99/mo | 30 generations, all scenarios |
| Pro | $19.99/mo | Unlimited, voice clone, priority |

## Scenarios

- **Morning** - energetic affirmations for productive day
- **Evening** - calming affirmations for relaxation and sleep
- **Focus** - concentration and flow state
- **Sport** - motivation for physical training
- **SOS** - emergency anxiety relief (Phase 2)

## License

Private project.
