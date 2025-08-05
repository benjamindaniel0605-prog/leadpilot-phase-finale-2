import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Building, Mail, Phone, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

export default function BookMeeting() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  
  const [formData, setFormData] = useState({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    company: '',
    date: '',
    time: '',
    duration: '30',
    meetingType: 'video',
    description: '',
    message: ''
  });

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.contactName || !formData.contactEmail || !formData.date || !formData.time) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Construire la date complète
      const startTime = new Date(`${formData.date}T${formData.time}:00`);
      
      const response = await apiRequest('POST', '/api/bookings/public', {
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        company: formData.company,
        startTime: startTime.toISOString(),
        duration: parseInt(formData.duration),
        meetingType: formData.meetingType,
        description: formData.description || `RDV avec ${formData.contactName}${formData.company ? ` (${formData.company})` : ''}`,
        status: 'scheduled',
        message: formData.message
      });

      if (response.ok) {
        setIsBooked(true);
        toast({
          title: "RDV confirmé !",
          description: "Votre rendez-vous a été programmé avec succès.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de programmer le rendez-vous.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isBooked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">RDV Confirmé !</h2>
            <p className="text-slate-300 mb-4">
              Votre rendez-vous a été programmé avec succès. Vous recevrez une confirmation par email.
            </p>
            <div className="bg-slate-700 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center space-x-2 text-slate-300 mb-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(formData.date).toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-slate-300">
                <Clock className="h-4 w-4" />
                <span>{formData.time} ({formData.duration} min)</span>
              </div>
            </div>
            <Button 
              onClick={() => window.close()}
              className="bg-slate-600 hover:bg-slate-700"
            >
              Fermer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Réserver un rendez-vous</CardTitle>
            <p className="text-slate-300">Programmez un entretien commercial personnalisé</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations contact */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactName" className="text-white">Nom complet *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="contactName"
                      value={formData.contactName}
                      onChange={(e) => handleChange('contactName', e.target.value)}
                      placeholder="Jean Dupont"
                      className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="contactEmail" className="text-white">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleChange('contactEmail', e.target.value)}
                      placeholder="jean@entreprise.com"
                      className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactPhone" className="text-white">Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="contactPhone"
                      value={formData.contactPhone}
                      onChange={(e) => handleChange('contactPhone', e.target.value)}
                      placeholder="06 12 34 56 78"
                      className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="company" className="text-white">Entreprise</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleChange('company', e.target.value)}
                      placeholder="Entreprise SARL"
                      className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Sélection date et heure */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="text-white">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time" className="text-white">Heure *</Label>
                  <Select value={formData.time} onValueChange={(value) => handleChange('time', value)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Sélectionnez l'heure" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot} className="text-white hover:bg-slate-600">
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Options du meeting */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration" className="text-white">Durée</Label>
                  <Select value={formData.duration} onValueChange={(value) => handleChange('duration', value)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="15" className="text-white hover:bg-slate-600">15 min</SelectItem>
                      <SelectItem value="30" className="text-white hover:bg-slate-600">30 min</SelectItem>
                      <SelectItem value="45" className="text-white hover:bg-slate-600">45 min</SelectItem>
                      <SelectItem value="60" className="text-white hover:bg-slate-600">1h</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="meetingType" className="text-white">Type de RDV</Label>
                  <Select value={formData.meetingType} onValueChange={(value) => handleChange('meetingType', value)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="video" className="text-white hover:bg-slate-600">Visioconférence</SelectItem>
                      <SelectItem value="phone" className="text-white hover:bg-slate-600">Téléphone</SelectItem>
                      <SelectItem value="in-person" className="text-white hover:bg-slate-600">Présentiel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Message personnalisé */}
              <div>
                <Label htmlFor="message" className="text-white">Message (optionnel)</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder="Décrivez brièvement l'objet de ce rendez-vous..."
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Programmation...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Confirmer le rendez-vous
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}