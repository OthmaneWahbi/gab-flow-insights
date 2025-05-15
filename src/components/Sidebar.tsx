
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  
  const links = [
    {
      title: 'Dashboard',
      path: '/',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
      ),
    },
    {
      title: 'Upload',
      path: '/upload',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" x2="12" y1="3" y2="15" />
        </svg>
      ),
    },
    {
      title: 'Historique',
      path: '/history',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M12 8v4l3 3" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
    },
  ];
  
  return (
    <aside
      className={cn(
        'bg-card border-r border-border transition-all duration-300 ease-in-out h-screen flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center justify-center h-16 border-b border-border">
        {!collapsed ? (
          <h1 className="text-xl font-bold">Flow Insights</h1>
        ) : (
          <h1 className="text-xl font-bold">FI</h1>
        )}
      </div>
      
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {links.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={cn(
                  'flex items-center px-3 py-2 mx-2 rounded-md transition-colors',
                  location.pathname === link.path
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-secondary/20'
                )}
              >
                {link.icon}
                {!collapsed && <span className="ml-3">{link.title}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-border">
        {!collapsed && (
          <div className="text-xs text-muted-foreground">
            GAB Flow Insights v1.0
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
