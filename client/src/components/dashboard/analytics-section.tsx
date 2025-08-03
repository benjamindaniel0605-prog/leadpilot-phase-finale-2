import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Download, TrendingUp, Mail, Eye, MousePointer, Calendar } from "lucide-react";
import type { Template } from "@shared/schema";

export default function AnalyticsSection() {
  const { data: stats, isLoading: statsLoading } = useQuery<{
    leadsGenerated: number;
    emailsSent: number;
    openRate: number;
    meetingsBooked: number;
  }>({
    queryKey: ["/api/analytics/stats"],
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

  const conversionData = [
    { label: "Leads générés", value: stats?.leadsGenerated || 0, percentage: 100, color: "bg-blue-600" },
    { label: "Emails envoyés", value: stats?.emailsSent || 0, percentage: 80, color: "bg-emerald-600" },
    { label: "Emails ouverts", value: Math.round((stats?.emailsSent || 0) * (stats?.openRate || 0) / 100), percentage: stats?.openRate || 0, color: "bg-amber-600" },
    { label: "Clics", value: Math.round((stats?.emailsSent || 0) * 0.13), percentage: 13, color: "bg-purple-600" },
    { label: "RDV bookés", value: stats?.meetingsBooked || 0, percentage: 13, color: "bg-rose-600" }
  ];

  const keyMetrics = [
    { label: "Taux d'ouverture", value: `${stats?.openRate || 0}%`, color: "bg-blue-50 text-blue-600" },
    { label: "Taux de clic", value: "13%", color: "bg-emerald-50 text-emerald-600" },
    { label: "Taux de réponse", value: "7%", color: "bg-purple-50 text-purple-600" },
    { label: "Conversion RDV", value: "13%", color: "bg-rose-50 text-rose-600" }
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Statistiques & Analytics</h2>
          <p className="text-gray-600">Analysez vos performances de prospection</p>
        </div>
        <div className="flex space-x-3">
          <Select defaultValue="7days">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 derniers jours</SelectItem>
              <SelectItem value="30days">30 derniers jours</SelectItem>
              <SelectItem value="thismonth">Ce mois</SelectItem>
            </SelectContent>
          </Select>
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
                    <span className="font-semibold">{item.value}</span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
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
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Template
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Envoyés
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Taux d'ouverture
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Taux de clic
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Réponses
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {templates.slice(0, 5).map((template: any) => (
                    <tr key={template.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{template.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {template.timesUsed || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900 mr-2">
                            {template.openRate || 0}%
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div 
                              className="bg-emerald-500 h-2 rounded-full" 
                              style={{ width: `${Math.min(template.openRate || 0, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900 mr-2">13%</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: "13%" }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
