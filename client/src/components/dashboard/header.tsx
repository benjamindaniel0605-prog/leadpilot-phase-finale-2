import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

interface HeaderProps {
  activeSection: string;
}

const sectionTitles = {
  dashboard: { title: "Dashboard", subtitle: "Aperçu de vos campagnes et performances" },
  leads: { title: "Gestion des Leads", subtitle: "Gérez vos prospects et leur scoring IA" },
  templates: { title: "Templates d'Emails", subtitle: "30 templates optimisés avec variations IA" },
  campaigns: { title: "Campagnes Email", subtitle: "Créez et gérez vos campagnes d'emailing" },
  sequences: { title: "Séquences Multi-étapes", subtitle: "Automatisez vos follow-ups avec des séquences intelligentes" },
  calendar: { title: "Calendrier de Booking", subtitle: "Gérez vos créneaux et RDV prospects" },
  analytics: { title: "Statistiques & Analytics", subtitle: "Analysez vos performances de prospection" },
  settings: { title: "Paramètres", subtitle: "Configurez votre compte et intégrations" },
};

export default function Header({ activeSection }: HeaderProps) {
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const currentSection = sectionTitles[activeSection as keyof typeof sectionTitles] || sectionTitles.dashboard;

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    return "U";
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{currentSection.title}</h1>
          <p className="text-gray-600">{currentSection.subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.profileImageUrl} />
              <AvatarFallback className="bg-primary text-white text-sm">
                {getInitials(user?.firstName, user?.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <span className="text-gray-700 font-medium">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email || "Utilisateur"
                }
              </span>
              <button 
                onClick={handleLogout}
                className="block text-sm text-gray-500 hover:text-gray-700"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
