import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  Crown,
  Eye,
  EyeOff
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import OAuthConnections from "./oauth-connections";

export default function SettingsSection() {
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    company: ""
  });

  const [emailConfig, setEmailConfig] = useState({
    smtpServer: "",
    port: "587",
    security: "TLS",
    username: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { user, isLoading } = useAuth();

  // Get real-time analytics data for quotas
  const { data: analytics } = useQuery({
    queryKey: ['/api/analytics/stats'],
    enabled: !!user,
  });

  // Get fresh user data for variations count
  const { data: freshUser } = useQuery({
    queryKey: ['/api/auth/user'],
    enabled: !!user,
    refetchInterval: 5000, // Refresh every 5 seconds
  });
  
  // Update form when user data is available
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        password: "••••••••", // Placeholder for security
        company: ""
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: typeof profileForm) => {
      const response = await apiRequest("PUT", "/api/user/profile", profileData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil.",
        variant: "destructive",
      });
    },
  });

  const testEmailConfigMutation = useMutation({
    mutationFn: async (configData: typeof emailConfig) => {
      const response = await apiRequest("POST", "/api/settings/test-email", configData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuration testée",
        description: "La configuration email fonctionne correctement.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur de configuration",
        description: "Impossible de se connecter avec cette configuration.",
        variant: "destructive",
      });
    },
  });

  const planLimits = {
    free: { leads: 5, templates: 1, variations: 5 },
    starter: { leads: 100, templates: 5, variations: 100 },
    pro: { leads: 400, templates: 15, variations: 300 },
    growth: { leads: 1500, templates: 30, variations: 1000 }
  };

  const userPlan = user?.plan || "free";
  const currentLimits = planLimits[userPlan as keyof typeof planLimits];
  
  // Use real analytics data and fresh user data
  const leadsUsed = (analytics as any)?.leadsGenerated || 0;
  const variationsUsed = (freshUser as any)?.aiVariationsUsed || (user as any)?.aiVariationsUsed || 0;
  const leadsUsage = (leadsUsed / currentLimits.leads) * 100;
  const variationsUsage = (variationsUsed / currentLimits.variations) * 100;



  const handleProfileUpdate = () => {
    updateProfileMutation.mutate(profileForm);
  };

  const handleTestEmailConfig = () => {
    testEmailConfigMutation.mutate(emailConfig);
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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Paramètres</h2>
          <p className="text-gray-600">Configurez votre compte et intégrations</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Account Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informations du Compte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                  <Input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                  <Input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <Input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="john.doe@exemple.fr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={profileForm.password}
                    onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                    placeholder="••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    </span>
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Entreprise</label>
                <Input
                  type="text"
                  value={profileForm.company}
                  onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                  placeholder="Mon Entreprise"
                />
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={handleProfileUpdate}
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Connexion Email
              </CardTitle>
              <p className="text-sm text-gray-600">
                Connectez votre compte Google ou Outlook pour envoyer vos campagnes email directement depuis votre boîte mail.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <OAuthConnections />
            </CardContent>
          </Card>


        </div>

        {/* Subscription & Usage */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="h-5 w-5 mr-2" />
                Abonnement Actuel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-white capitalize mb-2">{userPlan}</div>
                <div className="text-gray-600 mb-4">
                  {userPlan === "free" ? "Plan gratuit" : `Plan ${userPlan}`}
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Leads utilisés</span>
                    <span className="font-medium">{leadsUsed}/{currentLimits.leads}</span>
                  </div>
                  <Progress value={leadsUsage} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Templates accessibles</span>
                    <span className="font-medium">1/30</span>
                  </div>
                  <Progress value={(1/30) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Variations utilisées</span>
                    <span className="font-medium">{variationsUsed}/{currentLimits.variations}</span>
                  </div>
                  <Progress value={variationsUsage} className="h-2" />
                </div>
              </div>
              <Button className="w-full">
                <Crown className="h-4 w-4 mr-2" />
                Upgrader vers Starter
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="ghost" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-3" />
                  Exporter mes données
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <HelpCircle className="h-4 w-4 mr-3" />
                  Support client
                </Button>
                <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4 mr-3" />
                  Supprimer mon compte
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* User Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user?.profileImageUrl} />
                  <AvatarFallback className="bg-primary text-white">
                    {getInitials(user?.firstName, user?.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium text-white">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email || "Utilisateur"
                    }
                  </h4>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => window.location.href = "/api/logout"}
              >
                Se déconnecter
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
