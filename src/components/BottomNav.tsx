import { Home, BookOpen, ShoppingBag, Trophy, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const tabs = [
  { path: "/app", icon: Home, label: "Ana Sayfa" },
  { path: "/app/learn", icon: BookOpen, label: "Öğren" },
  { path: "/app/shop", icon: ShoppingBag, label: "Mağaza" },
  { path: "/app/league", icon: Trophy, label: "Lig" },
  { path: "/app/profile", icon: User, label: "Profil" },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around">
        {tabs.map((tab) => {
          const isActive =
            location.pathname === tab.path ||
            (tab.path !== "/app" && location.pathname.startsWith(`${tab.path}/`));

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-colors ${
                isActive ? "text-flamingo" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[11px] font-bold">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
