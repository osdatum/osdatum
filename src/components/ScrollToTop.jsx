import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // "document.documentElement.scrollTo" is the modern scrollTo for evergreen browsers
    // The older "window.scrollTo" is only for backward compatibility
    document.documentElement.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Use 'instant' for immediate scroll, or 'smooth' for animation
    });
  }, [pathname]); // This effect runs whenever the pathname changes

  return null; // This component doesn't render anything
} 