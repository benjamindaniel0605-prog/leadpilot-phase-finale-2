import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Database, Users } from "lucide-react";

export function AdminSeedButton() {
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const seedLeadsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/admin/seed-leads");
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
      toast({
        title: "Données créées !",
        description: `${data.message}`,
      });
      setIsSeeding(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer les données d'exemple.",
        variant: "destructive",
      });
      setIsSeeding(false);
    },
  });

  const handleSeedLeads = () => {
    setIsSeeding(true);
    seedLeadsMutation.mutate();
  };

  return (
    <div className="flex space-x-2">
      <Button
        onClick={handleSeedLeads}
        disabled={isSeeding || seedLeadsMutation.isPending}
        variant="outline"
        size="sm"
      >
        <Users className="h-4 w-4 mr-2" />
        {isSeeding ? "Création..." : "Créer des leads d'exemple"}
      </Button>
    </div>
  );
}