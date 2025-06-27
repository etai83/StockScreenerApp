"use client"; // This component will fetch data and manage state

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table"; // Assuming shadcn/ui table is available
// import { fetchScreenerData } from '@/lib/mocks/api'; // Not used in this component
import { TickerMetrics } from '@/lib/types';
import { Badge } from "@/components/ui/badge"; // For status pills or % changes
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"; // For sorting icons
import { Button } from "@/components/ui/button"; // For clickable headers

// Define which columns are sortable and their corresponding TickerMetrics key
type SortableColumn = Exclude<keyof TickerMetrics, 'updatedAt'>; // Exclude non-meaningful sort keys like Date object

interface SortConfig {
  key: SortableColumn;
  direction: 'asc' | 'desc';
}

interface StockTableProps {
  initialData: TickerMetrics[];
  isLoading: boolean;
  error: string | null;
  onRowClick: (ticker: TickerMetrics) => void; // Callback for row click
}

const StockTable: React.FC<StockTableProps> = ({ initialData, isLoading, error, onRowClick }) => {
  // rawData will be derived from initialData prop
  // const [rawData, setRawData] = useState<TickerMetrics[]>(initialData); // Not quite, useEffect needed if initialData can change
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'symbol', direction: 'asc' });

  // useEffect(() => {
  //   setRawData(initialData); // Update rawData if initialData prop changes
  // }, [initialData]);
  // Simpler: use initialData directly in useMemo for sortedData if it's guaranteed to be stable per render pass from parent

  const requestSort = (key: SortableColumn) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    // Use initialData directly from props
    const sortableItems = [...initialData];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];

        // Type-aware comparison
        if (valA === null || typeof valA === 'undefined') return sortConfig.direction === 'asc' ? 1 : -1;
        if (valB === null || typeof valB === 'undefined') return sortConfig.direction === 'asc' ? -1 : 1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
        }
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        // Add other type comparisons if necessary (e.g., Dates, though we excluded updatedAt)
        return 0;
      });
    }
    return sortableItems;
  }, [initialData, sortConfig]); // Depend on initialData from props

  const getSortIcon = (columnKey: SortableColumn) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  const formatPercentage = (value: number | null | undefined): string => {
    if (value === null || typeof value === 'undefined') return "N/A";
    return `${value.toFixed(2)}%`;
  };

  const getPercentageBadgeVariant = (value: number | null | undefined): "default" | "destructive" | "outline" => {
    if (value === null || typeof value === 'undefined') return "outline";
    if (value > 0) return "default"; // Greenish in default themes often
    if (value < 0) return "destructive"; // Reddish
    return "outline";
  }

  // Use isLoading and error from props
  if (isLoading) {
    return <div className="text-center p-10">Loading stock data...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  // Check sortedData length only if not loading and no error
  if (!isLoading && !error && sortedData.length === 0) {
    return <div className="text-center p-10">No stock data available.</div>;
  }

  return (
    <div className="container mx-auto py-5">
      {/* DataStatusPill is now handled by page.tsx */}
      <Table>
        <TableCaption>
          NASDAQ Stock Screener Data. Click column headers to sort.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">
              <Button variant="ghost" onClick={() => requestSort('symbol')} className="px-2 py-1">
                Symbol {getSortIcon('symbol')}
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button variant="ghost" onClick={() => requestSort('lastPrice')} className="px-2 py-1">
                Last Price {getSortIcon('lastPrice')}
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button variant="ghost" onClick={() => requestSort('sma150')} className="px-2 py-1">
                SMA150 {getSortIcon('sma150')}
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button variant="ghost" onClick={() => requestSort('pctVsSma150')} className="px-2 py-1">
                % vs SMA150 {getSortIcon('pctVsSma150')}
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button variant="ghost" onClick={() => requestSort('hi52w')} className="px-2 py-1">
                52W High {getSortIcon('hi52w')}
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button variant="ghost" onClick={() => requestSort('pctVs52w')} className="px-2 py-1">
                % vs 52W High {getSortIcon('pctVs52w')}
              </Button>
            </TableHead>
            {/* Add more headers as needed, e.g., for row click action */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((ticker) => (
            <TableRow
              key={ticker.symbol}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onRowClick(ticker)} // Call onRowClick with the ticker data
            >
              <TableCell className="font-medium">{ticker.symbol}</TableCell>
              <TableCell className="text-right">${ticker.lastPrice.toFixed(2)}</TableCell>
              <TableCell className="text-right">
                {ticker.sma150 !== null ? `$${ticker.sma150.toFixed(2)}` : "N/A"}
              </TableCell>
              <TableCell className="text-right">
                <Badge variant={getPercentageBadgeVariant(ticker.pctVsSma150)}>
                  {formatPercentage(ticker.pctVsSma150)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {ticker.hi52w !== null ? `$${ticker.hi52w.toFixed(2)}` : "N/A"}
              </TableCell>
              <TableCell className="text-right">
                 <Badge variant={getPercentageBadgeVariant(ticker.pctVs52w)}>
                  {formatPercentage(ticker.pctVs52w)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StockTable;
