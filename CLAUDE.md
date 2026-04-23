# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Start dev server (localhost:3000)
npm run build      # Build production bundle to /build
npm test           # Run tests (Jest + React Testing Library)
npm test -- --testPathPattern=<file>  # Run a single test file
npm run emulators  # Start Firebase emulators (imports seed data from /data)
```

The Firebase emulators run Auth on port 9099, Firestore on 8088, Storage on 9199, and Hosting on 5000. When running on localhost, `src/firebase.js` automatically connects to these emulators — no manual configuration needed.

The app requires a `src/config.js` file (not committed) that exports `{ config: { firebase: { ... } } }` with Firebase project credentials.

## Architecture

**Tale** is a React SPA for pet health tracking, deployed on Firebase Hosting.

### State & Auth

Two React context providers wrap the entire app in `src/App.js`:

- `ProvideAuth` (`src/hooks/useAuth.js`) — wraps Firebase Auth. Exposes `{ user, login, logout, signup }` via `useAuth()`. `user` is `null` while loading, `false` when logged out, and a Firebase user object when authenticated.
- `CurrentPetProvider` (`src/hooks/useCurrentPet.js`) — tracks which pet is currently selected across tabs. Exposes `{ currentPet, setCurrentPet }` where `currentPet` is the pet's name string (used as the Firestore document ID).

### Routing

`src/App.js` defines all routes. The main authenticated shell is `HomePage` at `/`, which renders child pages via `<Outlet>`. Child pages receive `currentPet` (the pet name string) via React Router's `useOutletContext()`.

Authenticated routes are wrapped in `<RequireAuth>`, which redirects to `/login` if `useAuth().user` is falsy.

### Firestore Data Model

```
/foods/{foodId}                          # Global food database (shared across all users)
/users/{uid}/pets/{petName}              # Pet profile (name is the doc ID)
/users/{uid}/pets/{petName}/diaries/{YYYY-MM-DD}  # Daily diary entry
/users/{uid}/pets/{petName}/foods/{foodId}        # Pet's favorite foods
/users/{uid}/pets/{petName}/stats/{statId}        # Health measurements (weight, heartRate, breathRate)
```

Firestore rules allow any authenticated user to read/write `/foods/**`, and only the owner to access their `/users/{uid}/**` subtree.

### Data Flow Patterns

- Pages subscribe to Firestore with `onSnapshot` inside `useEffect`, storing results in local state and unsubscribing on cleanup.
- `usePets(uid)` (`src/hooks/usePets.js`) subscribes to the pet collection and exposes `{ pets, currentPet, setCurrentPet, createPet }`. Note: `petCol` is intentionally excluded from the `useEffect` dependency array to avoid an infinite loop (commented in the file).
- Navigation between pages uses React Router's `useLocation().state` to pass context (e.g., `currentPet`, `date`, `from`) rather than URL params.
- The food search flow passes `from: "foods"` or `from: "diary"` in location state to control whether `SearchFoodPage` adds to favorites or creates a diary record.

### Styling

All component styling uses `styled-components`. Global CSS variables for the neutral color palette (`--neutral-50` through `--neutral-900`) are defined in `src/index.css`. The app uses `@geist-ui/core` for UI primitives (Modal, Drawer, Tabs, Avatar, Rating) and `react-feather` for icons.

Responsive breakpoints: mobile-first, with `625px` for tablet/sidebar layout and `1200px` for max-width centering.

### Key Pages

| Page | Route | Purpose |
|------|-------|---------|
| `DiaryPage` | `/` (index) | Daily diary with food records; subscribes to `/diaries/{date}` |
| `FoodPage` | `/foods` | Pet's saved favorite foods, filterable by type |
| `StatsPage` | `/stats` | Line charts for weight/heartRate/breathRate with time range filter |
| `ProfilePage` | `/profile` | User info and pet management |
| `SearchFoodPage` | `/foods/search` | Searches global `/foods` collection; dual-purpose (add favorite or log record) |
| `CreateFoodPage` | `/foods/create` | Adds a new food to the global `/foods` collection |
| `AddFoodRecordPage` | `/foods/records/add` | Logs a food entry into a diary document with merge |

### Firebase Storage

Pet profile photos are uploaded to `{uid}/{petName}/profile` via `src/pages/uploadFile.js`. Storage rules are in `storage.rules`.
