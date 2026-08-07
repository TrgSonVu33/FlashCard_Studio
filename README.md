# FlashCards App

A vocabulary learning application built with React. Users study English-to-Vietnamese animal flashcards, self-assess their knowledge, and track their scores over time through a history dashboard powered by Supabase.

## Tech Stack

- **Frontend:** React 19, Vite 8
- **Backend / Database:** Supabase (PostgreSQL)
- **Styling:** Vanilla CSS

## Features

- **Interactive Flashcards** — Click to flip between English words and Vietnamese translations.
- **Self-Assessment** — Mark each card as correct or incorrect during a session.
- **Score Summary** — View your final score at the end of each session.
- **History Dashboard** — Browse past session results with paginated history, sorted newest-first.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- A [Supabase](https://supabase.com/) account and project

### Installation

```bash
git clone https://github.com/TrgSonVu33/Flash_Card_React_App.git
cd Flash_Card_React_App
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Table Setup

Create a `history` table with the following columns:

| Column       | Type    | Description              |
|--------------|---------|--------------------------|
| `id`         | int8    | Sequential ID (Primary Key) |
| `created_at` | text    | Date in dd/mm/yyyy format |
| `score`      | int8    | Number of correct answers |
| `total`      | int8    | Total number of cards     |

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Project Structure

```
src/
├── components/
│   ├── AnswerCheck/       # Correct/incorrect selection buttons
│   ├── Flashcard/         # Flip card component
│   └── ResultScreen/      # End-of-session score display
├── App.jsx                # Main application logic
├── App.css                # Application styles
├── supabaseClient.js      # Supabase client configuration
└── main.jsx               # App entry point
```

## Available Scripts

| Command           | Description                  |
|--------------------|------------------------------|
| `npm run dev`      | Start development server     |
| `npm run build`    | Build for production         |
| `npm run preview`  | Preview production build     |
| `npm run lint`     | Run ESLint                   |

## License

This project is for educational purposes.
