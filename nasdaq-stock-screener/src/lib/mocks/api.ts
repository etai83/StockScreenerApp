// src/lib/mocks/api.ts

import { TickerMetrics } from '@/lib/types'; // Assuming types will be defined here

// Helper function to generate a random float within a range
const getRandomFloat = (min: number, max: number, decimals: number): number => {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);
  return parseFloat(str);
};

// Helper function to generate a random integer within a range
const getRandomInt = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate a single mock TickerMetrics object
const generateMockTickerMetric = (symbol: string): TickerMetrics => {
  const lastPrice = getRandomFloat(50, 350, 2);
  const sma150 = lastPrice * getRandomFloat(0.9, 1.1, 2);
  const hi52w = lastPrice * getRandomFloat(1.05, 1.5, 2);
  const pctVsSma150 = ((lastPrice - sma150) / sma150) * 100;
  const pctVs52w = ((lastPrice - hi52w) / hi52w) * 100;

  // Ensure updatedAt is a Date object for consistency with potential real API
  const date = new Date();
  date.setDate(date.getDate() - getRandomInt(0, 5)); // Randomize date slightly

  return {
    symbol,
    lastPrice,
    sma150,
    hi52w,
    pctVsSma150,
    pctVs52w,
    updatedAt: date, // Will be serialized to ISO string by Next.js if sent from server component
  };
};

// List of sample NASDAQ symbols
const sampleSymbols: string[] = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA", "META", "BRK.A", "JPM", "V",
  "JNJ", "WMT", "PG", "UNH", "HD", "MA", "BAC", "DIS", "ADBE", "CRM",
  "NFLX", "PYPL", "INTC", "CSCO", "PEP", "AVGO", "QCOM", "TXN", "COST", "AMD"
];

// Generate a list of mock TickerMetrics
const mockTickerMetricsData: TickerMetrics[] = sampleSymbols.map(generateMockTickerMetric);

import { TickerMetrics, FilterGroup, FilterRule, FilterOperator } from '@/lib/types'; // Ensure Filter types are imported

// ... (keep existing helper functions: getRandomFloat, getRandomInt, generateMockTickerMetric, sampleSymbols, mockTickerMetricsData)

// Helper function to check if a single rule matches a ticker
// Exported for use in HomePage to simulate alert checking
export const checkRuleMatch = (ticker: TickerMetrics, rule: FilterRule): boolean => {
  const tickerValue = ticker[rule.metric];

  if (tickerValue === null || typeof tickerValue === 'undefined') return false; // Or handle as per desired logic for nulls

  switch (rule.operator) {
    case 'eq':
      return tickerValue === rule.value;
    case 'ne':
      return tickerValue !== rule.value;
    case 'gt':
      return tickerValue > (rule.value as number);
    case 'gte':
      return tickerValue >= (rule.value as number);
    case 'lt':
      return tickerValue < (rule.value as number);
    case 'lte':
      return tickerValue <= (rule.value as number);
    case 'between':
      if (Array.isArray(rule.value) && rule.value.length === 2) {
        const [min, max] = rule.value;
        return tickerValue >= min && tickerValue <= max;
      }
      return false; // Invalid 'between' value
    default:
      return false;
  }
};


// Mock API function to fetch screener data, now accepting FilterGroup
export const fetchScreenerData = async (
  filterGroup?: FilterGroup
): Promise<TickerMetrics[]> => {
  console.log("Mock API: fetchScreenerData called with filterGroup:", filterGroup);

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  let dataToReturn = [...mockTickerMetricsData]; // Start with a copy of all mock data

  if (filterGroup && filterGroup.rules && filterGroup.rules.length > 0) {
    dataToReturn = dataToReturn.filter(ticker => {
      if (filterGroup.logic === 'AND') {
        return filterGroup.rules.every(rule => checkRuleMatch(ticker, rule));
      } else { // OR logic
        return filterGroup.rules.some(rule => checkRuleMatch(ticker, rule));
      }
    });
  }
  // Note: Nested filter groups are not handled in this version.
  // The PRD mentions "advanced users can edit raw code [JSON]", hinting at potential complexity.
  // For now, this handles a single group of rules with AND/OR.

  return dataToReturn;
};

// Mock API function to fetch data for a single symbol (e.g., for detail modal)
export const fetchTickerDetails = async (symbol: string): Promise<TickerMetrics | null> => {
  console.log("Mock API: fetchTickerDetails called for symbol:", symbol);

  await new Promise(resolve => setTimeout(resolve, 300));

  const ticker = mockTickerMetricsData.find(t => t.symbol === symbol);
  return ticker || null;
};

// Example of how this might be used in a component:
/*
import { useEffect, useState } from 'react';
import { fetchScreenerData } from '@/lib/mocks/api';
import { TickerMetrics } from '@/lib/types';

function MyComponent() {
  const [data, setData] = useState<TickerMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      const result = await fetchScreenerData({ pctVsSma150Range: [-1, 1] });
      setData(result);
      setLoading(false);
    };
    getData();
  }, []);

  if (loading) return <p>Loading...</p>;
  // Render data
  return <ul>{data.map(d => <li key={d.symbol}>{d.symbol}: {d.lastPrice}</li>)}</ul>;
}
*/

console.log("Mock API module loaded.");
