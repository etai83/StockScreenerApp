"use client"; // This page will fetch data and manage state for its children

import React, { useEffect, useState, useCallback } from 'react';
import StockTable from "@/components/dashboard/StockTable";
import DataStatusPill from '@/components/dashboard/DataStatusPill';
import StockDetailModal from '@/components/dashboard/StockDetailModal';
import FilterBuilder from '@/components/dashboard/FilterBuilder';
import { fetchScreenerData, checkRuleMatch } from '@/lib/mocks/api'; // Import checkRuleMatch
import { TickerMetrics, FilterGroup } from '@/lib/types';
import { useMockAuth, MockUserButton, MockSignInButton, MockSignedIn, MockSignedOut } from '@/lib/mocks/auth';
import { Button } from '@/components/ui/button'; // Assuming Button is available

// Type for stored alerts
interface UserAlert {
  id: string;
  name: string;
  filterGroup: FilterGroup;
  lastTriggeredSymbol?: string | null; // To simulate "first match per trading day"
  lastTriggeredDate?: string | null;   // Date part of ISO string
}

export default function HomePage() {
  const { isSignedIn, userId } = useMockAuth(); // Get auth state, userId for namespacing alerts
  const [screenerData, setScreenerData] = useState<TickerMetrics[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTicker, setSelectedTicker] = useState<TickerMetrics | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [currentFilterGroup, setCurrentFilterGroup] = useState<FilterGroup>({
    id: 'default-filter-group',
    logic: 'AND',
    rules: [],
  });

  // State for user alerts (mocked, would be in DB)
  const [userAlerts, setUserAlerts] = useState<UserAlert[]>([]);
  // State for mock notifications from alerts
  const [triggeredAlertsInfo, setTriggeredAlertsInfo] = useState<string[]>([]);


  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await fetchScreenerData(currentFilterGroup);
        setScreenerData(result);

        // Simulate checking alerts when new data arrives
        if (isSignedIn && result.length > 0) {
          const todayStr = new Date().toISOString().split('T')[0];
          const newTriggeredInfo: string[] = [];
          const updatedAlerts = userAlerts.map(alert => {
            // Check if already triggered today for *any* symbol for this alert
            if (alert.lastTriggeredDate === todayStr) {
              return alert;
            }
            for (const ticker of result) {
              let match = false;
              if (alert.filterGroup.logic === 'AND') {
                match = alert.filterGroup.rules.every(rule => checkRuleMatch(ticker, rule));
              } else {
                match = alert.filterGroup.rules.some(rule => checkRuleMatch(ticker, rule));
              }
              if (match) {
                newTriggeredInfo.push(`Alert '${alert.name}' triggered for ${ticker.symbol}!`);
                return { ...alert, lastTriggeredSymbol: ticker.symbol, lastTriggeredDate: todayStr };
              }
            }
            return alert; // No trigger or already triggered today
          });
          setUserAlerts(updatedAlerts); // Update lastTriggeredDate/Symbol
          if (newTriggeredInfo.length > 0) {
            // Append new notifications, clear them after a delay for demo
            setTriggeredAlertsInfo(prev => [...prev, ...newTriggeredInfo]);
            setTimeout(() => setTriggeredAlertsInfo([]), 15000); // Clear after 15s
          }
        }
      } catch (err) {
        console.error("Failed to fetch screener data on page:", err);
        setError("Failed to load stock data. Please try refreshing the page.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentFilterGroup, isSignedIn]); // Re-check alerts if signedIn status changes or new data

  const handleApplyFilters = useCallback((newFilterGroup: FilterGroup) => {
    setCurrentFilterGroup(newFilterGroup);
  }, []);

  const handleCreateAlert = useCallback(() => {
    if (!isSignedIn) {
      alert("Please sign in to create alerts."); // Or use a more integrated notification
      return;
    }
    if (currentFilterGroup.rules.length === 0) {
      alert("Please add at least one filter rule to create an alert.");
      return;
    }
    const alertName = window.prompt("Enter a name for this alert (based on current filters):");
    if (alertName) {
      const newAlert: UserAlert = {
        id: `alert_${Date.now()}_${userId || 'anon'}`, // Basic unique ID
        name: alertName,
        filterGroup: JSON.parse(JSON.stringify(currentFilterGroup)), // Deep copy
      };
      setUserAlerts(prevAlerts => [...prevAlerts, newAlert]);
      alert(`Alert "${alertName}" created!`);
    }
  }, [isSignedIn, currentFilterGroup, userId]);

  const handleRowClick = (ticker: TickerMetrics) => {
    setSelectedTicker(ticker);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTicker(null); // Clear selected ticker on close
  };

  return (
    <main className="container mx-auto p-4">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-3xl font-bold text-center sm:text-left mb-4 sm:mb-0">
          NASDAQ Stock Screener Dashboard
        </h1>
        <div className="auth-buttons">
          <MockSignedIn>
            <MockUserButton afterSignOutUrl="/" />
          </MockSignedIn>
          <MockSignedOut>
            <MockSignInButton mode="modal">
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Sign In
              </button>
            </MockSignInButton>
          </MockSignedOut>
        </div>
      </header>

      <div className="mb-4 flex justify-center sm:justify-start">
        {isLoading && <p className="text-sm text-muted-foreground">Loading status...</p>}
        {!isLoading && error && <p className="text-sm text-red-500">Status: Error loading data</p>}
        {!isLoading && !error && <DataStatusPill data={screenerData} />}
      </div>

      <section className="mb-6">
        <FilterBuilder
          initialFilterGroup={currentFilterGroup}
          onApplyFilters={handleApplyFilters}
        />
        <MockSignedIn>
          <div className="mt-4 text-center sm:text-left">
            <Button onClick={handleCreateAlert} variant="outline" size="sm">
              Create Alert from Current Filters
            </Button>
          </div>
        </MockSignedIn>
      </section>

      {/* Display User Alerts and Triggered Notifications */}
      <MockSignedIn>
        {userAlerts.length > 0 && (
          <section className="my-6 p-4 border rounded-lg bg-card shadow">
            <h2 className="text-xl font-semibold mb-3">My Alerts</h2>
            <ul className="space-y-2">
              {userAlerts.map(alert => (
                <li key={alert.id} className={`p-2 rounded-md ${alert.lastTriggeredDate === new Date().toISOString().split('T')[0] ? 'bg-green-100 dark:bg-green-900' : 'bg-muted/30'}`}>
                  <span className="font-medium">{alert.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">({alert.filterGroup.rules.length} rules, {alert.filterGroup.logic})</span>
                  {alert.lastTriggeredDate === new Date().toISOString().split('T')[0] && alert.lastTriggeredSymbol && (
                    <span className="text-xs text-green-700 dark:text-green-300 ml-2 block sm:inline">
                      Triggered today for {alert.lastTriggeredSymbol}!
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </MockSignedIn>

      {/* Display temporary pop-up like notifications for new triggers */}
      {triggeredAlertsInfo.length > 0 && (
        <div className="fixed bottom-4 right-4 space-y-2 z-50">
          {triggeredAlertsInfo.map((info, index) => (
            <div key={index} className="bg-blue-500 text-white p-3 rounded-lg shadow-lg animate-pulse">
              {info}
            </div>
          ))}
        </div>
      )}


      <section>
        <StockTable
          initialData={screenerData}
          isLoading={isLoading}
          error={error}
          onRowClick={handleRowClick} // Pass the handler
        />
      </section>

      {/* Render the Modal */}
      <StockDetailModal
        ticker={selectedTicker}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} NASDAQ Stock Screener. All rights reserved (not really, this is a demo).</p>
        <p>Data provided by mock sources for demonstration purposes.</p>
      </footer>
    </main>
  );
}
