"use client";

import React from 'react';
import { Badge } from "@/components/ui/badge"; // Assuming Badge is available
import { TickerMetrics } from '@/lib/types';

interface DataStatusPillProps {
  data: TickerMetrics[]; // Pass the whole data array to find the latest update
}

const DataStatusPill: React.FC<DataStatusPillProps> = ({ data }) => {
  const getLatestUpdateTimestamp = (): Date | null => {
    if (!data || data.length === 0) {
      return null;
    }
    // Assuming all items in a batch have the same updatedAt, or find the most recent.
    // For mock data, they might be slightly different if generated one by one.
    // Let's find the most recent one.
    let latestDate = data[0].updatedAt;
    for (let i = 1; i < data.length; i++) {
      if (data[i].updatedAt > latestDate) {
        latestDate = data[i].updatedAt;
      }
    }
    return latestDate;
  };

  const latestUpdate = getLatestUpdateTimestamp();

  const formatTimeAgo = (date: Date | null): string => {
    if (!date) return "N/A";

    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);

    if (seconds < 0) return `Future date: ${date.toLocaleString()}`; // Should not happen
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    // For older dates, just show the locale string
    return date.toLocaleString();
  };


  if (!latestUpdate) {
    return <Badge variant="outline">Status: No data</Badge>;
  }

  // PRD: "real-time status pill" - auto-refreshes every 60 minutes.
  // This pill just shows the timestamp of the current data.
  // The "real-time" aspect would be the data refreshing.

  return (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
      <span>Data updated:</span>
      <Badge variant="secondary">{formatTimeAgo(latestUpdate)}</Badge>
    </div>
  );
};

export default DataStatusPill;
