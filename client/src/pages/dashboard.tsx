import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import StatsCards from "@/components/dashboard/stats-cards";
import LeadsSection from "@/components/dashboard/leads-section";
import TemplatesSection from "@/components/dashboard/templates-section";
import CampaignsSection from "@/components/dashboard/campaigns-section";
import SequencesSection from "@/components/dashboard/sequences-section";
import CalendarSection from "@/components/dashboard/calendar-section";
import AnalyticsSection from "@/components/dashboard/analytics-section";
import SettingsSection from "@/components/dashboard/settings-section";
import ClosingSection from "@/components/dashboard/closing-section";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="p-6">
            <StatsCards />
            <div className="grid lg:grid-cols-2 gap-6 mt-8">
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">Activité Récente</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-emerald-600 text-sm">+</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-card-foreground">Nouveau lead ajouté</p>
                      <p className="text-xs text-muted-foreground">Il y a 2 heures</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">📧</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-card-foreground">Email envoyé</p>
                      <p className="text-xs text-muted-foreground">Il y a 4 heures</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">Actions Rapides</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setActiveSection("leads")}
                    className="p-4 border border-border rounded-lg hover:bg-muted transition-colors text-center"
                  >
                    <div className="text-primary text-xl mb-2">👥</div>
                    <p className="text-sm font-medium text-card-foreground">Nouveau Lead</p>
                  </button>
                  <button 
                    onClick={() => setActiveSection("campaigns")}
                    className="p-4 border border-border rounded-lg hover:bg-muted transition-colors text-center"
                  >
                    <div className="text-emerald-600 text-xl mb-2">📧</div>
                    <p className="text-sm font-medium text-card-foreground">Nouvelle Campagne</p>
                  </button>
                  <button 
                    onClick={() => setActiveSection("templates")}
                    className="p-4 border border-border rounded-lg hover:bg-muted transition-colors text-center"
                  >
                    <div className="text-amber-600 text-xl mb-2">📝</div>
                    <p className="text-sm font-medium text-card-foreground">Templates</p>
                  </button>
                  <button 
                    onClick={() => setActiveSection("analytics")}
                    className="p-4 border border-border rounded-lg hover:bg-muted transition-colors text-center"
                  >
                    <div className="text-purple-600 text-xl mb-2">📊</div>
                    <p className="text-sm font-medium text-card-foreground">Analytics</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case "leads":
        return <LeadsSection />;
      case "templates":
        return <TemplatesSection />;
      case "campaigns":
        return <CampaignsSection />;
      case "sequences":
        return <SequencesSection />;
      case "closing":
        return <ClosingSection />;
      case "calendar":
        return <CalendarSection />;
      case "analytics":
        return <AnalyticsSection />;
      case "settings":
        return <SettingsSection />;
      default:
        return <div>Section not found</div>;
    }
  };

  return (
    <div className="h-full bg-background flex">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="flex-1 overflow-auto">
        <Header activeSection={activeSection} />
        {renderSection()}
      </main>
    </div>
  );
}
