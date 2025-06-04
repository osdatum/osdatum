import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Create the Context
const AuthContext = createContext(null);

// 2. Create the Provider Component
export const AuthProvider = ({ children }) => {
  // State to hold the authentication token
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Update localStorage whenever the token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      // Dispatch a custom event to notify other parts of the app
      window.dispatchEvent(new Event('authStateChange'));
    } else {
      localStorage.removeItem('token');
      // Dispatch a custom event on logout
      window.dispatchEvent(new Event('authStateChange'));
    }
  }, [token]);

  // Function to handle login
  const login = (newToken) => {
    setToken(newToken);
    // The useEffect above will handle localStorage and dispatching event
  };

  // Function to handle logout
  const logout = () => {
    setToken(null); // Setting token to null triggers the useEffect
    // You might also want to clear other user data from localStorage here if any
    localStorage.removeItem('userData');
  };

  // Value to be provided by the context
  const contextValue = { token, login, logout };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Create a custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 