import { BrowserRouter } from "react-router-dom";
import { AuthContextProvider } from "./features/auth/contexts/AuthContext";
import { AppRouter } from "@/app/router/AppRouter";
import { DashboardContextProvider } from "./features/dashboard/contexts/DashboardContext";
import { NotificationProvider } from "./app/providers/NotificationProvider";
import { AccountContextProvider } from "./features/accounts/contexts/AccountContext";

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AccountContextProvider>
          <AuthContextProvider>
            <DashboardContextProvider>
              <AppRouter />
            </DashboardContextProvider>
          </AuthContextProvider>
        </AccountContextProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;
