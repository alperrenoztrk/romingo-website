import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { applyDarkMode, getStoredPreferences } from "@/lib/preferences";
import BottomNav from "./components/BottomNav";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import LearnPage from "./pages/LearnPage";
import ShopPage from "./pages/ShopPage";
import LeaguePage from "./pages/LeaguePage";
import ProfilePage from "./pages/ProfilePage";
import LessonPage from "./pages/LessonPage";
import NotFound from "./pages/NotFound";
import TranslationPage from "./pages/TranslationPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";
import SecuritySettingsPage from "./pages/SecuritySettingsPage";
import DailyGoalsSettingsPage from "./pages/DailyGoalsSettingsPage";

const queryClient = new QueryClient();

function LegacyLessonRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={id ? `/app/lesson/${id}` : "/app/learn"} replace />;
}

function LegacyLearnRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/app/learn${search}`} replace />;
}


type SessionMode = "authenticated" | "logged_out" | "guest";

const SESSION_KEY = "romingo_session_mode";

function AppContent() {
  const location = useLocation();
  const isAppRoute = location.pathname === "/app" || location.pathname.startsWith("/app/");
  const hideNav = location.pathname.startsWith("/app/lesson/");
  const [sessionMode, setSessionMode] = useState<SessionMode>("authenticated");
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const storedMode = localStorage.getItem(SESSION_KEY) as SessionMode | null;
    if (storedMode === "authenticated" || storedMode === "logged_out" || storedMode === "guest") {
      setSessionMode(storedMode);
    }

    const { darkMode } = getStoredPreferences();
    applyDarkMode(darkMode);

    const splashTimer = window.setTimeout(() => {
      setShowSplash(false);
    }, 2800);

    return () => {
      window.clearTimeout(splashTimer);
    };
  }, []);

  const handleLogout = () => {
    setSessionMode("logged_out");
    localStorage.setItem(SESSION_KEY, "logged_out");
  };

  const handleGuestLogin = () => {
    setSessionMode("guest");
    localStorage.setItem(SESSION_KEY, "guest");
  };

  if (isAppRoute && showSplash) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-pink-100 via-pink-200 to-rose-300 dark:from-slate-900 dark:via-fuchsia-950 dark:to-rose-950">
        <div className="text-center">
          <div className="text-8xl leading-none">🦩</div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-wide text-rose-700 dark:text-pink-300">Romingo</h1>
        </div>
      </div>
    );
  }

  if (isAppRoute && sessionMode === "logged_out") {
    return <LoginPage onGuestLogin={handleGuestLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/translate" element={<TranslationPage />} />
        <Route path="/app" element={<HomePage />} />
        <Route path="/app/learn" element={<LearnPage />} />
        <Route path="/app/shop" element={<ShopPage />} />
        <Route path="/app/league" element={<LeaguePage />} />
        <Route path="/app/profile" element={<ProfilePage isGuest={sessionMode === "guest"} onLogout={handleLogout} />} />
        <Route path="/app/settings" element={<SettingsPage />} />
        <Route path="/app/settings/profile" element={<ProfileSettingsPage />} />
        <Route path="/app/settings/security" element={<SecuritySettingsPage />} />
        <Route path="/app/settings/daily-goals" element={<DailyGoalsSettingsPage />} />
        <Route path="/app/lesson/:id" element={<LessonPage />} />
        <Route path="/learn" element={<LegacyLearnRedirect />} />
        <Route path="/shop" element={<Navigate to="/app/shop" replace />} />
        <Route path="/league" element={<Navigate to="/app/league" replace />} />
        <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
        <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
        <Route path="/settings/profile" element={<Navigate to="/app/settings/profile" replace />} />
        <Route path="/settings/security" element={<Navigate to="/app/settings/security" replace />} />
        <Route path="/settings/daily-goals" element={<Navigate to="/app/settings/daily-goals" replace />} />
        <Route path="/lesson/:id" element={<LegacyLessonRedirect />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {isAppRoute && !hideNav && <BottomNav />}
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
