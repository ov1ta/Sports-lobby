# 🌐 Private Lobby

Your crew's private knowledge space. Pinterest-style masonry board for sharing notes, PDFs, and links with AI summarization.

## Stack
- **Frontend**: React + Vite PWA
- **Backend**: Supabase (Auth, DB, Storage, Realtime)
- **AI**: Claude API (auto-summarization)
- **Hosting**: Vercel

## Setup Guide

### 1. Supabase Setup
1. Go to [supabase.com](https://supabase.com) → New project
2. Go to **SQL Editor** → paste contents of `supabase-schema.sql` → Run
3. Copy your **Project URL** and **anon key** from Settings → API

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_INVITE_CODE=LOBBY2025         ← change this to your secret code
VITE_ENCRYPTION_KEY=some-long-random-secret
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Deploy to Vercel
```bash
npm install -g vercel
vercel
```
Then add all env vars in Vercel dashboard → Settings → Environment Variables.

### 4. Invite Your Friends
Share the invite code you set in `VITE_INVITE_CODE`. They sign up at your Vercel URL using that code.

## Features
- 📌 Pinterest masonry grid
- 🤖 AI summaries on every upload (Claude)
- 🔐 AES-256 encrypted note content
- 📡 Real-time updates via Supabase
- 📴 Offline mode with IndexedDB cache
- 🔔 Push notifications with unique synth sound
- 👤 Profiles with stats (likes given/received, views)
- 💬 Comments on every note
- 🌙 Dark/Light mode + 6 font options
- 🔍 Search + tag filtering
- ⌨️ Keyboard shortcut ⌘K for search
- ✨ Auto PWA update prompt

## Updating the App
Bump the version in `package.json`. On next visit, users see "New update available!" and can update with one click.
