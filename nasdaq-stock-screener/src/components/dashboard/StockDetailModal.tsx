"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose, // If you want an explicit close button in footer
} from "@/components/ui/dialog"; // Assuming shadcn/ui dialog is available
import { TickerMetrics } from '@/lib/types';
import { Badge } from '@/components/ui/badge'; // Re-using badge for consistency
import { Button } from '@/components/ui/button'; // For close button

interface StockDetailModalProps {
  ticker: TickerMetrics | null;
  isOpen: boolean;
  onClose: () => void;
}

const StockDetailModal: React.FC<StockDetailModalProps> = ({ ticker, isOpen, onClose }) => {
  if (!ticker) {
    return null; // Don't render if no ticker data
  }

  const formatValue = (value: number | null | undefined, prefix = "", decimals = 2): string => {
    if (value === null || typeof value === 'undefined') return "N/A";
    return `${prefix}${value.toFixed(decimals)}`;
  };

  const formatPercentage = (value: number | null | undefined): string => {
    if (value === null || typeof value === 'undefined') return "N/A";
    return `${value.toFixed(2)}%`;
  };

  const getPercentageBadgeVariant = (value: number | null | undefined): "default" | "destructive" | "outline" => {
    if (value === null || typeof value === 'undefined') return "outline";
    if (value > 0) return "default";
    if (value < 0) return "destructive";
    return "outline";
  };

  // Placeholder for Sparkline Chart
  const SparklineChartPlaceholder: React.FC = () => (
    <div className="w-full h-32 bg-muted/50 rounded-md flex items-center justify-center my-4">
      <p className="text-sm text-muted-foreground">Mini-chart (Sparkline) Placeholder</p>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{ticker.symbol} - Stock Details</DialogTitle>
          <DialogDescription>
            Detailed information for {ticker.symbol}. Last updated: {new Date(ticker.updatedAt).toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Sparkline Chart Placeholder */}
          <SparklineChartPlaceholder />

          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Price</p>
              <p className="text-xl font-semibold">{formatValue(ticker.lastPrice, "$")}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">52-Week High</p>
              <p className="text-xl font-semibold">{formatValue(ticker.hi52w, "$")}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">% vs 52W High</p>
              <Badge variant={getPercentageBadgeVariant(ticker.pctVs52w)} className="text-lg">
                {formatPercentage(ticker.pctVs52w)}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">150-Day SMA</p>
              <p className="text-xl font-semibold">{formatValue(ticker.sma150, "$")}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">% vs SMA150</p>
               <Badge variant={getPercentageBadgeVariant(ticker.pctVsSma150)} className="text-lg">
                {formatPercentage(ticker.pctVsSma150)}
              </Badge>
            </div>
            {/* Add more metrics if available/needed */}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StockDetailModal;
