import React, { useState, useContext, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../assets/medsai-logo2-white.png";
import { AuthContext } from "../context/AuthContext";


const Navbar = ({ className }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  
  const currentPath = location.pathname;

  const isActive = (path) => {
    if (path === "/") {
      return currentPath === "/" ? "active" : "";
    }
    return currentPath.includes(path) ? "active" : "";
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // CSS for the logo animation

  return (
    <>
      <header className={`navigation-bar ${className || ""}`}>
        <Link to="/" className="logo-container" style={{ textDecoration: "none" }}>
          <img
            className="logo"
            src={logo}
            alt="MEDS-AI logo"
          />
          <span
            className="app-name"
          >
            PREDET-AI
          </span>
        </Link>
        
        {/* Mobile Menu Toggle */}
        <div className="mobile-menu-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} color="white" /> : <Menu size={24} color="white" />}
        </div>

        <ul className={`nav-links ${isMenuOpen ? 'mobile-menu-open' : ''}`}>
          <li>
            <Link to="/" className={isActive("/")}>
              Home
            </Link>
          </li>
          
          {isAuthenticated ? (
            // Navigation items for logged-in users
            <>
              <li>
                <Link to="/predict" className={isActive("/predict")}>
                  Predict Disease
                </Link>
              </li>
              <li>
                <Link to="/diabetes" className={isActive("/diabetes")}>
                  Diabetes Detector
                </Link>
              </li>
              <li>
                <Link to="/previous-predictions" className={isActive("/previous-predictions")}>
                  Previous Predictions
                </Link>
              </li>
              <li className="text-white">|</li>
              <li>
                <span className="nav-item user-greeting">Hi, {user?.name}</span>
              </li>
              <li>
                <button 
                  onClick={handleLogout}
                  className="nav-item logout-btn"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            // Navigation items for guests/not logged-in users
            <>
              <li>
                <Link to="/login" className={isActive("/login")}>
                  Login
                </Link>
              </li>
              <li>
                <Link to="/predict" className={isActive("/predict")}>
                  Predict Disease
                </Link>
              </li>
              <li>
                <Link to="/diabetes" className={isActive("/diabetes")}>
                  Diabetes Detector
                </Link>
              </li>
              <li>
                <Link to="/aboutus" className={isActive("/aboutus")}>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className={isActive("/contact")}>
                  Contact
                </Link>
              </li>
            </>
          )}
        </ul>
      </header>
      
    </>
  );
};

export default Navbar;