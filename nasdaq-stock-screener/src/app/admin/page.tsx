"use client";

import React, { useState } from 'react';
import { useMockAuth, MockSignedIn, MockSignedOut } from '@/lib/mocks/auth'; // Using mock auth
import { Button } from '@/components/ui/button'; // Assuming Button is available
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Assuming Card is available

const AdminPage: React.FC = () => {
  const { isSignedIn } = useMockAuth(); // For conditional rendering based on mock auth

  // Mock states for admin data
  const [etlStatus, setEtlStatus] = useState<{ lastRun: string; status: string; nextRun: string }>({
    lastRun: new Date(Date.now() - 3600 * 1000).toLocaleString(), // 1 hour ago
    status: "Completed Successfully",
    nextRun: new Date(Date.now() + 3600 * 1000 * 0.9).toLocaleString(), // In ~54 minutes
  });
  const [apiCredits, setApiCredits] = useState<{ provider: string; used: number; limit: number; resetDate: string }[]>([
    { provider: "Nasdaq Data Link", used: 1500, limit: 50000, resetDate: "2025-07-01" },
    { provider: "Alpha Vantage", used: 25, limit: 500, resetDate: "2025-06-26" },
  ]);
  const [isEtlRunning, setIsEtlRunning] = useState<boolean>(false);
  const [isSp500Syncing, setIsSp500Syncing] = useState<boolean>(false); // New state for S&P500 sync

  const handleManualEtlRun = () => {
    if (!isSignedIn) {
      alert("Mock: You need to be signed in as an admin.");
      return;
    }
    setIsEtlRunning(true);
    console.log("AdminPage: Mock manual ETL run triggered.");
    alert("Mock: Manual ETL process started. This is a simulation.");
    // Simulate ETL run duration
    setTimeout(() => {
      setIsEtlRunning(false);
      setEtlStatus({
        lastRun: new Date().toLocaleString(),
        status: "Completed Successfully (Manual Run)",
        nextRun: new Date(Date.now() + 3600 * 1000).toLocaleString(),
      });
      console.log("AdminPage: Mock manual ETL run finished.");
      alert("Mock: Manual ETL process finished.");
    }, 5000); // Simulate 5 seconds run
  };

  const handleSp500DataSync = () => {
    if (!isSignedIn) {
      alert("Mock: You need to be signed in as an admin to sync S&P 500 prices.");
      return;
    }

    console.log("AdminPage: Mock S&P 500 Price Sync triggered.");
    setIsSp500Syncing(true);
    alert("Mock Sync: Starting S&P 500 latest price sync simulation..."); // User notification

    // Simulate API call and data processing delay
    setTimeout(() => {
      // 1. Get a mock list of S&P 500 symbols (subset for demo)
      const mockSp500Symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "JPM", "JNJ", "V", "PG"];
      console.log(`Mock Sync: Using ${mockSp500Symbols.length} mock S&P 500 symbols.`);

      // 2. Generate new random "latest closing prices" for these symbols
      const priceUpdates = mockSp500Symbols.map(symbol => {
        const lastPrice = parseFloat((Math.random() * (500 - 50) + 50).toFixed(2)); // Random price between 50-500
        return {
          symbol: symbol,
          lastPrice: lastPrice,
          priceDate: new Date().toISOString().split('T')[0] // Today's date
        };
      });
      console.log("Mock Sync: Generated price updates:", priceUpdates.slice(0,3)); // Log first few

      // 3. Simulate Updating Global State / Informing User
      //    In a real app, this would trigger an API call which updates the DB.
      //    Then, the main dashboard data would re-fetch or update via websockets/polling.
      //    Here, we just log and alert, as AdminPage cannot directly update HomePage's state easily.
      //    A shared state (Context/Zustand/Redux) would be needed for cross-component state updates.

      // This alert simulates the outcome. The data in StockTable on HomePage will NOT change.
      alert(`Mock Sync: S&P 500 price sync simulation complete for ${priceUpdates.length} symbols.
Data in the main dashboard table is NOT updated by this mock admin action.
This action simulates the backend ETL update only.`);

      setIsSp500Syncing(false);
      console.log("AdminPage: Mock S&P 500 Price Sync finished.");
    }, 3000); // Simulate 3 seconds for the sync process
  };

  // This is a client component, so Clerk's <SignedIn> <SignedOut> or useAuth() can be used.
  // For simplicity, we'll just show a message if not signed in via our mock.
  // A real admin page would have proper role-based access control.

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center">Admin Console</h1>
      </header>

      <MockSignedIn>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* ETL Job Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>ETL Job Status</CardTitle>
              <CardDescription>Current status of the data pipeline.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Last Run:</strong> {etlStatus.lastRun}</p>
              <p><strong>Status:</strong>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                  etlStatus.status.includes("Successfully") ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {etlStatus.status}
                </span>
              </p>
              <p><strong>Next Scheduled Run:</strong> {etlStatus.nextRun}</p>
            </CardContent>
          </Card>

          {/* API Credit Usage Card */}
          <Card>
            <CardHeader>
              <CardTitle>API Credit Usage</CardTitle>
              <CardDescription>Consumption of third-party API credits.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {apiCredits.map(api => (
                <div key={api.provider}>
                  <p className="font-semibold">{api.provider}</p>
                  <div className="w-full bg-muted rounded-full h-2.5 mb-1">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${(api.used / api.limit) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {api.used} / {api.limit} credits used. Resets: {api.resetDate}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Manual Controls Card */}
          <Card>
            <CardHeader>
              <CardTitle>Manual Controls</CardTitle>
              <CardDescription>Trigger manual system actions.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleManualEtlRun}
                disabled={isEtlRunning}
                className="w-full mb-4" // Added margin bottom
              >
                {isEtlRunning ? "ETL Running..." : "Run Full ETL Manually (Mock)"}
              </Button>
              {isEtlRunning && <p className="text-xs text-muted-foreground mt-2 mb-4 text-center animate-pulse">Full ETL simulation in progress...</p>}

              {/* New Data Sync Button */}
              <Button
                onClick={() => handleSp500DataSync()} // Placeholder, will be implemented next
                disabled={isSp500Syncing} // New state variable needed: isSp500Syncing
                className="w-full"
                variant="outline" // Different style for distinction
              >
                {isSp500Syncing ? "S&P 500 Syncing..." : "Sync S&P 500 Prices (Mock)"}
              </Button>
              {isSp500Syncing && <p className="text-xs text-muted-foreground mt-2 text-center animate-pulse">S&P 500 price sync simulation in progress...</p>}

            </CardContent>
          </Card>
        </div>
      </MockSignedIn>

      <MockSignedOut>
        <div className="text-center p-10 border rounded-lg bg-card">
          <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
          <p className="text-muted-foreground">Please sign in to access the Admin Console.</p>
          {/* In a real app, you'd have a sign-in button here that redirects appropriately */}
        </div>
      </MockSignedOut>
    </div>
  );
};

export default AdminPage;
