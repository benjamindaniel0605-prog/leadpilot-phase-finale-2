import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3, 
  Users, 
  Mail, 
  Send, 
  GitBranch, 
  Calendar, 
  Settings, 
  Rocket,
  Crown,
  Target
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const { user } = useAuth();

  // Get real-time analytics data
  const { data: analytics } = useQuery({
    queryKey: ['/api/analytics/stats'],
    enabled: !!user,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const navigationItems = [
    { id: "dashboard", label: <span translate="no">Dashboard</span>, icon: BarChart3 },
    { id: "leads", label: <span translate="no">Leads</span>, icon: Users },
    { id: "templates", label: <span translate="no">Templates</span>, icon: Mail },
    { id: "custom-emails", label: "Mes Emails", icon: Mail },
    { id: "campaigns", label: "Campagnes", icon: Send },
    { id: "sequences", label: "Séquences", icon: GitBranch },
    { id: "closing", label: <span translate="no">Service de Closing</span>, icon: Target, comingSoon: true },
    { id: "calendar", label: "Calendrier", icon: Calendar },
    { id: "analytics", label: "Statistiques", icon: BarChart3 },
    { id: "settings", label: "Paramètres", icon: Settings },
  ];

  const planLimits = {
    free: { leads: 5, templates: 1, variations: 5 },
    starter: { leads: 100, templates: 5, variations: 100 },
    pro: { leads: 400, templates: 15, variations: 300 },
    growth: { leads: 1500, templates: 30, variations: 1000 }
  };

  const currentLimits = planLimits[user?.plan as keyof typeof planLimits] || planLimits.free;
  const leadsUsed = (analytics as any)?.leadsGenerated || 0;
  const leadsUsage = (leadsUsed / currentLimits.leads) * 100;

  return (
    <aside className="w-64 bg-card shadow-lg border-r border-border">
      <div className="p-6">
        <div className="flex items-center mb-8">
          <Rocket className="h-8 w-8 text-primary mr-3" />
          <span className="text-xl font-bold text-foreground" translate="no">LeadPilot</span>
        </div>
        
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => !item.comingSoon && onSectionChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                activeSection === item.id
                  ? "text-primary bg-primary/10"
                  : item.comingSoon
                  ? "text-muted-foreground/50 cursor-not-allowed"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <div className="flex items-center">
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </div>
              {item.comingSoon && (
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                  Bientôt
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="border-t border-border p-6">
        <div className="bg-primary/5 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary capitalize">
              Plan {user?.plan || 'Free'}
            </span>
            <span className="text-xs bg-primary text-white px-2 py-1 rounded">
              {leadsUsed}/{currentLimits.leads}
            </span>
          </div>
          <Progress value={leadsUsage} className="mb-2" />
          <p className="text-xs text-primary/70 mb-1">
            {leadsUsed} leads utilisés ce mois
          </p>
          <p className="text-xs text-primary/70 mb-3">
            {currentLimits.variations} variations disponibles
          </p>
          <Button 
            size="sm" 
            className="w-full"
            onClick={() => onSectionChange("settings")}
          >
            <Crown className="h-4 w-4 mr-2" />
            <span translate="no">Upgrade</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
