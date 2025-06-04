import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-[#203b77] to-[#0b2a5c] text-white px-18 py-10">
      <div className="container mx-auto px-4 md:flex md:justify-between">
        {/* Logo & Description */}
        <div className="mb-6 md:mb-0">
          <h2 className="text-2xl font-bold">OSDATUM</h2>
          <p className="text-sm mt-2 text-gray-400">Providing vertical datum data.</p>
        </div>

        {/* Navigation Links */}
        <div className="mb-6 md:mb-0">
          <h3 className="font-semibold mb-2">Navigation</h3>
          <ul className="space-y-1 text-gray-300">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/about" className="hover:text-white">About</Link></li>
            <li><Link to="/services/Map" className="hover:text-white">Map</Link></li>
            <li><Link to="/services/datum" className="hover:text-white">Datum</Link></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="font-semibold mb-2">Contact Us</h3>
          <div className="flex gap-4 text-gray-400">
            <a href="mailto:osdatum@gmail.com" className="hover:text-white">osdatum@gmail.com</a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-8 text-center text-sm text-gray-500 border-t border-gray-700 pt-4">
        &copy; {new Date().getFullYear()} Copyright OSDATUM. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;