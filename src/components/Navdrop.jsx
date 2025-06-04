import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaSignInAlt } from "react-icons/fa";
import logo from "../assets/images/logo.png"

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
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
      console.log('Parsed user data in navbar:', parsedData);
      setUserData(parsedData);
      setIsLoggedIn(true);
    } else {
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
        setServicesDropdownOpen(false);
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
    if (!url) return false;
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'https:';
    } catch {
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
    console.error('Error loading profile image, falling back to initials');
    const imgContainer = e.target.parentElement;
    const initialsDiv = imgContainer.nextElementSibling;
    
    if (imgContainer) {
      imgContainer.style.display = 'none';
    }
    
    if (initialsDiv) {
      initialsDiv.style.display = 'flex';
    }
  };

  // Close all dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-trigger')) {
        setServicesDropdownOpen(false);
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <nav className={`navbar fixed w-full px-18 transition-all bg-gradient-to-r from-[#0b2a5c] to-[#203b77] z-100 ${scrollActive}`}>
      <div className="container mx-auto flex justify-between items-center px-3">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={logo} alt="OSDATUM Logo" className="h-8 w-auto" />
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex text-white space-x-6 gap-7 items-center">
          <li>
            <Link to="/" className="hover:text-gray-300">Home</Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-gray-300">About</Link>
          </li>
          {/* Services Dropdown */}
          <li className="relative dropdown-trigger">
            <button 
              className="hover:text-gray-300" 
              onClick={(e) => {
                e.stopPropagation();
                setServicesDropdownOpen(!servicesDropdownOpen);
                setProfileDropdownOpen(false);
              }}
            >
              Services ▾
            </button>
            {servicesDropdownOpen && (
              <ul className="absolute left-0 mt-2 w-40 bg-white text-black rounded shadow-lg z-50">
                <li className="px-4 py-2 hover:bg-gray-200">
                  <Link to="/services/map" onClick={() => setServicesDropdownOpen(false)}>Map</Link>
                </li>
                <li className="px-4 py-2 hover:bg-gray-200">
                  <Link to="/services/datum" onClick={() => setServicesDropdownOpen(false)}>Datum</Link>
                </li>
              </ul>
            )}
          </li>
          {isLoggedIn ? (
            <li className="relative dropdown-trigger">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setServicesDropdownOpen(false);
                }}
                className="flex items-center gap-2 hover:opacity-80"
              >
                {userData?.photoURL && isValidPhotoURL(userData.photoURL) ? (
                  <div className="relative">
                    <img
                      src={userData.photoURL}
                      alt="Profile"
                      className="w-8 h-8 rounded-full border-2 border-white object-cover"
                      onError={handleImageError}
                      crossOrigin="anonymous"
                    />
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold hidden">
                      {getInitials(userData?.name)}
                    </div>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {getInitials(userData?.name)}
                  </div>
                )}
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
              <Link to="/login" className="text-white hover:text-gray-300">
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
            <Link to="/" className="block py-2" onClick={() => setMenuOpen(false)}>Home</Link>
          </li>
          <li>
            <Link to="/about" className="block py-2" onClick={() => setMenuOpen(false)}>About</Link>
          </li>
          <li>
            <button 
              className="block py-2 w-full" 
              onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
            >
              Services ▾
            </button>
            {servicesDropdownOpen && (
              <ul className="mt-2 backdrop-blur-sm text-white rounded shadow-lg z-50">
                <li className="px-4 py-2 hover:bg-gray-200">
                  <Link to="/services/map" onClick={() => { setServicesDropdownOpen(false); setMenuOpen(false); }}>Map</Link>
                </li>
                <li className="px-4 py-2 hover:bg-gray-200">
                  <Link to="/services/datum" onClick={() => { setServicesDropdownOpen(false); setMenuOpen(false); }}>Datum</Link>
                </li>
              </ul>
            )}
          </li>
          {isLoggedIn ? (
            <>
              <li className="px-4 py-2 border-t border-b border-gray-700">
                <div className="flex items-center justify-center gap-2">
                  {userData?.photoURL && isValidPhotoURL(userData.photoURL) ? (
                    <div className="relative">
                      <img
                        src={userData.photoURL}
                        alt="Profile"
                        className="w-8 h-8 rounded-full border-2 border-white object-cover"
                        onError={handleImageError}
                        crossOrigin="anonymous"
                      />
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold hidden">
                        {getInitials(userData?.name)}
                      </div>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                      {getInitials(userData?.name)}
                    </div>
                  )}
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

export default Navbar;
