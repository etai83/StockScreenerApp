// src/lib/types.ts

/**
 * Data model for ticker metrics as defined in the PRD.
 * This type will be used by both the mock API and eventually the real API.
 */
export type TickerMetrics = {
  symbol: string;        // Stock symbol/ticker
  lastPrice: number;     // Last closing price
  sma150: number;        // 150-day Simple Moving Average
  hi52w: number;         // 52-week high price
  pctVsSma150: number;   // Signed percentage difference from SMA150: (close - sma150) / sma150 * 100
  pctVs52w: number;      // Signed percentage difference from 52-week high: (close - 52w_high) / 52w_high * 100
  updatedAt: Date;       // Timestamp of the last update (ISO-8601 string when serialized, Date object in JS)
};

// Potentially other shared types can go here as the project grows.

// --- Filter Engine Types (F-4) ---

// Available metrics for filtering (excluding non-numeric or complex types for simplicity first)
export type FilterableMetric = 'lastPrice' | 'sma150' | 'hi52w' | 'pctVsSma150' | 'pctVs52w';

export const filterableMetricsList: { value: FilterableMetric, label: string }[] = [
  { value: 'lastPrice', label: 'Last Price' },
  { value: 'sma150', label: '150-Day SMA' },
  { value: 'hi52w', label: '52-Week High' },
  { value: 'pctVsSma150', label: '% vs SMA150' },
  { value: 'pctVs52w', label: '% vs 52W High' },
];

export type FilterOperator =
  | 'eq'  // equals
  | 'ne'  // not equals
  | 'gt'  // greater than
  | 'gte' // greater than or equal to
  | 'lt'  // less than
  | 'lte' // less than or equal to
  | 'between'; // between two values (inclusive)

export const filterOperatorList: { value: FilterOperator, label: string }[] = [
  { value: 'eq', label: '=' },
  { value: 'ne', label: '!=' },
  { value: 'gt', label: '>' },
  { value: 'gte', label: '>=' },
  { value: 'lt', label: '<' },
  { value: 'lte', label: '<=' },
  { value: 'between', label: 'Between' },
];

export interface FilterRule {
  id: string; // Unique ID for UI keying and management
  metric: FilterableMetric;
  operator: FilterOperator;
  value: number | [number, number]; // Single value or a tuple for 'between'
}

// A group of rules, combined with AND/OR logic.
// For simplicity, we'll start with a single group with AND logic.
// The PRD mentions "JSON-backed rule objects with fields: metric, operator, value, logic (AND/OR).
// UI builder generates the JSON; advanced users can edit raw code."
// This suggests a potentially nested structure for complex queries.
export interface FilterGroup {
  id: string; // Unique ID for UI keying
  logic: 'AND' | 'OR';
  rules: FilterRule[];
  // groups?: FilterGroup[]; // For nested groups - can be added for v2 complexity
}

// For the initial implementation, we might manage a flat list of rules with a global AND/OR.
// Or, one top-level FilterGroup. Let's aim for one FilterGroup.
// The mock API `fetchScreenerData` currently simulates a simple filter object, e.g. { pctVsSma150Range: [-1, 1] }
// We'll need to adapt this or the mock API to handle the new FilterGroup structure.
