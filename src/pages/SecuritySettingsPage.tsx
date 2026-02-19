import StatsBar from "../components/StatsBar";
import { ArrowLeft, Shield, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getStoredSecuritySettings, saveSecuritySettings } from "@/lib/account";
import { useState } from "react";

export default function SecuritySettingsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [security, setSecurity] = useState(getStoredSecuritySettings);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/app/settings");
  };

  const handleSecuritySwitch = (key: "twoFactorAuth" | "loginAlerts", value: boolean) => {
    const next = { ...security, [key]: value };
    setSecurity(next);
    saveSecuritySettings(next);

    toast({
      title: value ? "Özellik aktif edildi" : "Özellik kapatıldı",
      description:
        key === "twoFactorAuth" ? "İki adımlı doğrulama ayarı güncellendi." : "Giriş uyarıları ayarı güncellendi.",
    });
  };

  const handlePasswordReset = () => {
    const next = { ...security, passwordLastUpdated: "Şimdi" };
    setSecurity(next);
    saveSecuritySettings(next);

    toast({
      title: "Şifre güncelleme talebi oluşturuldu",
      description: "Şifreni değiştirme adımları e-posta adresine gönderildi.",
    });
  };

  return (
    <div className="pb-20">
      <StatsBar />

      <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleBack} className="p-2 rounded-xl bg-muted/40 hover:bg-muted transition-colors" aria-label="Geri dön">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-foreground">Gizlilik ve Güvenlik</h1>
            <p className="text-sm font-semibold text-muted-foreground mt-1">Şifre ve hesap koruma ayarlarını yönet.</p>
          </div>
        </div>

        <section className="bg-card rounded-2xl p-4 shadow-card space-y-4">
          <div className="rounded-xl bg-muted/40 p-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-foreground">İki Adımlı Doğrulama</div>
              <div className="text-xs font-semibold text-muted-foreground">Hesaba girişte ek doğrulama kodu iste</div>
            </div>
            <Switch checked={security.twoFactorAuth} onCheckedChange={(value) => handleSecuritySwitch("twoFactorAuth", value)} />
          </div>

          <div className="rounded-xl bg-muted/40 p-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-foreground">Giriş Uyarıları</div>
              <div className="text-xs font-semibold text-muted-foreground">Yeni cihaz girişlerinde bildirim al</div>
            </div>
            <Switch checked={security.loginAlerts} onCheckedChange={(value) => handleSecuritySwitch("loginAlerts", value)} />
          </div>

          <div className="rounded-xl bg-muted/40 p-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-foreground">Şifre</div>
              <div className="text-xs font-semibold text-muted-foreground">Son güncelleme: {security.passwordLastUpdated}</div>
            </div>
            <Button variant="outline" size="sm" onClick={handlePasswordReset}>
              <KeyRound className="w-4 h-4 mr-2" />
              Güncelle
            </Button>
          </div>
        </section>

        <div className="rounded-2xl p-4 bg-success/10 flex items-start gap-3">
          <Shield className="w-5 h-5 mt-0.5 text-success" />
          <p className="text-xs font-semibold text-muted-foreground">Hesap güvenliği ayarları bu cihazda güvenli şekilde saklanır.</p>
        </div>
      </div>
    </div>
  );
}
