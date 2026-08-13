<div align="center">
  <h1>FlashCard Studio 🧠</h1>
  <p><strong>The most professional way to master new vocabulary with spaced repetition.</strong></p>
</div>

<br />

FlashCard Studio is a modern, production-ready SaaS application designed to help users build custom decks, mix categories, and accelerate their learning through a Supabase-powered Spaced Repetition System (SRS).

## What's New! (Latest Upgrades)
- **Full Authentication System**: Secure user login, registration, and password recovery via Supabase Auth.
- **Personalized Data Isolation**: User history and custom created decks are now strictly scoped to your individual account.
- **Dark/Light Mode**: Beautifully smooth, transition-animated theme toggling globally available across the app.
- **Enhanced UI/UX**: Re-designed authentication views (`AuthView`, `AuthActions`) featuring dynamic layouts and micro-animations.

## Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Vanilla CSS (CSS Variables, Flexbox/Grid layouts, Smooth transitions)
- **Backend/BaaS**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Icons/Emoji**: Emoji Mart (`@emoji-mart/react`)
- **Linting**: ESLint + React Hooks Plugin

## Architecture Overview

The codebase follows a strictly **Feature-Driven / Domain-Driven Architecture**, making it highly scalable and easy for onboarding developers to navigate:

```text
src/
├── components/           # Generic, highly reusable UI components
│   ├── layout/           # Global layouts (Navbar, Footer)
│   └── shared/           # Shared components (ContactDropdown, ProtectedRoute)
├── features/             # Domain-driven feature modules
│   ├── auth/             # Authentication flow (Login, SignUp, ForgotPass, ResetPass, AuthView)
│   ├── decks/            # Deck selection, creation, editing, and study sets
│   ├── history/          # Study session history and analytics
│   ├── home/             # Main dashboard and navigation entry points
│   └── study/            # The core SRS study engine (Flashcard, Answer Check, Results)
├── hooks/                # Custom React hooks (e.g., useAuth, useFlashCards, useHistory, useTheme, useDecks)
├── services/             # External service integrations (Supabase client)
└── assets/               # Static assets and global styles
```

## Core Features

- **User Accounts & Security**: Fully implemented authentication flow with secure sessions and password recovery.
- **Spaced Repetition System (SRS)**: Optimize learning efficiency with algorithmic study modes (Easy, Normal, Hard).
- **Custom Deck Creation**: Build, edit, and organize personalized flashcard decks with custom emoji icons.
- **Dynamic Study Sets**: Mix and match multiple default and custom categories into unified practice sessions.
- **Analytics & History**: Track session scores and review past study history via a real-time Supabase dashboard.
- **Premium UX/UI**: Fully responsive design with glassmorphism touches, CSS grid layouts, smooth theme transitions, and animated micro-interactions.

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- A [Supabase](https://supabase.com/) project

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/flashcard-studio.git
   cd flashcard-studio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your Supabase credentials (see `.env.example` if available):
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Vite will provide a local address (example `http://localhost:8000`) in your terminal. Open it in your browser.

## Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Bundles the app into static files for production into the `dist/` folder.
- `npm run lint`: Runs ESLint to check for code quality and formatting issues.
- `npm run preview`: Bootstraps a local server to preview the production build.

---
