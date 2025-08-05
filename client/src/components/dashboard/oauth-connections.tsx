import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, CheckCircle, XCircle, Mail } from "lucide-react";
import { SiGoogle } from "react-icons/si";

interface OAuthStatus {
  google: {
    connected: boolean;
    email: string | null;
  };
}

export default function OAuthConnections() {
  const { toast } = useToast();
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);

  // Récupérer le statut des connexions OAuth
  const { data: oauthStatus, refetch: refetchStatus } = useQuery<OAuthStatus>({
    queryKey: ["/api/oauth/status"],
    refetchInterval: 5000, // Vérifier toutes les 5 secondes
  });

  // Mutation pour déconnecter un provider
  const disconnectMutation = useMutation({
    mutationFn: async (provider: string) => {
      const response = await apiRequest("DELETE", `/api/oauth/${provider}/disconnect`);
      return response.json();
    },
    onSuccess: (data, provider) => {
      refetchStatus();
      toast({
        title: "Déconnexion réussie",
        description: "Votre compte Google a été déconnecté.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de déconnecter le compte.",
        variant: "destructive",
      });
    },
  });

  // Gérer les redirections OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oauthProvider = urlParams.get('oauth');
    const status = urlParams.get('status');

    if (oauthProvider && status) {
      if (status === 'success') {
        toast({
          title: "Connexion réussie !",
          description: "Votre compte Google a été connecté avec succès.",
        });
        refetchStatus();
      } else if (status === 'error') {
        toast({
          title: "Erreur de connexion",
          description: "Impossible de connecter votre compte Google.",
          variant: "destructive",
        });
      }

      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
      setConnectingProvider(null);
    }
  }, [toast, refetchStatus]);

  const handleConnect = async (provider: 'google') => {
    try {
      setConnectingProvider(provider);
      
      const response = await apiRequest("GET", `/api/oauth/${provider}/auth`);
      const data = await response.json();
      
      if (data.authUrl) {
        // Rediriger vers la page d'authentification OAuth
        window.location.href = data.authUrl;
      } else {
        throw new Error("URL d'authentification non reçue");
      }
    } catch (error) {
      console.error(`Erreur connexion ${provider}:`, error);
      setConnectingProvider(null);
      toast({
        title: "Erreur de connexion",
        description: "Vérifiez que votre projet Google Cloud Console autorise ce domaine.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = (provider: string) => {
    disconnectMutation.mutate(provider);
  };

  if (!oauthStatus) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-gray-600">Chargement des connexions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Information */}
      <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <Mail className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-medium text-foreground mb-1">
              Connexion Email
            </h3>
            <p className="text-sm text-muted-foreground">
              Connectez votre compte Gmail pour envoyer des campagnes email directement depuis LeadPilot. 
              Vos identifiants sont sécurisés et utilisés uniquement pour l'envoi d'emails.
            </p>
          </div>
        </div>
      </div>

      {/* Connexion Google */}
      <Card className="border-2 hover:border-primary/30 transition-colors bg-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <SiGoogle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Gmail</h3>
                <p className="text-sm text-muted-foreground">
                  {oauthStatus.google.connected 
                    ? `Connecté avec ${oauthStatus.google.email}`
                    : "Connectez votre compte Gmail pour envoyer des emails"
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {oauthStatus.google.connected ? (
                <>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connecté
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnect('google')}
                    disabled={disconnectMutation.isPending}
                  >
                    {disconnectMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Déconnecter"
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => handleConnect('google')}
                  disabled={connectingProvider === 'google'}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {connectingProvider === 'google' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <SiGoogle className="h-4 w-4 mr-2" />
                  )}
                  Connecter avec Google
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guide d'aide */}
      <div className="bg-muted/20 border border-muted rounded-lg p-4">
        <h4 className="font-medium text-foreground mb-2">
          Comment ça fonctionne ?
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Cliquez sur "Connecter avec Google" pour authoriser LeadPilot</li>
          <li>• Vos emails seront envoyés depuis votre compte Gmail</li>
          <li>• Vous pouvez déconnecter à tout moment</li>
          <li>• Aucun email n'est stocké sur nos serveurs</li>
        </ul>
      </div>
    </div>
  );
}