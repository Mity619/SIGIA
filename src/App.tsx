import { BrowserRouter } from "react-router-dom";
import { AuthContextProvider } from "./features/auth/contexts/AuthContext";
import { AppRouter } from "@/app/router/AppRouter";
import { DashboardContextProvider } from "./features/dashboard/contexts/DashboardContext";
import { NotificationProvider } from "./app/providers/NotificationProvider";

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AuthContextProvider>
          <DashboardContextProvider>
            <AppRouter />
          </DashboardContextProvider>
        </AuthContextProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;
