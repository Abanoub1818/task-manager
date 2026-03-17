# Task Manager

A production-grade task management SPA built with **Angular 21**, featuring a Kanban board, analytics dashboard, and team overview. Designed with clean architecture, SOLID principles, and modern Angular patterns (signals, zoneless change detection, standalone components).

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture Decisions](#architecture-decisions)
- [Setup and Installation](#setup-and-installation)
- [Environment Configuration](#environment-configuration)
- [Available Scripts](#available-scripts)
- [Design Patterns and State Management](#design-patterns-and-state-management)
- [Testing Strategy](#testing-strategy)
- [Performance Optimizations](#performance-optimizations)
- [Known Limitations and Future Improvements](#known-limitations-and-future-improvements)

---

## Project Overview

Task Manager provides three main feature areas:

| Feature     | Description                                                              |
| ----------- | ------------------------------------------------------------------------ |
| Dashboard   | Kanban board with drag-and-drop, filters, stat cards, and task CRUD      |
| Analytics   | Priority and status breakdown charts powered by Chart.js                 |
| Team        | Team member directory with role and contact information                  |

The backend is a local **JSON Server** instance (`server.js`) that exposes a REST API with custom routes for tasks and statistics. Data is generated fresh on every `npm run dev` via `generate-data.js` to ensure realistic relative dates.

---

## Architecture Decisions

### Folder Structure

```
src/app/
├── core/                  # Singleton services, models, store, interceptors
│   ├── interceptors/      # HTTP cache interceptor
│   ├── models/            # TypeScript interfaces and types
│   ├── services/          # API services, cache, notification
│   └── store/             # Signal-based stores and facades
├── features/              # Feature modules (dashboard, analytics, team)
│   └── dashboard/
│       ├── components/    # Presentational components scoped to dashboard
│       ├── dashboard.component.ts   # Smart container
│       └── ...
├── layout/                # App shell (header, sidebar)
└── shared/                # Reusable presentational components
    └── components/        # stat-card, task-card, task-form-dialog
```

### Key Decisions

- **Standalone components** — no NgModules, every component declares its own imports
- **Zoneless change detection** — `provideZonelessChangeDetection()` used app-wide; all reactivity driven by signals and computed values, eliminating Zone.js overhead
- **Signal-based state** — `TaskStore` and `StatisticsStore` use Angular signals instead of NgRx or BehaviorSubjects, keeping state management lightweight and co-located
- **Facade pattern** — `TaskFacade` and `StatisticsFacade` sit between components and stores, so components never touch the store or API services directly
- **Smart / Presentational split** — container components (e.g. `DashboardComponent`) own data flow; presentational components (e.g. `TaskCardComponent`, `StatCardComponent`) are pure `input()`/`output()` with no service injection
- **Lazy-loaded routes** — all feature pages use `loadComponent()` so their bundles are only fetched on navigation
- **Signal-based store caching** — once `loadTasks()` / `loadStatistics()` populate the store, components read from signals reactively without triggering new HTTP requests on re-renders or re-navigation

---

## Setup and Installation

### Prerequisites

| Tool    | Version  |
| ------- | -------- |
| Node.js | >= 20.x  |
| npm     | >= 11.x  |
| Angular CLI | >= 21.x |

### Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd task-manager

# 2. Install dependencies
npm install

# 3. Generate fresh mock data (tasks and statistics with relative dates)
npm run generate-data

# 4. Start both the API server and Angular dev server concurrently
npm run dev
```

The app will be available at `http://localhost:4200` and the API at `http://localhost:3000`.

> To start them separately:
> ```bash
> npm run start:api   # JSON Server on :3000
> npm start           # Angular dev server on :4200
> ```

---

## Environment Configuration

Two environment files are provided under `src/environments/`:

| File                    | Used when         | `apiUrl`                  |
| ----------------------- | ----------------- | ------------------------- |
| `environment.ts`        | Development       | `http://localhost:3000`   |
| `environment.prod.ts`   | Production build  | `/api`                    |

To add a new environment variable, add it to both files and reference it via:

```ts
import { environment } from '../../../environments/environment';

environment.apiUrl;
environment.production;
```

Angular CLI automatically swaps the file at build time based on the `--configuration` flag.

---

## Available Scripts

| Command                  | Description                                                        |
| ------------------------ | ------------------------------------------------------------------ |
| `npm run dev`            | Generate data, then start API + Angular dev server concurrently    |
| `npm start`              | Start Angular dev server only (`http://localhost:4200`)            |
| `npm run start:api`      | Start JSON Server only (`http://localhost:3000`)                   |
| `npm run generate-data`  | Regenerate `tasks.json` and `statistics.json` with fresh dates     |
| `npm run build`          | Production build into `dist/`                                      |
| `npm run watch`          | Development build in watch mode                                    |
| `npm test`               | Run unit tests with Vitest                                         |
| `npm run lint`           | Run ESLint across all `.ts` and `.html` files                      |
| `npm run lint:fix`       | Run ESLint with auto-fix                                           |
| `npm run format`         | Format all `src/**/*.{ts,html,scss}` files with Prettier           |

### Git Hooks

Husky is configured with a `pre-commit` hook that runs `lint-staged`, which automatically lints and formats only the staged files before each commit:

- `.ts` files → ESLint fix + Prettier
- `.html` / `.scss` files → Prettier

---

## Design Patterns and State Management

### Signal-Based State (TaskStore / StatisticsStore)

Each store holds a single private `signal<State>()` and exposes read-only `computed()` selectors. Mutations are explicit named methods — no direct state mutation from outside.

```
Component → Facade → Store (signal) → computed selectors → Component template
```

```ts
// Reading state (reactive, no subscription needed)
facade.tasksByStatus()   // computed signal, auto-updates in template

// Mutating state
facade.createTask(data)  // goes through API → store.addTask()
```

### Facade Pattern

`TaskFacade` and `StatisticsFacade` are the only entry points for feature components into the data layer. This means:

- Components are decoupled from both the API services and the stores
- The public API of a facade can change internally without touching any component
- Each facade has a focused responsibility (tasks vs. statistics) following ISP

### Smart / Presentational Pattern

| Type           | Examples                                          | Characteristics                              |
| -------------- | ------------------------------------------------- | -------------------------------------------- |
| Smart          | `DashboardComponent`, `App`                       | Injects facades, handles events, opens dialogs |
| Presentational | `TaskCardComponent`, `StatCardComponent`, `TaskColumnComponent`, `TaskFilterBarComponent` | Only `input()` / `output()`, no service injection |

### SOLID Principles Applied

| Principle | Where                                                                                      |
| --------- | ------------------------------------------------------------------------------------------ |
| **S**     | `TaskApiService` (HTTP only), `TaskStore` (state only), `NotificationService` (toasts only) |
| **O**     | `TaskFilters` interface — new filters extend the interface without changing existing logic  |
| **L**     | No inheritance used — composition via `inject()` throughout                                |
| **I**     | `TaskFacade` and `StatisticsFacade` are separate — consumers only inject what they need    |
| **D**     | All dependencies injected via `inject()`; `TaskCardComponent` emits outputs instead of calling the facade directly |

### Store-Level Caching

`TaskStore` and `StatisticsStore` retain loaded data in signals for the lifetime of the app. Once a facade loads data, subsequent reads come from the in-memory signal — no HTTP request is made. Mutations (`createTask`, `updateTask`, `deleteTask`) update the store directly via `addTask()`, `updateTask()`, `deleteTask()` so the UI stays consistent without a re-fetch.

### Memory Leak Prevention

All `DialogService.onClose` subscriptions (in `DashboardComponent` and `App`) are guarded with `takeUntilDestroyed(destroyRef)` to automatically unsubscribe when the component is destroyed. HTTP observables from `HttpClient` are self-completing and require no manual cleanup.

---

## Testing Strategy

Tests are run with **Vitest** via the Angular CLI test builder.

```bash
npm test
```

### Recommended Testing Approach by Layer

| Layer               | Tool / Approach                                      | What to test                                      |
| ------------------- | ---------------------------------------------------- | ------------------------------------------------- |
| Stores              | Vitest unit tests                                    | State mutations, computed selectors, filter logic |
| Facades             | Vitest + `jasmine.createSpyObj` or `vi.fn()`         | Orchestration logic, error handling, cache invalidation |
| Presentational components | Angular `TestBed` + `@testing-library/angular` | Input rendering, output emissions                 |
| Smart components    | Angular `TestBed` with facade mocks                  | Dialog open/close flow, event delegation          |
| API services        | `HttpClientTestingModule`                            | Request URLs, payloads, error mapping             |

### Example: Testing TaskStore

```ts
import { TestBed } from '@angular/core/testing';
import { TaskStore } from './task.store';

describe('TaskStore', () => {
  let store: TaskStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(TaskStore);
  });

  it('should filter tasks by status', () => {
    store.setTasks([
      { id: '1', status: 'todo', priority: 'high', ... },
      { id: '2', status: 'done', priority: 'low', ... },
    ]);
    store.setFilters({ status: 'todo' });
    expect(store.filteredTasks().length).toBe(1);
  });
});
```

---

## Performance Optimizations

| Technique                        | Where applied                                                                 |
| -------------------------------- | ----------------------------------------------------------------------------- |
| **Zoneless change detection**    | `provideZonelessChangeDetection()` in `app.config.ts` — no Zone.js patching  |
| **Signals + computed()**         | All state reads are fine-grained; only affected views re-render               |
| **Lazy-loaded routes**           | `loadComponent()` in `app.routes.ts` — feature bundles loaded on demand      |
| **Lazy-loaded dialog**           | `TaskFormDialogComponent` is dynamically imported only when the dialog opens  |
| **Store-level caching**          | Signal stores retain loaded data in memory — no redundant HTTP calls on re-renders or route revisits |
| **TrackBy in @for loops**        | All `@for` blocks use `track task.id` / `track stat.id` to minimize DOM diffing |
| **OnPush-equivalent reactivity** | Signal-based components only update when their consumed signals change        |
| **Build budgets**                | `angular.json` enforces 500kB warning / 1MB error on initial bundle size     |

---

## Known Limitations and Future Improvements

### Current Limitations

- **Mock backend** — JSON Server is for development only; it does not persist data across `generate-data` runs and does not support real-time updates
- **No authentication** — the app has no login flow; all users share the same data
- **Static team data** — `TeamComponent` reads from `mock-users.ts`, not from the API
- **No pagination** — all tasks are loaded in a single request; large datasets will degrade performance
- **Statistics are static** — stat card values come from generated JSON and do not reflect actual task counts

### Future Improvements

- Replace JSON Server with a real backend (e.g. NestJS + PostgreSQL) and add WebSocket support for live task updates
- Add authentication with route guards (`canActivate`) and role-based access control
- Implement virtual scrolling (`@angular/cdk/scrolling`) for large task lists
- Connect statistics to live aggregations computed from the task store
- Add end-to-end tests with Playwright covering the full Kanban drag-and-drop flow
- Introduce optimistic updates — apply state changes immediately and roll back on API error
- Add PWA support (`@angular/pwa`) for offline task viewing
