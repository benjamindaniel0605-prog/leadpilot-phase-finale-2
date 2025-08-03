import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  Users, 
  Mail, 
  Send, 
  GitBranch, 
  Calendar, 
  Settings, 
  Rocket,
  Crown
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const { user } = useAuth();

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "leads", label: "Leads", icon: Users },
    { id: "templates", label: "Templates", icon: Mail },
    { id: "campaigns", label: "Campagnes", icon: Send },
    { id: "sequences", label: "Séquences", icon: GitBranch },
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
  const leadsUsage = (user?.leadsUsed || 0) / currentLimits.leads * 100;

  return (
    <aside className="w-64 bg-card shadow-lg border-r border-border">
      <div className="p-6">
        <div className="flex items-center mb-8">
          <Rocket className="h-8 w-8 text-primary mr-3" />
          <span className="text-xl font-bold text-foreground">LeadPilot</span>
        </div>
        
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                activeSection === item.id
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
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
              {user?.leadsUsed || 0}/{currentLimits.leads}
            </span>
          </div>
          <Progress value={leadsUsage} className="mb-2" />
          <p className="text-xs text-primary/70 mb-3">
            {user?.leadsUsed || 0} leads utilisés ce mois
          </p>
          <Button 
            size="sm" 
            className="w-full"
            onClick={() => onSectionChange("settings")}
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrader
          </Button>
        </div>
      </div>
    </aside>
  );
}
