import { RouterProvider } from 'react-router';
import { router } from './routes';
import { UserProvider } from './context/UserContext';
import { BonusProvider } from './context/BonusContext';
import { NotificationProvider } from './context/NotificationContext';
import { SidebarProvider } from './context/SidebarContext';
import { AuthProvider } from './context/AuthContext';
import { WalletProvider } from './context/WalletContext';   // ← New import

export default function App() {
  return (
    <UserProvider>
      <BonusProvider>
        <NotificationProvider>
          <SidebarProvider>
            <AuthProvider>
              <WalletProvider>                    {/* ← Added here */}
                <RouterProvider router={router} />
              </WalletProvider>
            </AuthProvider>
          </SidebarProvider>
        </NotificationProvider>
      </BonusProvider>
    </UserProvider>
  );
}
