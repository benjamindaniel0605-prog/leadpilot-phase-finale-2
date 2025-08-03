import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Plus, Edit, Copy, Lock } from "lucide-react";
import type { Template } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

export default function TemplatesSection() {
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const { user } = useAuth();

  const planHierarchy = {
    free: 1,
    starter: 5,
    pro: 15,
    growth: 30
  };

  const userPlan = user?.plan || "free";
  const userLimit = planHierarchy[userPlan as keyof typeof planHierarchy];

  const categories = [
    { id: "all", label: `Tous (${templates.length}/${userLimit})` },
    { id: "free", label: "Free (1/1)" },
    { id: "starter", label: "Starter (5/5)", disabled: userPlan === "free" },
    { id: "pro", label: "Pro (15/15)", disabled: !["pro", "growth"].includes(userPlan) },
    { id: "growth", label: "Growth (30/30)", disabled: userPlan !== "growth" }
  ];

  const filteredTemplates = activeCategory === "all" 
    ? templates 
    : templates.filter((template: Template) => template.plan === activeCategory);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="grid lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Templates d'Emails</h2>
          <p className="text-gray-600">30 templates optimisés avec variations IA</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Bot className="h-4 w-4 mr-2" />
            Générer Variation IA
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Template
          </Button>
        </div>
      </div>

      {/* Template Categories */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex space-x-4 overflow-x-auto">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "ghost"}
                onClick={() => !category.disabled && setActiveCategory(category.id)}
                disabled={category.disabled}
                className={`whitespace-nowrap ${category.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {category.label}
                {category.disabled && <Lock className="h-3 w-3 ml-1" />}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-2 text-center py-12">
            <p className="text-gray-500 mb-4">Aucun template disponible pour cette catégorie.</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Créer un template
            </Button>
          </div>
        ) : (
          filteredTemplates.map((template: Template) => {
            const isLocked = !["free", "starter", "pro", "growth"].slice(0, 
              Object.keys(planHierarchy).indexOf(userPlan) + 1
            ).includes(template.plan);

            return (
              <Card 
                key={template.id} 
                className={`${isLocked ? 'opacity-60' : ''} hover:shadow-lg transition-shadow`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary">{template.plan}</Badge>
                        {isLocked && <Lock className="h-4 w-4 text-amber-600" />}
                      </div>
                    </div>
                    {!isLocked && (
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Template Preview */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="text-sm text-gray-700">
                      <div className="mb-2">
                        <strong>Objet:</strong> {template.subject}
                      </div>
                      <div className="mb-3 border-t pt-3">
                        <div className="whitespace-pre-line text-sm">
                          {isLocked ? (
                            <div className="text-gray-400">
                              {template.content.substring(0, 100)}...
                              <p className="mt-2 text-amber-600">Contenu verrouillé</p>
                            </div>
                          ) : (
                            template.content
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Template Variables */}
                  {!isLocked && template.variables && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Variables disponibles:</h4>
                      <div className="flex flex-wrap gap-2">
                        {(template.variables as string[]).map((variable, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            [{variable}]
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Template Stats */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    {!isLocked ? (
                      <>
                        <div className="flex space-x-4 text-sm text-gray-600">
                          <span>Utilisé: {template.timesUsed} fois</span>
                          <span>Taux ouverture: {template.openRate || 0}%</span>
                        </div>
                        <Button size="sm">
                          Utiliser
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="text-sm text-gray-500">
                          Débloque avec le plan {template.plan}
                        </span>
                        <Button size="sm" variant="secondary">
                          Upgrader
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
