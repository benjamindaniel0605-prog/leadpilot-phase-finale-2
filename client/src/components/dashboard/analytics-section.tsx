import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Download, TrendingUp, Mail, Eye, MousePointer, Calendar, CalendarDays } from "lucide-react";
import { format, startOfMonth, endOfMonth, subDays, subMonths, startOfDay, endOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import type { Template } from "@shared/schema";

export default function AnalyticsSection() {
  const [selectedRange, setSelectedRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: subDays(new Date(), 7),
    to: new Date()
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery<{
    leadsGenerated: number;
    emailsSent: number;
    openRate: number;
    clickRate: number;
    responseRate: number;
    meetingsBooked: number;
    meetingConversionRate: number;
    avgScore: number;
  }>({
    queryKey: ["/api/analytics/stats", selectedRange],
  });

  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  if (statsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Calculs des métriques réalistes basées sur les vraies données
  const leadsGenerated = stats?.leadsGenerated || 0;
  const emailsSent = stats?.emailsSent || 0;
  const openRate = stats?.openRate || 0;
  const clickRate = stats?.clickRate || 0;
  const responseRate = stats?.responseRate || 0;
  const meetingsBooked = stats?.meetingsBooked || 0;
  const meetingConversionRate = stats?.meetingConversionRate || 0;

  // Debug pour vérifier les données
  console.log('Analytics Debug:', {
    leadsGenerated,
    emailsSent,
    stats
  });

  // Entonnoir de conversion basé sur les vraies données
  const conversionData = [
    { 
      label: "Leads générés", 
      value: leadsGenerated, 
      percentage: leadsGenerated > 0 ? 100 : 0, 
      color: "bg-blue-600" 
    },
    { 
      label: "Emails envoyés", 
      value: emailsSent, 
      percentage: leadsGenerated > 0 ? Math.round((emailsSent / leadsGenerated) * 100) : 0, 
      color: "bg-emerald-600" 
    },
    { 
      label: "Emails ouverts", 
      value: Math.round((emailsSent * openRate) / 100), 
      percentage: openRate, 
      color: "bg-amber-600" 
    },
    { 
      label: "Clics", 
      value: Math.round((emailsSent * clickRate) / 100), 
      percentage: clickRate, 
      color: "bg-purple-600" 
    },
    { 
      label: "RDV bookés", 
      value: meetingsBooked, 
      percentage: meetingConversionRate, 
      color: "bg-rose-600" 
    }
  ];

  const keyMetrics = [
    { label: "Taux d'ouverture", value: `${openRate}%`, color: "bg-blue-50 text-blue-600" },
    { label: "Taux de clic", value: `${clickRate}%`, color: "bg-emerald-50 text-emerald-600" },
    { label: "Taux de réponse", value: `${responseRate}%`, color: "bg-purple-50 text-purple-600" },
    { label: "Conversion RDV", value: `${meetingConversionRate}%`, color: "bg-rose-50 text-rose-600" }
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Statistiques & Analytics</h2>
          <p className="text-muted-foreground">Analysez vos performances de prospection</p>
        </div>
        <div className="flex space-x-3">
          {/* Sélecteur de période avec calendrier */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-60 justify-start text-left font-normal">
                <CalendarDays className="h-4 w-4 mr-2" />
                {selectedRange.from && selectedRange.to ? (
                  `${format(selectedRange.from, "dd MMM", { locale: fr })} - ${format(selectedRange.to, "dd MMM yyyy", { locale: fr })}`
                ) : (
                  "Sélectionner une période"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-4">
                {/* Raccourcis de période */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      setSelectedRange({
                        from: subDays(today, 7),
                        to: today
                      });
                    }}
                  >
                    7 derniers jours
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      setSelectedRange({
                        from: subDays(today, 30),
                        to: today
                      });
                    }}
                  >
                    30 derniers jours
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      setSelectedRange({
                        from: startOfMonth(today),
                        to: endOfMonth(today)
                      });
                    }}
                  >
                    Ce mois
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      const lastMonth = subMonths(today, 1);
                      setSelectedRange({
                        from: startOfMonth(lastMonth),
                        to: endOfMonth(lastMonth)
                      });
                    }}
                  >
                    Mois dernier
                  </Button>
                </div>

                {/* Instructions de sélection manuelle */}
                <div className="text-sm text-white mb-3 p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded">
                  📅 <strong>Sélection personnalisée :</strong><br />
                  1. Cliquez sur la date de début<br />
                  2. Cliquez sur la date de fin
                </div>

                {/* Navigation du mois */}
                <div className="flex items-center justify-between mb-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  >
                    ←
                  </Button>
                  <h3 className="font-medium">
                    {format(currentMonth, "MMMM yyyy", { locale: fr })}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  >
                    →
                  </Button>
                </div>

                {/* Grille de calendrier dynamique */}
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {/* En-têtes des jours */}
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                    <div key={day} className="p-2 font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                  
                  {/* Dates du mois sélectionné */}
                  {(() => {
                    const year = currentMonth.getFullYear();
                    const month = currentMonth.getMonth();
                    const firstDay = new Date(year, month, 1);
                    const lastDay = new Date(year, month + 1, 0);
                    const daysInMonth = lastDay.getDate();
                    const startDay = (firstDay.getDay() + 6) % 7; // Ajuster pour commencer lundi
                    
                    const cells = [];
                    
                    // Cellules vides pour les jours précédents
                    for (let i = 0; i < startDay; i++) {
                      cells.push(<div key={`empty-${i}`} className="h-8"></div>);
                    }
                    
                    // Cellules des jours du mois
                    for (let day = 1; day <= daysInMonth; day++) {
                      const date = new Date(year, month, day);
                      const isSelected = selectedRange.from && selectedRange.to && 
                        date >= selectedRange.from && date <= selectedRange.to;
                      const isStart = selectedRange.from && 
                        date.toDateString() === selectedRange.from.toDateString();
                      const isEnd = selectedRange.to && 
                        date.toDateString() === selectedRange.to.toDateString();
                      
                      cells.push(
                        <Button
                          key={day}
                          variant={isSelected ? "default" : "ghost"}
                          size="sm"
                          className={`h-8 w-8 p-0 text-xs ${
                            isStart || isEnd ? "bg-primary text-primary-foreground" : 
                            isSelected ? "bg-primary/20" : ""
                          }`}
                          onClick={() => {
                            if (!tempDate) {
                              // Premier clic - définir le début
                              setTempDate(date);
                              setSelectedRange({ from: date, to: null });
                            } else {
                              // Deuxième clic - définir la fin
                              const from = tempDate < date ? tempDate : date;
                              const to = tempDate < date ? date : tempDate;
                              setSelectedRange({ from, to });
                              setTempDate(null);
                            }
                          }}
                        >
                          {day}
                        </Button>
                      );
                    }
                    
                    return cells;
                  })()}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Entonnoir de Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conversionData.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <span className="font-semibold text-foreground">{item.value}</span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {item.percentage}% • Debug: {JSON.stringify(item)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métriques Clés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {keyMetrics.map((metric, index) => (
                <div key={index} className={`text-center p-4 rounded-lg ${metric.color}`}>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="text-sm opacity-80">{metric.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Performance par Template</CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune donnée de template disponible.</p>
              <p className="text-sm text-gray-400 mt-2">
                Créez des campagnes pour voir les statistiques de performance.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-600 to-blue-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Template
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Envoyés
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Taux d'ouverture
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Taux de clic
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Réponses
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {emailsSent === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center">
                        <div className="text-muted-foreground">
                          <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Aucune campagne envoyée pour l'instant</p>
                          <p className="text-xs mt-1">Les statistiques apparaîtront après vos premiers envois</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    templates.slice(0, 5).map((template: any) => (
                      <tr key={template.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-foreground">{template.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          0
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-foreground mr-2">
                              0%
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-foreground mr-2">
                              0%
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          0
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
