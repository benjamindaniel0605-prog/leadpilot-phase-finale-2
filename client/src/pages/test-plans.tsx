import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';

export default function TestPlans() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const updatePlan = async (plan: string) => {
    try {
      const response = await apiRequest('POST', '/api/admin/update-user-plan', {
        plan
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Plan mis à jour !",
          description: `Votre plan est maintenant ${plan}`,
        });
        
        // Invalider le cache utilisateur pour forcer le rechargement
        await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
        await queryClient.invalidateQueries({ queryKey: ['/api/analytics/stats'] });
        
        // Redirection après un court délai
        setTimeout(() => {
          setLocation('/');
        }, 1500);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le plan",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 bg-slate-800 border-slate-700">
          <h1 className="text-2xl font-bold text-white mb-6">Test des Plans - Admin</h1>
          
          <div className="mb-6 p-4 bg-slate-700 rounded-lg">
            <h2 className="text-lg font-semibold text-white mb-2">Plan actuel</h2>
            <p className="text-slate-300">
              Utilisateur: {user?.email}<br/>
              Plan: <span className="font-bold text-blue-400">{user?.plan || 'Non défini'}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              onClick={() => updatePlan('free')}
              variant="outline"
              className="bg-gray-600 hover:bg-gray-700"
            >
              Free
            </Button>
            <Button 
              onClick={() => updatePlan('starter')}
              variant="outline"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Starter
            </Button>
            <Button 
              onClick={() => updatePlan('pro')}
              variant="outline"
              className="bg-purple-600 hover:bg-purple-700"
            >
              Pro
            </Button>
            <Button 
              onClick={() => updatePlan('growth')}
              variant="outline"
              className="bg-green-600 hover:bg-green-700"
            >
              Growth
            </Button>
          </div>

          <div className="mt-8">
            <Button 
              onClick={() => setLocation('/')}
              className="bg-slate-600 hover:bg-slate-700"
            >
              Retour au Dashboard
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}