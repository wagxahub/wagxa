import { RouterProvider } from 'react-router';
import { router } from './routes';
import { UserProvider } from './context/UserContext';
import { BonusProvider } from './context/BonusContext';
import { NotificationProvider } from './context/NotificationContext';
import { SidebarProvider } from './context/SidebarContext';
import { AuthProvider } from './context/AuthContext';
import { LeaderboardProvider } from './context/LeaderboardContext';

export default function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <LeaderboardProvider>
          <BonusProvider>
            <NotificationProvider>
              <SidebarProvider>
                <RouterProvider router={router} />
              </SidebarProvider>
            </NotificationProvider>
          </BonusProvider>
        </LeaderboardProvider>
      </UserProvider>
    </AuthProvider>
  );
}