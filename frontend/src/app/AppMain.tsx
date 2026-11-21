import { useState } from "react";
import WelcomePage from "./components/WelcomePage";
import LoginPage from "./components/LoginPage";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import StudentDashboard from "./components/StudentDashboard";
import InstructorDashboard from "./components/InstructorDashboard";
import AdminDashboard from "./components/AdminDashboard";
import { User } from "./types";
import { GlobalDataProvider } from "./GlobalDataContext";
import { cerrarSesion } from "./api";

type ViewType = "welcome" | "login" | "forgot-password" | "dashboard";

export default function AppMain() {
  const [currentView, setCurrentView] = useState<ViewType>("welcome");
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentView("dashboard");
  };

  // Al salir de un panel se vuelve al inicio de sesión, no a la bienvenida.
  const handleLogout = () => {
    cerrarSesion();
    setUser(null);
    setCurrentView("login");
  };

  return (
    <GlobalDataProvider>
      {currentView === "welcome" && (
        <WelcomePage onNavigateToLogin={() => setCurrentView("login")} />
      )}

      {currentView === "forgot-password" && (
        <ForgotPasswordPage onBackToLogin={() => setCurrentView("login")} />
      )}

      {currentView === "login" && !user && (
        <LoginPage
          onLogin={handleLogin}
          onForgotPassword={() => setCurrentView("forgot-password")}
          onBackToWelcome={() => setCurrentView("welcome")}
        />
      )}

      {currentView === "dashboard" && user && (
        <>
          {user.role === "aprendiz" && <StudentDashboard user={user} onLogout={handleLogout} />}
          {user.role === "instructor" && <InstructorDashboard user={user} onLogout={handleLogout} />}
          {user.role === "admin" && <AdminDashboard user={user} onLogout={handleLogout} />}
        </>
      )}

      {!currentView && (
        <WelcomePage onNavigateToLogin={() => setCurrentView("login")} />
      )}
    </GlobalDataProvider>
  );
}
