import { LogIn } from "lucide-react";

type LoginPageProps = {
  onGuestLogin: () => void;
};

export default function LoginPage({ onGuestLogin }: LoginPageProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-card rounded-2xl p-6 shadow-card text-center space-y-4">
        <img
          src="/romingo-logo.svg"
          alt="Romingo logosu"
          className="mx-auto h-24 w-auto"
        />
        <p className="text-sm text-muted-foreground font-medium">Uygulamaya devam etmek için giriş yapın.</p>

        <button
          type="button"
          onClick={onGuestLogin}
          className="w-full bg-flamingo text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <LogIn className="w-4 h-4" />
          Misafir olarak giriş yap
        </button>
      </div>
    </div>
  );
}
