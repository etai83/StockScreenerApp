# NASDAQ Stock Screener Dashboard

## 1. Overview

This project is a NASDAQ Stock Screener Dashboard designed to help active traders discover stocks at technically important levels. It features auto-refreshing data (conceptual), standard and custom filters, and detailed ticker information.

This project was developed based on the [Product Requirements Document (PRD) - NASDAQ Stock-Screener Dashboard](https://chatgpt.com/share/685c4f08-efa0-8001-a9de-c3e8ed03ca10) (requires access).

**Current Project Status:**
*   **Frontend**: UI for the dashboard, filtering, sorting, detail modal, mock admin console, and mock alerting system has been implemented using Next.js and React.
*   **Backend/API**: The Next.js API layer for serving data from a database **has been skipped** due to persistent environment issues preventing `npm install` of necessary packages (e.g., `pg` for PostgreSQL, `ioredis` for Redis).
*   **ETL Process**: Python scripts for ETL (Extract, Transform, Load) have been structured. Calculation logic is implemented. Data fetching and database interaction parts are placeholders and do not connect to live services or a real database. Retry logic for API calls is conceptually included.
*   **Authentication**: Mocked using React Context. No real user accounts or persistence of user data (like saved filters/alerts).
*   **`shadcn/ui` Components**: Many UI components (`Table`, `Button`, `Dialog`, `Select`, `Input`, `Card`, `Badge`) are used in the code. However, their installation via `npx shadcn@latest add` was consistently blocked by environment issues. The application assumes these components would be correctly installed and available.
*   **Dependencies**: Several `npm` package installations (`pg`, `ioredis`, `@clerk/nextjs`, `uuid`) were attempted by modifying `package.json` but ultimately failed due to `npm install` errors in the environment. The code is written as if these packages (especially `uuid` for filter builder and mock auth components) are available.

**Due to the environment limitations, this project is primarily a frontend mock and conceptual layout of backend/ETL systems.**

## 2. Goals (from PRD)

*   Detect price/SMA150 and price/52-w high convergences.
*   Fast, reliable data refresh (ETL-to-UI latency ≤ 2 min).
*   Usable, sticky interface (Median page load ≤ 1.5 s).
*   Engagement (Weekly returning users ≥ 60 % of sign-ups).
*(These goals cannot be fully met or measured in the current mocked state).*

## 3. Features Implemented (or Mocked)

*   **Dashboard UI (F-5)**:
    *   Sortable table displaying stock metrics (`symbol`, `lastPrice`, `%Δ vs SMA150`, `%Δ vs 52W High`, etc.).
    *   Row click opens a modal with detailed metrics and a placeholder for a sparkline chart.
    *   Data status pill showing mock data freshness.
*   **Filter Engine (F-4)**:
    *   UI for building filter rules (metric, operator, value).
    *   Supports AND/OR logic for a group of rules.
    *   Filters are applied to the mock data displayed in the dashboard.
*   **Authentication & Plans (F-8) - Mocked**:
    *   Simulated sign-in/sign-out functionality.
    *   UI changes based on mock auth state (e.g., visibility of "Create Alert" button).
*   **Alerting System (F-6) - Mocked MVP**:
    *   Ability to (mock) create alerts based on current filters for (mock) signed-in users.
    *   Display of (mock) created alerts.
    *   Simulation of alert checking against new data with daily throttling.
*   **Admin Console (F-9) - Mocked**:
    *   Separate `/admin` page.
    *   Displays mock ETL job status, API credit usage.
    *   Button for (mock) manual ETL re-runs.
    *   Access conceptually restricted to (mock) signed-in users.
*   **ETL Process (F-1, F-2, F-3) - Conceptual Structure**:
    *   Python scripts structured for data fetching, calculations, and DB management.
    *   Core calculation logic for SMA150, 52W High, % changes implemented.
    *   Placeholder for API calls with conceptual retry logic.
    *   Placeholder for PostgreSQL/TimescaleDB interaction.

## 4. Tech Stack (Planned / Partially Used)

*   **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, `shadcn/ui` (assumed).
*   **Backend API (Skipped)**: Would have been Next.js App Router (API Routes) or a separate Node.js service.
*   **ETL**: Python (`requests`, `psycopg2-binary`, `pandas`).
*   **Database (Conceptual)**: PostgreSQL with TimescaleDB extension.
*   **Caching (Conceptual)**: Redis.
*   **Authentication (Mocked)**: Would have been Clerk.

## 5. Getting Started (Running the Frontend Mock)

### Prerequisites
*   Node.js and npm (Note: `npm install` has been problematic in the development environment).
*   The codebase assumes `shadcn/ui` components and packages like `uuid` are installed. If `node_modules` is missing or incomplete, these will cause errors.

### Running the Development Server
1.  Navigate to the `nasdaq-stock-screener` directory:
    ```bash
    cd nasdaq-stock-screener
    ```
2.  Install dependencies (if possible in your environment):
    ```bash
    npm install
    ```
    *(This step has been the primary blocker during development in the provided environment.)*
3.  Run the Next.js development server:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 6. ETL Process (Conceptual Setup)

The ETL scripts are located in the `nasdaq-stock-screener/etl/` directory.
*   **Environment**: Python 3.x.
*   **Dependencies**: Install using `pip install -r requirements.txt` (located in the `etl` directory).
*   **Configuration**: API keys and database credentials should be set as environment variables (see `etl/config.py`).
    *   `NASDAQ_API_KEY`
    *   `ALPHA_VANTAGE_API_KEY` (for backup data provider)
    *   `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
*   **Running (Conceptual)**:
    ```bash
    cd nasdaq-stock-screener/etl
    # Set environment variables first
    python main.py
    ```
    *(Currently, `main.py` is a basic placeholder and does not orchestrate a full ETL flow with live data).*

## 7. API Documentation (Conceptual)

Since the backend API was not implemented, this section outlines the planned API.

### Base URL: `/api`

*   **GET `/api/screener/nasdaq`**
    *   **Description**: Fetches NASDAQ stock screener data based on applied filters.
    *   **Query Parameters (Conceptual - would be POST body for complex filters)**:
        *   `filterGroup`: JSON string representing a `FilterGroup` object (see `src/lib/types.ts`).
        *   `sortBy`: Key of `TickerMetrics` to sort by.
        *   `sortDirection`: 'asc' or 'desc'.
        *   `page`: For pagination.
        *   `limit`: Items per page.
    *   **Response**:
        *   `200 OK`: `{ data: TickerMetrics[], totalCount: number, page: number }`
        *   `400 Bad Request`: If filter JSON is invalid.
        *   `500 Internal Server Error`.

*   **GET `/api/tickers/{symbol}` (Conceptual)**
    *   **Description**: Fetches detailed historical data or specific metrics for a single symbol (e.g., for sparkline chart).
    *   **Response**:
        *   `200 OK`: `{ data: ExtendedTickerDetails }` (format TBD, would include historical data points).
        *   `404 Not Found`.

*(Other endpoints for saving user preferences, filters, and alerts would be needed for authenticated users.)*

## 8. Project Structure

```
nasdaq-stock-screener/
|-- etl/                      # Python ETL scripts
|   |-- __init__.py
|   |-- main.py               # Main script to run ETL
|   |-- data_fetcher.py       # Nasdaq Data Link, Alpha Vantage APIs
|   |-- calculations.py       # SMA, 52-week high, % diff
|   |-- db_manager.py         # PostgreSQL/TimescaleDB interactions
|   |-- requirements.txt      # Python dependencies
|   |-- config.py             # ETL configuration
|-- public/                   # Static assets for Next.js
|-- src/                      # Next.js application source
|   |-- app/                  # Next.js App Router: pages, layouts
|   |   |-- admin/            # Admin console page
|   |   |-- layout.tsx        # Root layout
|   |   |-- page.tsx          # Main dashboard page
|   |   |-- globals.css
|   |-- components/           # React components
|   |   |-- dashboard/        # Dashboard specific components (StockTable, etc.)
|   |   |-- ui/               # shadcn/ui components (would be here if installed)
|   |-- lib/                  # Utility functions, types, mock data
|   |   |-- mocks/            # Mock API, mock Auth
|   |   |-- types.ts          # TypeScript type definitions
|-- .env.local.example        # Example environment variables for Next.js
|-- .eslintrc.json
|-- .gitignore
|-- next.config.js
|-- package.json
|-- postcss.config.js
|-- tailwind.config.ts
|-- tsconfig.json
|-- README.md                 # This file
```

## 9. Future Development / Notes

*   Resolve environment issues to allow `npm install` and proper `shadcn/ui` component usage.
*   Implement the actual Next.js API layer with database and Redis integration.
*   Complete the ETL scripts with live API calls and database operations.
*   Implement real authentication using Clerk.
*   Develop features for saving custom filters and alerts for authenticated users.
*   Build out real-time capabilities for data refresh and alert notifications.
*   Add comprehensive automated testing (unit, integration, E2E).
*   Deploy to a cloud platform (e.g., Vercel, AWS).
*   Set up robust monitoring.
```
