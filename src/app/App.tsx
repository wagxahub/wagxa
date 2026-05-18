import { RouterProvider } from 'react-router';
import { router } from './routes';
import { UserProvider } from './context/UserContext';
import { BonusProvider } from './context/BonusContext';
import { NotificationProvider } from './context/NotificationContext';
import { SidebarProvider } from './context/SidebarContext';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <UserProvider>
      <BonusProvider>
        <NotificationProvider>
          <SidebarProvider>
            <AuthProvider>
              <RouterProvider router={router} />
            </AuthProvider>
          </SidebarProvider>
        </NotificationProvider>
      </BonusProvider>
    </UserProvider>
  );
}