import { jwtDecode } from 'jwt-decode';

export const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};

export const getTokenExpirationTime = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000; // Convert to milliseconds
  } catch {
    return null;
  }
};

export const handleTokenExpiration = () => {
  // Clear local storage
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
  
  // Dispatch event for other components to handle
  window.dispatchEvent(new Event('authStateChange'));
  
  // Redirect to login
  window.location.href = '/login';
};

// Function to check token expiration periodically
export const startTokenExpirationCheck = () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  const expirationTime = getTokenExpirationTime(token);
  if (!expirationTime) return;

  const timeUntilExpiration = expirationTime - Date.now();
  
  // Set timeout to handle expiration
  setTimeout(() => {
    handleTokenExpiration();
  }, timeUntilExpiration);

  // Also check every minute
  setInterval(() => {
    if (isTokenExpired(token)) {
      handleTokenExpiration();
    }
  }, 60000); // Check every minute
}; 