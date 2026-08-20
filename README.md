<div align="center">
  <h1>FlashCard Studio 🧠</h1>
  <p><strong>The most professional way to master new vocabulary with spaced repetition.</strong></p>
</div>

<br />

FlashCard Studio is a modern, production-ready SaaS flashcard application built with React 19 and Supabase. It helps users build custom decks, mix categories, and accelerate learning through a Spaced Repetition System (SRS) — complete with a freemium monetization model, VietQR payment integration, and a polished dark/light theme system.

## Key Features

- **Spaced Repetition System (SRS)**: Algorithmic study modes (Easy, Normal, Hard) that mix system decks at varying difficulty levels for optimized retention.
- **Full Authentication Flow**: Secure login, registration, password recovery, and email-based password reset via Supabase Auth.
- **Freemium / Premium Model**: Basic users get access to system decks and standard study mode. Premium unlocks custom deck creation, practice history, and advanced study sets.
- **VietQR Payment Integration**: In-app checkout modal generates VietQR codes for bank transfers, with simulated payment confirmation via Supabase RPC.
- **Custom Deck Management**: Create, edit, and delete personalized flashcard decks with custom emoji icons (powered by Emoji Mart).
- **Dynamic Study Sets**: Mix and match multiple system decks into randomized practice sessions across three difficulty tiers.
- **Practice History & Analytics**: Track session scores, deck names, and study dates. Premium-gated with paginated load-more/show-less navigation.
- **Dark / Light Theme**: Smooth, transition-animated theme toggle available globally, with a CSS variable-driven design system that adapts every component.
- **Responsive Design**: Fully responsive layouts using CSS Grid and Flexbox, optimized for desktop and mobile viewports.

## Tech Stack

| Layer        | Technology                                           |
|--------------|------------------------------------------------------|
| Framework    | React 19 + Vite 8                                    |
| Styling      | Vanilla CSS (CSS Variables, Grid, Flexbox, Animations)|
| Backend/BaaS | Supabase (PostgreSQL, Auth, Row-Level Security, RPC) |
| Payments     | VietQR Quick Link API + Supabase RPC                 |
| Icons        | Emoji Mart (`@emoji-mart/react`)                     |
| Linting      | ESLint + React Hooks Plugin                          |

## Architecture

The codebase follows a **Feature-Driven Architecture** with clear separation between domain features, shared UI components, business-logic hooks, and external service integrations.

```text
src/
├── App.jsx                       # Root component — routing, state orchestration, layout
├── main.jsx                      # Vite entry point, AuthProvider wrapper
│
├── assets/
│   ├── images/                   # Static image assets
│   └── styles/
│       ├── index.css             # Design tokens (CSS variables), light/dark themes, resets
│       └── App.css               # Global layout grid, shared component styles, animations
│
├── components/
│   ├── layout/
│   │   ├── navbar/               # Top navigation bar with auth state, theme toggle, plan badge
│   │   └── footer/               # Site footer with branding and social links
│   └── shared/
│       ├── authPromptModal/      # Modal prompting unauthenticated users to log in
│       ├── confirmModal/         # Generic reusable confirmation dialog
│       ├── contactDropdown/      # Floating "Get in Touch" contact widget
│       ├── premiumUpsell/        # Upgrade prompt shown when Basic users access Premium features
│       └── protectedRoute/       # Auth guard wrapper for protected views
│
├── features/
│   ├── auth/
│   │   ├── authActions/          # Supabase Auth callback handler (email confirmation, recovery)
│   │   ├── authView/             # Unified auth layout container
│   │   ├── forgotPass/           # Forgot password form
│   │   ├── login/                # Login form
│   │   ├── resetPass/            # Password reset form (from recovery email link)
│   │   ├── signup/               # Registration form
│   │   └── styles/               # Shared auth feature styles
│   ├── decks/
│   │   ├── createDeck/           # Create new custom deck with emoji picker
│   │   ├── deckSelect/           # Deck selection grid (system + custom decks)
│   │   ├── editDeck/             # Edit existing custom deck (add/remove/reorder cards)
│   │   └── studySetsSelect/      # Mixed study set difficulty selector (Easy/Normal/Hard)
│   ├── history/
│   │   └── historyView/          # Paginated study session history list (Premium-only)
│   ├── home/
│   │   └── homeView/             # Main dashboard with deck stats and quick actions
│   ├── payment/
│   │   ├── CheckoutModal.jsx     # VietQR checkout modal with simulated payment flow
│   │   └── CheckoutModal.css
│   ├── pricing/
│   │   ├── PricingView.jsx       # Plan comparison page (Basic vs Premium) with downgrade modal
│   │   └── PricingView.css
│   └── study/
│       ├── answerCheck/          # Answer validation and self-assessment UI
│       ├── flashCard/            # Animated flashcard component with flip interaction
│       ├── resultScreen/         # Session completion screen with score summary
│       └── studySession/         # Core study session orchestrator
│
├── hooks/
│   ├── useAuth.jsx               # Authentication state, session management, plan detection
│   ├── useDecks.js               # Deck fetching, system/user/shadow deck management
│   ├── useFlashCards.js          # Study session state machine (card navigation, scoring, modes)
│   ├── useHistory.js             # History CRUD, pagination, shadow deck creation for RLS compliance
│   └── useTheme.js               # Dark/light theme toggle with localStorage persistence
│
└── services/
    ├── supabase.js               # Supabase client initialization
    └── paymentService.js         # VietQR URL generation, premium upgrade RPC, downgrade, payment history
```

## Data Architecture

### Supabase Tables

| Table      | Purpose                                                                 |
|------------|-------------------------------------------------------------------------|
| `profiles` | User profile data including `plan_type` (basic/premium)                 |
| `decks`    | All flashcard decks — system decks (`is_system: true`) and user-created |
| `cards`    | Individual flashcards belonging to decks                                |
| `history`  | Study session results (score, total, deck reference, study mode)        |
| `payments` | Payment transaction records                                             |

### Shadow Decks

System decks are public and not owned by any user, which conflicts with Supabase Row-Level Security (RLS) policies that require `user_id` ownership for write operations. To solve this, the app automatically creates **Shadow Decks** — hidden, user-owned deck clones (marked with `description: 'HIDDEN_SYSTEM_DECK_TRACKER'`) — so that study history for system decks can be saved while maintaining strict RLS compliance. Shadow decks are filtered from the UI but included when resolving deck names in the History view.

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- A [Supabase](https://supabase.com/) project with the required tables and RPC functions

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/TrgSonVu33/Flash_Card_React_App.git
   cd Flash_Card_React_App
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Scripts

| Command             | Description                                          |
|---------------------|------------------------------------------------------|
| `npm run dev`       | Start Vite development server with HMR               |
| `npm run build`     | Bundle for production into `dist/`                    |
| `npm run preview`   | Preview the production build locally                  |
| `npm run lint`      | Run ESLint for code quality checks                    |

## License

MIT — see [package.json](package.json) for details.
