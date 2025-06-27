"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface MockAuthContextType {
  isSignedIn: boolean;
  userId: string | null;
  user: { fullName: string; primaryEmailAddress: { emailAddress: string } } | null;
  signIn: () => void;
  signOut: () => void;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

export const MockAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<MockAuthContextType['user']>(null);

  const signIn = useCallback(() => {
    setIsSignedIn(true);
    const mockUserId = `user_${Date.now()}`;
    setUserId(mockUserId);
    setUser({ fullName: "Mock User", primaryEmailAddress: { emailAddress: "user@example.com" } });
    console.log("MockAuth: User signed in", { userId: mockUserId });
  }, []);

  const signOut = useCallback(() => {
    setIsSignedIn(false);
    setUserId(null);
    setUser(null);
    console.log("MockAuth: User signed out");
  }, []);

  return (
    <MockAuthContext.Provider value={{ isSignedIn, userId, user, signIn, signOut }}>
      {children}
    </MockAuthContext.Provider>
  );
};

export const useMockAuth = (): MockAuthContextType => {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
};

// Mock components to simulate Clerk's UI components

export const MockUserButton: React.FC<{ afterSignOutUrl?: string }> = ({ afterSignOutUrl = "/" }) => {
  const { isSignedIn, signOut, user } = useMockAuth();
  if (!isSignedIn) return null;
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm">Hello, {user?.fullName || 'User'}</span>
      <button
        onClick={() => {
          signOut();
          // In a real app with Clerk, navigation might be handled by Clerk or you might useRouter
          // window.location.href = afterSignOutUrl; // Simple redirect for mock
          console.log(`MockUserButton: Signing out, would redirect to ${afterSignOutUrl}`);
        }}
        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
      >
        Sign Out
      </button>
    </div>
  );
};

export const MockSignInButton: React.FC<{ mode?: 'modal', children: ReactNode }> = ({ children }) => {
  const { signIn } = useMockAuth();
  return <button onClick={signIn} className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">{children}</button>;
};

export const MockSignOutButton: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { signOut } = useMockAuth();
  return <button onClick={signOut} className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600">{children}</button>;
};

// Mock HOCs/components for conditional rendering
export const MockSignedIn: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isSignedIn } = useMockAuth();
  return isSignedIn ? <>{children}</> : null;
};

export const MockSignedOut: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isSignedIn } = useMockAuth();
  return !isSignedIn ? <>{children}</> : null;
};

console.log("Mock Auth module loaded.");
