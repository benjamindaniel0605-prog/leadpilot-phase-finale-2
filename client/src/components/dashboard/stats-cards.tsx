import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Mail, Eye, Calendar } from "lucide-react";

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/analytics/stats"],
  });

  const statCards = [
    {
      title: "Leads Générés",
      value: stats?.leadsGenerated || 0,
      icon: Users,
      change: "+12%",
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Emails Envoyés",
      value: stats?.emailsSent || 0,
      icon: Mail,
      change: "+25%",
      color: "bg-emerald-100 text-emerald-600"
    },
    {
      title: "Taux d'Ouverture",
      value: `${stats?.openRate || 0}%`,
      icon: Eye,
      change: "+5%",
      color: "bg-amber-100 text-amber-600"
    },
    {
      title: "RDV Bookés",
      value: stats?.meetingsBooked || 0,
      icon: Calendar,
      change: "+100%",
      color: "bg-purple-100 text-purple-600"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-emerald-600 text-sm">{stat.change}</span>
              <span className="text-gray-500 text-sm ml-2">vs mois dernier</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
