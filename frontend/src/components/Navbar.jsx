import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, HomeIcon, LogOutIcon, ShipWheelIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");
  const { logoutMutation } = useLogout();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between w-full">
          {/* Logo & App Name - Always show on mobile, only show on desktop in chat page */}
          {/* Mobile logo (always visible in mobile) */}
          <div className="flex items-center lg:hidden">
            <Link to="/" className="flex items-center gap-2.5">
              <ShipWheelIcon className="size-8 text-primary" />
              <span className="text-2xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wide">
                Streamify
              </span>
            </Link>
          </div>

          {/* Desktop logo (only show in chat pages) */}
          {isChatPage && (
            <div className="items-center hidden lg:flex">
              <Link to="/" className="flex items-center gap-2.5">
                <ShipWheelIcon className="size-8 text-primary" />
                <span className="text-2xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wide">
                  Streamify
                </span>
              </Link>
            </div>
          )}

          {/* Right Section (Nav Links, Theme, Avatar, Logout) */}
          <div className="flex items-center gap-3 sm:gap-4 ml-auto relative" ref={dropdownRef}>
            {/* Mobile Nav Links (Home + Notifications) */}
            <div className="flex gap-2 lg:hidden">
              <Link to="/">
                <button className="btn btn-ghost btn-circle">
                  <HomeIcon className="h-6 w-6 text-base-content opacity-70" />
                </button>
              </Link>
              <Link to="/notifications">
                <button className="btn btn-ghost btn-circle">
                  <BellIcon className="h-6 w-6 text-base-content opacity-70" />
                </button>
              </Link>
            </div>

            {/* Theme Selector */}
            <ThemeSelector />

            {/* User Avatar (click toggles logout dropdown) */}
            <div
              className="avatar cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="w-9 rounded-full">
                <img
                  src={authUser?.profilePic}
                  alt="User Avatar"
                  rel="noreferrer"
                />
              </div>
            </div>

            {/* Logout dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-base-100 border border-base-300 rounded shadow-lg z-50">
                <button
                  onClick={logoutMutation}
                  className="w-full text-left px-4 py-2 hover:bg-base-200 flex items-center gap-2"
                >
                  <LogOutIcon className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
