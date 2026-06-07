# LifeTracker Pro

A full-stack **personal life analytics dashboard** — track expenses, fitness, productivity, and anything else you care about, with interactive charts and **context-aware AI suggestions** powered by Google Gemini.

Built with **Spring Boot 3**, **React 18**, **PostgreSQL**, and **JWT authentication**.

---

## Table of Contents

1. [What This Project Does](#what-this-project-does)
2. [Why These Technologies](#why-these-technologies)
3. [High-Level Architecture](#high-level-architecture)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [Authentication (JWT)](#authentication-jwt)
7. [Tracking Modules](#tracking-modules)
8. [Custom Module Builder](#custom-module-builder)
9. [Gemini AI Integration](#gemini-ai-integration)
10. [Frontend Architecture](#frontend-architecture)
11. [API Reference](#api-reference)
12. [How to Run](#how-to-run)
13. [Docker Deployment](#docker-deployment)
14. [Design Decisions & Trade-offs](#design-decisions--trade-offs)
15. [CV / Resume Description](#cv--resume-description)

---

## What This Project Does

LifeTracker Pro is a **single-user personal dashboard** where you log different aspects of your life and see them visualized in one place.


| Module             | What you track            | Key features                                                      |
| ------------------ | ------------------------- | ----------------------------------------------------------------- |
| **Expenses**       | Daily spending            | Categories, monthly totals, pie chart by category                 |
| **DSA**            | Coding problems solved    | Platform, difficulty, topic, heatmap, bar/doughnut charts         |
| **Content**        | Content creation pipeline | Kanban-style status (IDEA → PUBLISHED), platform breakdown        |
| **Gym**            | Workouts                  | Sets, reps, weight, muscle groups, personal records               |
| **Food**           | Meals & nutrition         | Calories, meal type, home-cooked vs restaurant                    |
| **Cafés**          | Places visited            | WiFi/coffee/ambience ratings, work-friendly & wishlist filters    |
| **Custom Modules** | Anything you define       | User-built schemas with auto-generated dashboards                 |
| **Dashboard**      | Everything at once        | 8 stat cards + cross-module charts + AI life coach                |
| **AI Tips**        | Every module              | Gemini-powered, context-aware suggestions based on your real data |


Every module page has a floating **AI Tips** button that sends your current data to Gemini and returns 3 actionable suggestions.

---

## Why These Technologies

### Backend: Spring Boot 3 + Java 17


| Choice                    | Why                                                                                       |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| **Spring Boot**           | Industry-standard for REST APIs; batteries-included (security, JPA, validation)           |
| **Spring Security + JWT** | Stateless auth — no server-side sessions; scales well; standard for SPAs                  |
| **Spring Data JPA**       | Maps Java entities to PostgreSQL tables; reduces boilerplate CRUD                         |
| **Flyway**                | Version-controlled SQL migrations — schema changes are tracked in git, not auto-generated |
| **Lombok**                | Cuts boilerplate (`@Builder`, `@RequiredArgsConstructor`) on entities and services        |


### Frontend: React 18 (Create React App)


| Choice                         | Why                                                                                |
| ------------------------------ | ---------------------------------------------------------------------------------- |
| **React**                      | Component-based UI; large ecosystem; good for dashboard-style apps                 |
| **React Router v6**            | Client-side routing with protected routes                                          |
| **Axios**                      | HTTP client with interceptors for attaching JWT to every request                   |
| **Chart.js + react-chartjs-2** | Lightweight, flexible charts (pie, bar, doughnut, line) without a heavy UI library |
| **Plain CSS**                  | No Tailwind/MUI dependency — full control over the purple/dark-navy design system  |


### Database: PostgreSQL 16


| Choice         | Why                                                                                                                               |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **PostgreSQL** | Reliable relational DB; `NUMERIC` for money; `CHECK` constraints for ratings; strong JSON support (used for custom module fields) |
| **Indexes**    | Added on `(user_id, date)` columns for fast per-user date-range queries                                                           |


### AI: Google Gemini (gemini-1.5-flash-8b)


| Choice                    | Why                                                                          |
| ------------------------- | ---------------------------------------------------------------------------- |
| **Gemini Flash 8B**       | Fast, free-tier friendly model from Google AI Studio                         |
| **Server-side proxy**     | API key stays on the backend; frontend never talks to Gemini directly        |
| **Page-specific prompts** | Each module gets a tailored "persona" (finance advisor, fitness coach, etc.) |


### DevOps: Docker Compose


| Choice                 | Why                                                                  |
| ---------------------- | -------------------------------------------------------------------- |
| **Docker Compose**     | One command spins up Postgres + backend + frontend                   |
| **Multi-stage builds** | Backend JAR and frontend static files each have their own Dockerfile |


---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Browser (localhost:3000)                     │
│  React SPA ── AuthContext ── Axios (JWT interceptor) ── Pages   │
│                              │                                   │
│                    AiBot FAB (every page)                        │
└──────────────────────────────┼──────────────────────────────────┘
                               │ HTTP + Bearer JWT
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Spring Boot API (localhost:8080)                │
│                                                                  │
│  JwtAuthFilter → SecurityConfig → Controllers → Services        │
│                                                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐ │
│  │  Auth   │ │ Expense │ │   DSA   │ │  Gym    │ │  Custom  │ │
│  │  JWT    │ │ Content │ │  Food   │ │  Cafe   │ │  Modules │ │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └──────────┘ │
│                              │                                   │
│                    AiService (RestTemplate)                      │
└──────────────────────────────┼──────────────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
     ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
     │  PostgreSQL  │  │ Flyway       │  │ Google Gemini    │
     │  (port 5432) │  │ Migrations   │  │ API (external)   │
     └──────────────┘  └──────────────┘  └──────────────────┘
```

### Request flow (example: log an expense)

```
1. User fills form on /expenses page
2. React calls POST /api/expenses with { amount, category, note, spentOn }
3. Axios interceptor attaches Authorization: Bearer <jwt>
4. JwtAuthFilter validates token → sets SecurityContext (user email)
5. ExpenseController receives request → ExpenseService.create()
6. Service looks up User by email, builds Expense entity, saves to DB
7. Frontend re-fetches GET /api/expenses and GET /api/expenses/summary
8. Pie chart re-renders with updated category breakdown
```

### Backend architecture pattern: Vertical Slices

Each feature is a self-contained package:

```
com.lifetracker.expense/
├── Expense.java          # JPA entity
├── ExpenseController.java
├── ExpenseService.java
├── ExpenseRepository.java
└── dto/ExpenseRequest.java
```

Same pattern for `dsa`, `content`, `cafe`, `food`, `gym`, `custom`, `ai`, `auth`, `dashboard`.

---

## Project Structure

```
LifeTrackerPro/
├── docker-compose.yml              # Postgres + backend + frontend
├── README.md                       # This file
│
├── lifetracker-backend/
│   ├── pom.xml                     # Maven dependencies
│   ├── Dockerfile
│   └── src/main/
│       ├── java/com/lifetracker/
│       │   ├── LifeTrackerApplication.java
│       │   ├── auth/               # JWT register/login, filter, JwtUtil
│       │   ├── config/             # SecurityConfig, AppConfig (RestTemplate bean)
│       │   ├── model/              # User entity (implements UserDetails)
│       │   ├── dashboard/          # Aggregated summary endpoint
│       │   ├── expense/            # Expense tracking
│       │   ├── dsa/                # DSA problem tracker
│       │   ├── content/            # Content pipeline
│       │   ├── cafe/               # Café explorer
│       │   ├── food/               # Food logging
│       │   ├── gym/                # Gym sessions
│       │   ├── custom/             # Custom module builder
│       │   └── ai/                 # Gemini AI suggestions
│       └── resources/
│           ├── application.yml
│           └── db/migration/
│               ├── V1__init.sql    # Core tables
│               └── V2__custom_modules.sql
│
└── lifetracker-frontend/
    ├── package.json
    ├── Dockerfile
    └── src/
        ├── index.js                  # React entry point
        ├── App.js                    # Router + auth gate
        ├── api/axios.js              # Axios + JWT interceptors
        ├── context/AuthContext.js    # Login/register/logout state
        ├── components/
        │   ├── Sidebar.js            # Left navigation
        │   ├── StatCard.js           # Dashboard metric cards
        │   └── AiBot.js              # Floating AI tips widget
        └── pages/
            ├── Login.js
            ├── Dashboard.js
            ├── Expenses.js, DSA.js, Content.js
            ├── Cafes.js, Food.js, Gym.js
            ├── CustomModules.js      # Module builder
            └── CustomModuleView.js   # Dynamic module dashboard
```

---

## Database Schema

Schema is managed by **Flyway** (not Hibernate auto-DDL). Hibernate runs with `ddl-auto: validate` — it checks entities match the DB but never modifies tables.

### Entity Relationship Diagram

```
users (1) ──────< (many) expenses
  │
  ├──────< (many) dsa_problems
  ├──────< (many) content_items
  ├──────< (many) cafes
  ├──────< (many) food_logs
  ├──────< (many) gym_sessions
  └──────< (many) custom_modules ──────< (many) custom_entries
                                              (ON DELETE CASCADE)
```

### Table: `users`


| Column       | Type                | Notes                                |
| ------------ | ------------------- | ------------------------------------ |
| `id`         | BIGSERIAL PK        | Auto-increment                       |
| `name`       | VARCHAR(100)        | Display name                         |
| `email`      | VARCHAR(150) UNIQUE | Used as JWT subject / login username |
| `password`   | VARCHAR(255)        | BCrypt-hashed                        |
| `created_at` | TIMESTAMP           | Default NOW()                        |


### Table: `expenses`


| Column       | Type              | Notes                           |
| ------------ | ----------------- | ------------------------------- |
| `id`         | BIGSERIAL PK      |                                 |
| `user_id`    | BIGINT FK → users | Owner                           |
| `amount`     | NUMERIC(10,2)     | Money amount                    |
| `category`   | VARCHAR(50)       | Food, Transport, Shopping, etc. |
| `note`       | VARCHAR(255)      | Optional description            |
| `spent_on`   | DATE              | When the expense occurred       |
| `created_at` | TIMESTAMP         |                                 |


**Index:** `idx_expenses_user_date (user_id, spent_on)`

### Table: `dsa_problems`


| Column       | Type              | Notes                                 |
| ------------ | ----------------- | ------------------------------------- |
| `id`         | BIGSERIAL PK      |                                       |
| `user_id`    | BIGINT FK → users |                                       |
| `title`      | VARCHAR(200)      | Problem name                          |
| `platform`   | VARCHAR(50)       | LeetCode, GFG, Codeforces, HackerRank |
| `difficulty` | VARCHAR(20)       | Easy, Medium, Hard                    |
| `topic`      | VARCHAR(80)       | Arrays, DP, Graphs, Trees, etc.       |
| `time_taken` | INT               | Minutes to solve                      |
| `notes`      | TEXT              | Optional                              |
| `solved_on`  | DATE              |                                       |


**Index:** `idx_dsa_user_date (user_id, solved_on)`

### Table: `content_items`


| Column           | Type              | Notes                                       |
| ---------------- | ----------------- | ------------------------------------------- |
| `id`             | BIGSERIAL PK      |                                             |
| `user_id`        | BIGINT FK → users |                                             |
| `title`          | VARCHAR(200)      |                                             |
| `platform`       | VARCHAR(50)       | YouTube, Blog, LinkedIn, Twitter, Instagram |
| `status`         | VARCHAR(30)       | IDEA → DRAFTING → REVIEW → PUBLISHED        |
| `tags`           | VARCHAR(200)      | Comma-separated                             |
| `published_date` | DATE              |                                             |
| `view_count`     | INT               | Default 0                                   |


**Index:** `idx_content_user_status (user_id, status)`

### Table: `cafes`


| Column            | Type              | Notes                |
| ----------------- | ----------------- | -------------------- |
| `id`              | BIGSERIAL PK      |                      |
| `user_id`         | BIGINT FK → users |                      |
| `name`            | VARCHAR(150)      |                      |
| `location`        | VARCHAR(200)      | Address/area         |
| `city`            | VARCHAR(100)      |                      |
| `wifi_rating`     | INT (1–5)         | CHECK constraint     |
| `coffee_rating`   | INT (1–5)         | CHECK constraint     |
| `ambience_rating` | INT (1–5)         | CHECK constraint     |
| `work_friendly`   | BOOLEAN           | Good for laptop work |
| `wishlist`        | BOOLEAN           | Want to visit        |
| `notes`           | TEXT              |                      |
| `visited_on`      | DATE              |                      |


### Table: `food_logs`


| Column        | Type              | Notes                           |
| ------------- | ----------------- | ------------------------------- |
| `id`          | BIGSERIAL PK      |                                 |
| `user_id`     | BIGINT FK → users |                                 |
| `meal`        | VARCHAR(200)      | What you ate                    |
| `meal_type`   | VARCHAR(30)       | Breakfast, Lunch, Dinner, Snack |
| `calories`    | INT               | Optional                        |
| `restaurant`  | VARCHAR(150)      |                                 |
| `home_cooked` | BOOLEAN           |                                 |
| `cuisine`     | VARCHAR(80)       | Indian, Italian, etc.           |
| `rating`      | INT (1–5)         |                                 |
| `logged_on`   | DATE              |                                 |


**Index:** `idx_food_user_date (user_id, logged_on)`

### Table: `gym_sessions`


| Column          | Type              | Notes                     |
| --------------- | ----------------- | ------------------------- |
| `id`            | BIGSERIAL PK      |                           |
| `user_id`       | BIGINT FK → users |                           |
| `exercise`      | VARCHAR(150)      | Bench Press, Squats, etc. |
| `muscle_group`  | VARCHAR(80)       | Chest, Back, Legs, etc.   |
| `sets`          | INT               |                           |
| `reps`          | INT               |                           |
| `weight_kg`     | NUMERIC(6,2)      |                           |
| `duration_min`  | INT               | For cardio                |
| `notes`         | TEXT              |                           |
| `worked_out_on` | DATE              |                           |


**Index:** `idx_gym_user_date (user_id, worked_out_on)`

### Table: `custom_modules`


| Column        | Type              | Notes                                           |
| ------------- | ----------------- | ----------------------------------------------- |
| `id`          | BIGSERIAL PK      |                                                 |
| `user_id`     | BIGINT FK → users |                                                 |
| `name`        | VARCHAR(100)      | e.g. "Sleep Tracker"                            |
| `icon`        | VARCHAR(10)       | Emoji, default 📋                               |
| `description` | VARCHAR(255)      |                                                 |
| `fields`      | TEXT              | **JSON array** of field definitions (see below) |
| `created_at`  | TIMESTAMP         |                                                 |


### Table: `custom_entries`


| Column       | Type                       | Notes                           |
| ------------ | -------------------------- | ------------------------------- |
| `id`         | BIGSERIAL PK               |                                 |
| `module_id`  | BIGINT FK → custom_modules | ON DELETE CASCADE               |
| `user_id`    | BIGINT FK → users          |                                 |
| `data`       | TEXT                       | **JSON object** of field values |
| `logged_on`  | DATE                       |                                 |
| `created_at` | TIMESTAMP                  |                                 |


**Index:** `idx_custom_entries_module (module_id, logged_on DESC)`

### Custom Module JSON Format

**Field definitions** (stored in `custom_modules.fields`):

```json
[
  {
    "name": "hours_slept",
    "label": "Hours Slept",
    "type": "number",
    "required": true
  },
  {
    "name": "quality",
    "label": "Sleep Quality",
    "type": "dropdown",
    "options": ["Poor", "Fair", "Good", "Great"],
    "required": false
  }
]
```

Supported field types: `text`, `number`, `date`, `dropdown`, `boolean`

**Entry data** (stored in `custom_entries.data`):

```json
{
  "hours_slept": 7.5,
  "quality": "Good"
}
```

---

## Authentication (JWT)

### How it works end-to-end

```
┌──────────┐    POST /api/auth/register     ┌──────────┐
│  React   │ ──────────────────────────────> │  Spring  │
│  Login   │    { name, email, password }    │   Boot   │
│  Page    │ <────────────────────────────── │          │
└──────────┘    { token, name }              └──────────┘
     │                                              │
     │  localStorage.setItem('lt_token', token)     │
     │  localStorage.setItem('lt_user', {...})      │
     ▼                                              │
┌──────────┐    GET /api/expenses                  │
│  Axios   │    Authorization: Bearer <token>  ────>│
│          │ <─────────────────────────────────────│
└──────────┘    [expense data]                     │
                                                   │
                              JwtAuthFilter:        │
                              1. Extract Bearer token
                              2. Parse email from JWT (HS256)
                              3. Load UserDetails from DB
                              4. Validate token not expired
                              5. Set SecurityContext
```

### Key files


| File                                  | Role                                                    |
| ------------------------------------- | ------------------------------------------------------- |
| `auth/AuthController.java`            | `POST /api/auth/register`, `POST /api/auth/login`       |
| `auth/AuthService.java`               | BCrypt password encoding, JWT generation                |
| `auth/JwtUtil.java`                   | Create/parse/validate JWT tokens (JJWT library, HS256)  |
| `auth/JwtAuthFilter.java`             | Servlet filter — runs on every request                  |
| `config/SecurityConfig.java`          | Permit `/api/auth/**`, require auth for everything else |
| `frontend/src/context/AuthContext.js` | React context for login state                           |
| `frontend/src/api/axios.js`           | Attaches JWT; redirects to `/login` on 401              |


### Security details

- **Passwords:** BCrypt-hashed before storage (never stored in plain text)
- **JWT subject:** User's email address
- **JWT expiry:** 24 hours (configurable via `app.jwt.expiration-ms`)
- **Sessions:** Stateless — no server-side session storage
- **Authorization:** Each service checks `resource.user.email == authenticatedEmail` before delete/update
- **No roles:** All authenticated users have the same permissions (single-user personal app)

---

## Tracking Modules

### Expenses (`/expenses`)

- **Log:** amount, category (Food/Transport/Shopping/Entertainment/Health/Other), note, date
- **View:** Pie chart by category, recent expenses table
- **Summary API:** `GET /api/expenses/summary?from=&to=` — total + per-category breakdown
- **AI persona:** Personal finance advisor

### DSA — Productivity (`/dsa`)

- **Log:** title, platform, difficulty, topic, time taken, date solved
- **Stats API:** Total solved, breakdown by topic & difficulty, 90-day heatmap
- **Charts:** Bar (by topic), Doughnut (by difficulty, color-coded Easy/Medium/Hard)
- **AI persona:** Competitive programming coach

### Content — Productivity (`/content`)

- **Log:** title, platform, status, tags
- **Pipeline:** IDEA → DRAFTING → REVIEW → PUBLISHED (inline status dropdown per row)
- **Kanban mini-view** + status filter buttons
- **Stats API:** Count by platform and status
- **AI persona:** Content strategy expert

### Gym — Fitness (`/gym`)

- **Log:** exercise, muscle group, sets, reps, weight (kg), duration, notes, date
- **Stats API:** Personal records (max weight per exercise), muscle group counts, 30-day frequency
- **Charts:** Bar chart of muscle group distribution
- **AI persona:** Fitness coach

### Food (`/food`)

- **Log:** meal name, type (Breakfast/Lunch/Dinner/Snack), calories, restaurant, home-cooked flag, cuisine, rating
- **Computed:** Total calories today (client-side)
- **AI persona:** Nutritionist

### Cafés (`/cafes`)

- **Log:** name, location, city, WiFi/coffee/ambience ratings (1–5 stars), work-friendly, wishlist
- **Filters:** ALL / WORK-FRIENDLY / WISHLIST
- **Layout:** Card grid (not table) with star ratings
- **AI persona:** Productivity/lifestyle advisor

### Dashboard (`/`)

The central hub fetches **8 API endpoints in parallel** via `Promise.all`:

1. `/api/dashboard/summary` — monthly expenses, DSA totals, published content, gym sessions
2. `/api/expenses/summary` — category pie chart
3. `/api/dsa/stats` — topic bar + difficulty doughnut
4. `/api/gym/stats` — muscle group bar chart
5. `/api/content/stats` — platform pie + status bar
6. `/api/food` — calories today, meal type breakdown
7. `/api/cafes` — visited count, work-friendly count
8. `/api/custom/modules` — custom module cards

Renders 8 `StatCard` components + 4 chart sections + custom module quick-links.

---

## Custom Module Builder

The most unique feature — lets users define their own tracking modules without writing code.

### How it works

```
┌─────────────────────────────────────────────────────────────┐
│  CustomModules.js (Builder)                                  │
│                                                              │
│  1. User names module + picks emoji icon                     │
│  2. Adds fields: text, number, date, dropdown, boolean       │
│  3. Field names auto-generated from labels                   │
│  4. POST /api/custom/modules with fields as JSON string      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  CustomModuleView.js (Auto-generated Dashboard)              │
│                                                              │
│  1. Fetches module definition + entries                      │
│  2. Renders dynamic form from field definitions              │
│  3. Auto-analytics based on field types:                     │
│     • number  → bar chart + avg/max/min stats                │
│     • dropdown → doughnut distribution                       │
│     • boolean → yes/no doughnut + percentage                 │
│  4. Entry trend line chart (last 14 days)                    │
│  5. Summary cards: total entries, last logged, days tracked  │
└─────────────────────────────────────────────────────────────┘
```

### Why JSON in TEXT columns?

Instead of creating a new database table per custom module, field definitions and entry data are stored as JSON strings. This gives maximum flexibility — any field type, any number of fields — without schema migrations. The trade-off is you can't SQL-query individual custom fields efficiently, but for a personal tracker with moderate data volume, this is fine.

### Field type → chart mapping


| Field Type     | Auto-generated visualization               |
| -------------- | ------------------------------------------ |
| `number`       | Bar chart + average, max, min stat cards   |
| `dropdown`     | Doughnut chart showing option distribution |
| `boolean`      | Yes/No doughnut + percentage               |
| `text`, `date` | Shown in entries table only                |


Plus a **14-day entry trend line chart** for all modules regardless of field types.

---

## Gemini AI Integration

### Architecture

```
┌──────────────┐         ┌──────────────┐         ┌──────────────────┐
│  AiBot.js    │  POST   │ AiController │  call   │   AiService      │
│  (React FAB) │ ──────> │ /api/ai/     │ ──────> │  (RestTemplate)  │
│              │         │   suggest    │         │                  │
│  pageType +  │         │              │         │  Build prompt +  │
│  dataContext │ <────── │  {suggest-   │ <────── │  POST to Gemini  │
│              │         │   ions}      │         │  Parse response  │
└──────────────┘         └──────────────┘         └────────┬─────────┘
                                                           │
                                                           ▼
                                                  ┌──────────────────┐
                                                  │ Google Gemini    │
                                                  │ gemini-1.5-      │
                                                  │ flash-8b         │
                                                  │ (external API)   │
                                                  └──────────────────┘
```

### Step-by-step flow

1. **User clicks the AI Tips FAB** on any module page
2. **Frontend (`AiBot.js`)** calls the `getData()` callback provided by the parent page — this returns a JSON object with the current page's stats (e.g., expense summary, DSA stats, recent meals)
3. **Frontend sends** `POST /api/ai/suggest` with:
  ```json
   {
     "pageType": "expenses",
     "dataContext": "{\"summary\":{\"total\":5000,\"categories\":{...}},\"recentCount\":8}"
   }
  ```
4. **Backend (`AiService.java`)** looks up a page-specific system prompt from `PAGE_PROMPTS` map, appends the `dataContext`, and builds a Gemini API request:
  ```json
   {
     "contents": [{
       "parts": [{ "text": "You are a personal finance advisor... Data: {...}" }]
     }]
   }
  ```
5. **RestTemplate POST** to `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=<API_KEY>`
6. **Response parsing:** Extracts `candidates[0].content.parts[0].text` from Gemini's JSON response
7. **Returns** `{ "suggestions": "1. Try meal prepping...\n2. Cancel unused subscriptions...\n3. Set a weekly budget..." }`
8. **Frontend** formats numbered lines with ✦ bullets and displays in a slide-up panel

### Page-specific AI personas


| `pageType`  | Persona                       | What it analyzes                                 |
| ----------- | ----------------------------- | ------------------------------------------------ |
| `expenses`  | Personal finance advisor      | Spending patterns, category breakdown            |
| `dsa`       | Competitive programming coach | Topics solved, difficulty distribution, streaks  |
| `gym`       | Fitness coach                 | Muscle group balance, frequency, progression     |
| `content`   | Content strategy expert       | Pipeline backlog, publishing consistency         |
| `food`      | Nutritionist                  | Meal timing, calorie patterns, home-cooked ratio |
| `cafe`      | Productivity advisor          | Rating patterns, work-friendly spots             |
| `dashboard` | Life coach                    | Holistic cross-module summary                    |


Each prompt instructs Gemini to return **exactly 3 short, specific, actionable tips**.

### Configuration

In `application.yml`:

```yaml
gemini:
  api-key: "YOUR_GEMINI_API_KEY"
```

Get a free API key at [Google AI Studio](https://aistudio.google.com/).

> **Security note:** In production, use an environment variable (`GEMINI_API_KEY`) instead of hardcoding the key in `application.yml`.

### Why server-side proxy (not direct frontend → Gemini)?

1. **API key security** — the key never reaches the browser
2. **Authentication** — only logged-in users can request AI suggestions
3. **Prompt control** — backend owns the prompt templates; frontend can't inject arbitrary prompts
4. **Rate limiting potential** — can add throttling at the API layer later

### Error handling

- If Gemini API fails, `AiService` returns: `"Unable to get AI suggestions right now. Error: <message>"`
- Frontend shows a fallback message if the request itself fails
- No retry logic — user can click "Refresh suggestions" to try again

---

## Frontend Architecture

### Routing (`App.js`)


| Path          | Component          | Auth required                      |
| ------------- | ------------------ | ---------------------------------- |
| `/login`      | `Login`            | No (redirects to `/` if logged in) |
| `/`           | `Dashboard`        | Yes                                |
| `/expenses`   | `Expenses`         | Yes                                |
| `/dsa`        | `DSA`              | Yes                                |
| `/content`    | `Content`          | Yes                                |
| `/cafes`      | `Cafes`            | Yes                                |
| `/food`       | `Food`             | Yes                                |
| `/gym`        | `Gym`              | Yes                                |
| `/custom`     | `CustomModules`    | Yes                                |
| `/custom/:id` | `CustomModuleView` | Yes                                |


Auth gate: if `user` is null → redirect to `/login`. All authenticated routes render inside `PrivateLayout` (Sidebar + main content area).

### State management


| Layer           | What                        | How                                    |
| --------------- | --------------------------- | -------------------------------------- |
| **Global**      | Auth (user, login, logout)  | React Context (`AuthContext`)          |
| **Per-page**    | Module data, forms, loading | `useState` + `useEffect`               |
| **Persistence** | JWT token + user name       | `localStorage` (`lt_token`, `lt_user`) |


No Redux, Zustand, or React Query — intentionally simple. Each page fetches its own data on mount.

### Data fetching pattern (every page)

```javascript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

const fetchAll = async () => {
  const res = await api.get('/expenses');
  setData(res.data);
  setLoading(false);
};

useEffect(() => { fetchAll(); }, []);

// After create/delete, call fetchAll() again to refresh
```

### Styling

- **Plain CSS files** — no CSS modules, no Tailwind, no UI library
- **Design tokens:** Primary `#6c63ff` (purple), background `#f4f5fb`, sidebar `#1a1a2e` (dark navy)
- **Cards:** White, `border-radius: 14px`, subtle box-shadow
- **Charts:** Chart.js with a shared `CHART_COLORS` palette
- **Layout:** Fixed 220px sidebar + scrollable main content

---

## API Reference

**Base URL:** `http://localhost:8080/api`
**Auth:** All endpoints except `/api/auth/`** require `Authorization: Bearer <JWT>`

### Auth


| Method | Endpoint         | Body                        | Response          |
| ------ | ---------------- | --------------------------- | ----------------- |
| POST   | `/auth/register` | `{ name, email, password }` | `{ token, name }` |
| POST   | `/auth/login`    | `{ email, password }`       | `{ token, name }` |


### Dashboard


| Method | Endpoint             | Response                                                                                             |
| ------ | -------------------- | ---------------------------------------------------------------------------------------------------- |
| GET    | `/dashboard/summary` | `{ userName, monthlyExpenses, totalDsaSolved, dsaThisWeek, publishedContent, gymSessionsThisMonth }` |


### Expenses


| Method | Endpoint                      | Notes                      |
| ------ | ----------------------------- | -------------------------- |
| POST   | `/expenses`                   | Create                     |
| GET    | `/expenses`                   | List all for user          |
| DELETE | `/expenses/{id}`              | Delete (ownership check)   |
| GET    | `/expenses/summary?from=&to=` | Category breakdown + total |


### DSA


| Method | Endpoint     | Notes                                       |
| ------ | ------------ | ------------------------------------------- |
| POST   | `/dsa`       | Log solved problem                          |
| GET    | `/dsa`       | List all                                    |
| DELETE | `/dsa/{id}`  | Delete                                      |
| GET    | `/dsa/stats` | `{ total, byTopic, byDifficulty, heatmap }` |


### Content


| Method | Endpoint                       | Notes                                 |
| ------ | ------------------------------ | ------------------------------------- |
| POST   | `/content`                     | Create                                |
| GET    | `/content`                     | List all                              |
| PATCH  | `/content/{id}/status?status=` | Update pipeline status                |
| DELETE | `/content/{id}`                | Delete                                |
| GET    | `/content/stats`               | `{ byPlatform, byStatus, published }` |


### Cafés


| Method | Endpoint               | Notes                              |
| ------ | ---------------------- | ---------------------------------- |
| POST   | `/cafes`               | Add café                           |
| GET    | `/cafes`               | List all                           |
| GET    | `/cafes/work-friendly` | Filtered + sorted by coffee rating |
| GET    | `/cafes/wishlist`      | Wishlist items                     |
| DELETE | `/cafes/{id}`          | Delete                             |


### Food


| Method | Endpoint     | Notes    |
| ------ | ------------ | -------- |
| POST   | `/food`      | Log meal |
| GET    | `/food`      | List all |
| DELETE | `/food/{id}` | Delete   |


### Gym


| Method | Endpoint     | Notes                                                |
| ------ | ------------ | ---------------------------------------------------- |
| POST   | `/gym`       | Log workout                                          |
| GET    | `/gym`       | List all                                             |
| DELETE | `/gym/{id}`  | Delete                                               |
| GET    | `/gym/stats` | `{ personalRecords, muscleGroups, recentFrequency }` |


### Custom Modules


| Method | Endpoint                             | Notes                                     |
| ------ | ------------------------------------ | ----------------------------------------- |
| POST   | `/custom/modules`                    | Create module with JSON field definitions |
| GET    | `/custom/modules`                    | List user's modules                       |
| DELETE | `/custom/modules/{id}`               | Delete module + cascade entries           |
| GET    | `/custom/modules/{id}/summary`       | Module metadata + entry count             |
| POST   | `/custom/entries`                    | Add entry to module                       |
| GET    | `/custom/modules/{moduleId}/entries` | List entries                              |
| DELETE | `/custom/entries/{id}`               | Delete entry                              |


### AI


| Method | Endpoint      | Body                        | Response          |
| ------ | ------------- | --------------------------- | ----------------- |
| POST   | `/ai/suggest` | `{ pageType, dataContext }` | `{ suggestions }` |


---

## How to Run

### Prerequisites

- Java 17+
- Node.js 18+
- Maven 3.8+
- Docker (for PostgreSQL)

### 1. Start the database

```bash
docker compose up postgres -d
```

### 2. Configure Gemini API key

Edit `lifetracker-backend/src/main/resources/application.yml`:

```yaml
gemini:
  api-key: "YOUR_KEY_FROM_aistudio.google.com"
```

### 3. Run the backend

```bash
cd lifetracker-backend
mvn spring-boot:run
# API at http://localhost:8080
# Flyway auto-runs migrations on startup
```

### 4. Run the frontend

```bash
cd lifetracker-frontend
npm install
npm start
# App at http://localhost:3000
```

### 5. Register and use

1. Open `http://localhost:3000`
2. Click "Register" tab, create an account
3. You'll be redirected to the Dashboard
4. Use the sidebar to navigate between modules
5. Click the AI Tips button (bottom-right) on any page for Gemini suggestions

---

## Docker Deployment

Run everything with one command:

```bash
docker compose up --build
```


| Service    | Port              | Image                                        |
| ---------- | ----------------- | -------------------------------------------- |
| PostgreSQL | 5432              | `postgres:16-alpine`                         |
| Backend    | 8080              | Built from `lifetracker-backend/Dockerfile`  |
| Frontend   | 3000 (maps to 80) | Built from `lifetracker-frontend/Dockerfile` |


The backend container gets database credentials via environment variables injected by Docker Compose. Postgres has a health check — the backend waits for it to be ready before starting.

---

## Design Decisions & Trade-offs


| Decision                             | Why                                                  | Trade-off                                         |
| ------------------------------------ | ---------------------------------------------------- | ------------------------------------------------- |
| **Vertical slice packages**          | Each module is independent; easy to add new trackers | Some code duplication across services             |
| **JSON in TEXT for custom modules**  | Infinite flexibility without schema migrations       | Can't SQL-query custom field values               |
| **No global state library**          | Simpler codebase for a personal project              | Data re-fetched on every page navigation          |
| **Server-side Gemini proxy**         | API key security + auth gate                         | Extra network hop; backend is a bottleneck for AI |
| **Flyway + Hibernate validate**      | Schema is migration-driven, not auto-generated       | Must write SQL migrations for schema changes      |
| **BCrypt + JWT (no refresh tokens)** | Simple auth for a personal app                       | User must re-login after 24 hours                 |
| **No roles/permissions**             | Single-user personal tracker                         | Not suitable for multi-tenant use                 |
| **Plain CSS (no UI library)**        | Full design control, no dependency bloat             | More CSS to write manually                        |
| **RestTemplate for Gemini**          | No extra SDK dependency                              | Manual JSON parsing; no streaming support         |


### Known gaps (potential improvements)

- No global exception handler (errors return raw 500s)
- No unit/integration tests
- JWT secret and Gemini API key hardcoded in `application.yml` (use env vars in production)
- No refresh token mechanism
- Sidebar not mobile-responsive
- `FoodRepository` has unused analytics queries (`caloriesByDay`, `topCuisines`)
- Frontend error message in `AiBot.js` still mentions "OpenAI" (outdated — backend uses Gemini)

---

## CV / Resume Description

> **LifeTracker Pro** — Full-stack personal life analytics dashboard
>
> - Built a personal life analytics dashboard with **Spring Boot**, **React**, **PostgreSQL**, and **JWT-based authentication**
> - Created multiple tracking modules for **expenses**, **fitness** (gym + food), and **productivity** (DSA + content pipeline) with interactive summary statistics and Chart.js visualizations
> - Integrated **Google Gemini AI** to deliver real-time, context-aware suggestions on each module based on the user's logged data
> - Designed a **custom module builder** where users can define their own fields (text, number, date, dropdown, boolean) and get auto-generated dashboards with charts
> - Deployed with **Docker Compose** (PostgreSQL + Spring Boot + React)
>
> *Tech: Spring Boot 3 · React 18 · PostgreSQL · JWT · Chart.js · Flyway · Gemini AI · Docker*

---

*Built as a personal project to learn full-stack development, REST API design, JWT authentication, database schema design, AI integration, and Docker deployment.*