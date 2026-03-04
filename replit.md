# Calculator App — replit.md

## Overview

This is a **React Native / Expo calculator app** built with Expo Router. It provides a polished mobile calculator experience with:

- Standard arithmetic operations (+, −, ×, ÷)
- Calculation history (persisted locally via AsyncStorage)
- Animated, glassmorphism-style UI with light/dark mode support
- A companion Express backend (currently minimal, with placeholder routes)

The app runs on iOS, Android, and Web. It is designed to be deployed on Replit, with environment-aware configuration for dev and production domains.

---

## User Preferences

Preferred communication style: Simple, everyday language.

---

## System Architecture

### Frontend (Expo / React Native)

- **Framework**: Expo SDK ~54 with Expo Router ~6 for file-based navigation
- **Single screen**: `app/index.tsx` is the main calculator screen; `app/_layout.tsx` sets up global providers
- **UI approach**: Glassmorphism aesthetic using `expo-linear-gradient`, `expo-blur`, and custom color tokens in `constants/colors.ts`
- **Animations**: `react-native-reanimated` for button press spring animations and sheet slide transitions
- **Fonts**: Poppins (via `@expo-google-fonts/poppins`), loaded at app startup with splash screen held until ready

### Calculator Logic

- **`lib/calculator.ts`**: Pure functional state machine — all arithmetic logic is isolated from the UI. Takes a `CalcState` and returns a new `CalcState`. No side effects.
- **`lib/history.ts`**: Manages calculation history using `AsyncStorage`. Stores up to 100 entries with expression, result, and timestamp. Fully async.

### Backend (Express)

- **`server/index.ts`**: Express 5 server with CORS configured for Replit domains and localhost
- **`server/routes.ts`**: Placeholder — no API routes implemented yet; ready for extension
- **`server/storage.ts`**: `MemStorage` class implementing an `IStorage` interface for user CRUD. Uses in-memory Map. Can be swapped for a DB-backed implementation.

### Database

- **Drizzle ORM** configured for PostgreSQL (`drizzle.config.ts` points to `DATABASE_URL`)
- **Schema** (`shared/schema.ts`): Single `users` table with `id` (UUID), `username`, and `password`
- **Validation**: `drizzle-zod` generates Zod schemas from Drizzle table definitions
- **Note**: The database/backend is largely scaffolding — the calculator itself uses only local AsyncStorage, not the backend

### State Management

- **Local React state** (`useState`) for calculator state in `app/index.tsx`
- **TanStack React Query** (`QueryClientProvider`) is set up globally for future API calls, but not actively used by the calculator feature
- No global state library (Redux, Zustand, etc.)

### Routing

- Expo Router with file-based routing under `app/`
- Only one real screen: `app/index.tsx` (the calculator)
- `app/+not-found.tsx` handles unmatched routes

### Theming

- `useColorScheme()` drives light/dark mode
- All color tokens defined in `constants/colors.ts` — two palettes (`light`, `dark`)
- Splash screen background: `#1a1040` (dark purple)

---

## External Dependencies

| Dependency | Purpose |
|---|---|
| **Expo SDK ~54** | Core mobile framework (build, native APIs, OTA) |
| **Expo Router ~6** | File-based navigation |
| **React Native Reanimated ~4** | Smooth animations (spring, fade, slide) |
| **expo-linear-gradient** | Gradient backgrounds |
| **expo-blur** | Frosted glass effect on sheets/buttons |
| **expo-haptics** | Tactile feedback on button press |
| **AsyncStorage** | Local persistence for calculation history |
| **TanStack React Query** | API data fetching (scaffolded, not actively used) |
| **Drizzle ORM + drizzle-kit** | PostgreSQL ORM and migration tooling |
| **drizzle-zod** | Auto-generates Zod validators from DB schema |
| **Express 5** | Backend HTTP server |
| **pg** | PostgreSQL client for Node.js |
| **Poppins (Google Fonts)** | App typography |
| **react-native-safe-area-context** | Safe area insets for notch/home-bar avoidance |
| **react-native-gesture-handler** | Touch gesture support |
| **react-native-keyboard-controller** | Keyboard-aware scroll behavior |
| **@expo/vector-icons (Feather)** | Icons (history button, close button, etc.) |

### Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (required by Drizzle config and server)
- `EXPO_PUBLIC_DOMAIN` — Public domain used by the API client to construct backend URLs
- `REPLIT_DEV_DOMAIN` — Injected by Replit for dev; used in CORS config and Metro startup script
- `REPLIT_DOMAINS` — Comma-separated list of production domains; used in CORS allow-list
- `REPLIT_INTERNAL_APP_DOMAIN` — Used by the build script for deployment domain detection