<div align="center">
  <h1>FlashCard Studio 🧠</h1>
  <p><strong>The most professional way to master new vocabulary with spaced repetition.</strong></p>
</div>

<br />

FlashCard Studio is a modern, production-ready SaaS application designed to help users build custom decks, mix categories, and accelerate their learning through a Supabase-powered Spaced Repetition System (SRS).

## 🚀 Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Vanilla CSS (CSS Variables, Flexbox/Grid layouts)
- **Backend/BaaS**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Icons/Emoji**: Emoji Mart (`@emoji-mart/react`)
- **Linting**: ESLint + React Hooks Plugin

## 🏗 Architecture Overview

The codebase follows a strictly **Feature-Driven / Domain-Driven Architecture**, making it highly scalable and easy for onboarding developers to navigate:

```text
src/
├── components/           # Generic, highly reusable UI components
│   ├── layout/           # Global layouts (Navbar, Footer)
│   └── shared/           # Shared components (DeckSelect, ContactDropdown)
├── features/             # Domain-driven feature modules
│   ├── decks/            # Deck creation, editing, and selection logic
│   └── study/            # The core SRS study engine (Flashcard, Results)
├── pages/                # Top-level page views (e.g., Contact page)
├── services/             # External service integrations (Supabase client)
├── hooks/                # Custom React hooks (e.g., useFlashcards)
├── data/                 # Static fallback or mock data
└── utils/                # Helper functions and utilities
```

## ✨ Core Features

- **Spaced Repetition System (SRS)**: Optimize learning efficiency with algorithmic study modes (Easy, Normal, Hard).
- **Custom Deck Creation**: Build, edit, and organize personalized flashcard decks with custom emoji icons.
- **Dynamic Study Sets**: Mix and match multiple default and custom categories into unified practice sessions.
- **Analytics & History**: Track session scores and review past study history via a real-time Supabase dashboard.
- **Premium UX/UI**: Fully responsive design with glassmorphism touches, CSS grid layouts, and animated micro-interactions.

## 🛠 Getting Started

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
   Open `http://localhost:5173` to view it in your browser.

## 📦 Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Bundles the app into static files for production into the `dist/` folder.
- `npm run lint`: Runs ESLint to check for code quality and formatting issues.
- `npm run preview`: Bootstraps a local server to preview the production build.

---
*Built with ❤️ for vocabulary mastery.*
