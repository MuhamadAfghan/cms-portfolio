import React from 'react'
import {
  FaTachometerAlt,
  FaBriefcase,
  FaStar,
  FaCodeBranch,
} from 'react-icons/fa' // Import icons from react-icons
import { Link, useLocation, useNavigate } from 'react-router-dom' // Import Link and useLocation
import { clearAuth, getAuthUser } from '../lib/auth'

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const username = getAuthUser();

  const navLinks = [
    { path: '/dashboard', icon: FaTachometerAlt, label: 'Dashboard' },
    { path: '/portfolios', icon: FaBriefcase, label: 'Portfolios' },
    { path: '/reviews', icon: FaStar, label: 'Reviews' }, // Corrected path for Reviews
    { path: '/tech-stacks', icon: FaCodeBranch, label: 'Tech Stacks' }, // Corrected path for Tech Stacks
  ];

  return (
    <div className="min-h-screen bg-base-300 text-base-content flex">
      {/* Sidebar */}
      <aside className="w-64 bg-base-200 border-r border-base-content/20 p-4">
        <h2 className="text-2xl font-bold text-white mb-6">CMS Admin</h2>
        <ul className="menu bg-base-200 w-56 rounded-box">
          {navLinks.map((link, index) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <li key={index}>
                <Link to={link.path} className={isActive ? 'active' : ''}>
                  <Icon /> {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <header className="flex items-center justify-between border-b border-base-content/20 bg-base-200/60 px-6 py-4">
          <div>
            <p className="text-sm text-base-content/60">Signed in</p>
            <p className="text-base font-semibold text-white">{username || 'Admin'}</p>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => {
              clearAuth();
              navigate('/login');
            }}
          >
            Logout
          </button>
        </header>
        {children}
      </main>
    </div>
  )
}

export default DashboardLayout
