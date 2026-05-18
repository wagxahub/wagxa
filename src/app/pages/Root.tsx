import { Outlet, useLocation, useNavigate } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { AgeVerificationModal } from '../components/AgeVerificationModal';
import { Toaster } from '../components/ui/sonner';
import { useEffect } from 'react';
import { useSidebar } from '../context/SidebarContext';
import { AuthModals } from '../components/AuthModals';
import { useAuth } from '../context/AuthContext';

/**
 * GLOBAL DESKTOP NAVIGATION SYSTEM
 * 
 * DESKTOP LAYOUT (lg: 1024px+):
 * - Sidebar: Always visible, fixed left (260px width)
 * - Main Content: Flex-1, contains Header + Content
 * - NO hamburger menu on desktop
 * - Consistent across ALL pages (dashboard, games, wallet, etc.)
 * 
 * MOBILE LAYOUT:
 * - Sidebar: Slide-in from left (triggered by hamburger)
 * - Overlay: Dark background when sidebar is open
 * - Hamburger: Visible in TopBar
 * 
 * GAME PAGES:
 * - Use SAME layout structure
 * - Sidebar remains visible on desktop
 * - Game content sits inside main area
 * - Can implement optional fullscreen mode later
 */

export function Root() {
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const { showAuthModal, closeAuthModal, authMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on the landing page
  const isHomePage = location.pathname === '/';

  // Auto-close sidebar on route change (mobile)
  useEffect(() => {
    closeSidebar();
  }, [location.pathname]);

  const handleAuthSuccess = () => {
    // After successful login/register, redirect to wallet dashboard
    navigate('/wallet');
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Mobile Overlay - Only on mobile when sidebar is open */}
      {isSidebarOpen && !isHomePage && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar - Hidden on HomePage, Always visible on desktop (lg+) */}
      {!isHomePage && (
        <div
          className={`
            fixed lg:sticky top-0 inset-y-0 left-0 z-50 lg:z-0
            transform transition-transform duration-300 lg:transform-none
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
          style={{
            height: '100vh',
            overflowY: 'auto',
          }}
        >
          <Sidebar />
        </div>
      )}

      {/* Main Content Area - Flex container for all pages */}
      <div className="flex-1 min-w-0 flex flex-col" style={{ 
        minHeight: '100vh',
      }}>
        <Outlet />
      </div>

      <AgeVerificationModal />
      <Toaster />
      
      {/* Global Auth Modal */}
      <AuthModals
        show={showAuthModal}
        onClose={closeAuthModal}
        initialMode={authMode}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}