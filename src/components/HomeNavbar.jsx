import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaSignInAlt } from "react-icons/fa";
import logo from "../assets/images/logo.png";

const HomeNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  const [scroll, setScroll] = useState(false);

  // Function to update user data from localStorage
  const updateUserData = () => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const parsedData = JSON.parse(storedUserData);
      console.log('User Data from localStorage:', parsedData);
      console.log('Photo URL:', parsedData.photoURL);
      setUserData(parsedData);
      setIsLoggedIn(true);
    } else {
      console.log('No user data found in localStorage');
      setUserData(null);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    // Initial load of user data
    updateUserData();

    // Add event listener for storage changes
    window.addEventListener('storage', updateUserData);

    // Add custom event listener for login/logout
    window.addEventListener('authStateChange', updateUserData);

    return () => {
      // Cleanup event listeners
      window.removeEventListener('storage', updateUserData);
      window.removeEventListener('authStateChange', updateUserData);
    };
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 5) {
        setScroll(true);
        setProfileDropdownOpen(false);
      } else {
        setScroll(false);
      }
    });
  });

  let scrollActive = scroll ? "py-6 bg-white shadow" : "py-6";

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setIsLoggedIn(false);
    setUserData(null);
    setProfileDropdownOpen(false);
    window.dispatchEvent(new Event('authStateChange'));
    navigate('/');
  };

  // Function to validate photo URL
  const isValidPhotoURL = (url) => {
    if (!url) {
      console.log('No photo URL provided');
      return false;
    }
    try {
      const parsedUrl = new URL(url);
      const isValid = parsedUrl.protocol === 'https:';
      console.log('Photo URL validation:', { url, isValid });
      return isValid;
    } catch (error) {
      console.log('Invalid photo URL:', url, error);
      return false;
    }
  };

  // Function to get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Function to handle image load error
  const handleImageError = (e) => {
    console.error('Error loading profile image:', {
      src: e.target.src,
      error: e.target.error
    });
    
    // Get current retry count from localStorage
    const retryKey = `retry_${e.target.src}`;
    const currentRetries = parseInt(localStorage.getItem(retryKey) || '0');
    
    if (currentRetries < 3) {
      // Increment retry count
      localStorage.setItem(retryKey, (currentRetries + 1).toString());
      
      // Remove from failed URLs if it was there
      const failedUrls = JSON.parse(localStorage.getItem('failedProfileUrls') || '[]');
      const updatedFailedUrls = failedUrls.filter(url => url !== e.target.src);
      localStorage.setItem('failedProfileUrls', JSON.stringify(updatedFailedUrls));
      
      // Try to reload the image
      console.log(`Retrying image load (attempt ${currentRetries + 1})`);
      e.target.src = e.target.src + '?retry=' + Date.now();
      return;
    }

    // If we've exhausted retries, show initials
    const imgContainer = e.target.parentElement;
    const initialsDiv = imgContainer.nextElementSibling;
    
    if (imgContainer) {
      imgContainer.style.display = 'none';
    }
    
    if (initialsDiv) {
      initialsDiv.style.display = 'flex';
    }

    // Store the failed URL in localStorage
    const failedUrl = e.target.src;
    if (failedUrl) {
      const failedUrls = JSON.parse(localStorage.getItem('failedProfileUrls') || '[]');
      if (!failedUrls.includes(failedUrl)) {
        failedUrls.push(failedUrl);
        localStorage.setItem('failedProfileUrls', JSON.stringify(failedUrls));
        console.log('Added failed URL to cache:', failedUrl);
      }
    }
  };

  // Function to check if URL has previously failed
  const hasUrlFailed = (url) => {
    if (!url) return true;
    const failedUrls = JSON.parse(localStorage.getItem('failedProfileUrls') || '[]');
    const retryKey = `retry_${url}`;
    const retryCount = parseInt(localStorage.getItem(retryKey) || '0');
    
    // If we haven't tried 3 times yet, don't consider it failed
    if (retryCount < 3) {
      return false;
    }
    
    return failedUrls.includes(url);
  };

  // Function to render profile image or initials
  const renderProfileImage = (userData) => {
    const photoURL = userData?.photoURL;
    const shouldShowImage = photoURL && isValidPhotoURL(photoURL) && !hasUrlFailed(photoURL);
    
    console.log('Rendering profile image:', {
      photoURL,
      shouldShowImage,
      hasFailed: hasUrlFailed(photoURL),
      retryCount: photoURL ? parseInt(localStorage.getItem(`retry_${photoURL}`) || '0') : 0
    });

    return (
      <div className="relative">
        {shouldShowImage ? (
          <>
            <img
              src={photoURL}
              alt="Profile"
              className="w-8 h-8 rounded-full border-2 border-white object-cover"
              onError={handleImageError}
              crossOrigin="anonymous"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold hidden">
              {getInitials(userData?.name)}
            </div>
          </>
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
            {getInitials(userData?.name)}
          </div>
        )}
      </div>
    );
  };

  // Add a function to clear image cache
  const clearImageCache = () => {
    localStorage.removeItem('failedProfileUrls');
    // Clear all retry counts
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('retry_')) {
        localStorage.removeItem(key);
      }
    });
  };

  // Clear cache when component mounts
  useEffect(() => {
    clearImageCache();
  }, []);

  // Close all dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-trigger')) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Function to handle smooth scroll
  const handleScrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <nav className={`navbar fixed w-full transition-all px-18 bg-gradient-to-r from-[#0b2a5c] to-[#203b77] z-100 ${scrollActive}`}>
      <div className="container mx-auto flex justify-between items-center px-3">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={logo} alt="OSDATUM Logo" className="h-8 w-auto" />
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex text-white space-x-6 gap-7 items-center">
          <li>
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                handleScrollToSection('home');
              }}
              className="text-white hover:text-gray-300 transition-colors duration-200"
            >
              Home
            </a>
          </li>
          
          <li>
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault();
                handleScrollToSection('features');
              }}
              className="text-white hover:text-gray-300 transition-colors duration-200"
            >
              Services
            </a>
          </li>

          <li>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                handleScrollToSection('about');
              }}
              className="text-white hover:text-gray-300 transition-colors duration-200"
            >
              About
            </a>
          </li>

          {isLoggedIn ? (
            <li className="relative dropdown-trigger">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileDropdownOpen(!profileDropdownOpen);
                }}
                className="flex items-center gap-2 hover:opacity-80"
              >
                {renderProfileImage(userData)}
              </button>
              {profileDropdownOpen && (
                <ul className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-50">
                  <li className="px-4 py-2 border-b">
                    <span className="block text-sm font-semibold">{userData?.name}</span>
                    <span className="block text-xs text-gray-500">{userData?.email}</span>
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-200">
                    <Link to="/user" onClick={() => setProfileDropdownOpen(false)}>Profile</Link>
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-200">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left text-red-600"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </li>
          ) : (
            <li>
              <Link to="/login" className="text-white hover:text-gray-300 transition-colors duration-200">
                <FaSignInAlt className="text-2xl hover:scale-110 transition-transform duration-200" />
              </Link>
            </li>
          )}
        </ul>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-2xl text-white" 
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <ul className="md:hidden mt-4 space-y-4 text-center text-white backdrop-blur-sm z-50">
          <li>
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                handleScrollToSection('home');
                setMenuOpen(false);
              }}
              className="block py-2 text-white hover:text-gray-300 transition-colors duration-200"
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault();
                handleScrollToSection('features');
                setMenuOpen(false);
              }}
              className="block py-2 text-white hover:text-gray-300 transition-colors duration-200"
            >
              Services
            </a>
          </li>
          <li>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                handleScrollToSection('about');
                setMenuOpen(false);
              }}
              className="block py-2 text-white hover:text-gray-300 transition-colors duration-200"
            >
              About
            </a>
          </li>
          {isLoggedIn ? (
            <>
              <li className="px-4 py-2 border-t border-b border-gray-700">
                <div className="flex items-center justify-center gap-2">
                  {renderProfileImage(userData)}
                  <div className="text-left">
                    <div className="text-sm font-semibold">{userData?.name}</div>
                    <div className="text-xs text-gray-300">{userData?.email}</div>
                  </div>
                </div>
              </li>
              <li>
                <Link to="/user" className="block py-2" onClick={() => setMenuOpen(false)}>Profile</Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="block py-2 w-full text-red-400 hover:text-red-300"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login" className="block py-2 w-full text-white hover:text-gray-300 transition-colors duration-200" onClick={() => setMenuOpen(false)}>
                <FaSignInAlt className="text-2xl mx-auto hover:scale-110 transition-transform duration-200" />
              </Link>
            </li>
          )}
        </ul>
      )}
    </nav>
  );
};

export default HomeNavbar;
 