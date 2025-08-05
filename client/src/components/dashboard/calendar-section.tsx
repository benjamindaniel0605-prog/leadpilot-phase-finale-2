import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Settings, Calendar, Clock, Video, Phone, ChevronLeft, ChevronRight, Copy, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Booking } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function CalendarSection() {
  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showNewBookingDialog, setShowNewBookingDialog] = useState(false);
  
  // États pour le formulaire de création de RDV
  const [newBooking, setNewBooking] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '30',
    meetingType: 'video'
  });
  const [duration, setDuration] = useState("30");
  const [customDuration, setCustomDuration] = useState("");
  const [availableSlots, setAvailableSlots] = useState({
    monday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    tuesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    wednesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    thursday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    friday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    saturday: { enabled: false, startTime: "10:00", endTime: "16:00" },
    sunday: { enabled: false, startTime: "10:00", endTime: "16:00" }
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { label: "Programmé", variant: "outline" as const, color: "text-blue-700" },
      confirmed: { label: "Confirmé", variant: "default" as const, color: "text-emerald-700" },
      completed: { label: "Terminé", variant: "secondary" as const, color: "text-gray-700" },
      cancelled: { label: "Annulé", variant: "destructive" as const, color: "text-red-700" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    return <Badge variant={config.variant} className={config.color}>{config.label}</Badge>;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getCurrentMonthName = () => {
    return currentMonth.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric'
    });
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce RDV ?')) return;
    
    try {
      const response = await apiRequest('DELETE', `/api/bookings/${bookingId}`);
      if (response.ok) {
        toast({
          title: "RDV supprimé",
          description: "Le rendez-vous a été supprimé avec succès.",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le RDV.",
        variant: "destructive",
      });
    }
  };

  const handleConversionUpdate = async (bookingId: string, conversionStatus: string) => {
    try {
      const response = await apiRequest('PATCH', `/api/bookings/${bookingId}/conversion`, {
        conversionStatus
      });
      if (response.ok) {
        toast({
          title: "Statut mis à jour",
          description: conversionStatus === 'converted' 
            ? "RDV marqué comme converti !" 
            : "RDV marqué comme non concluant.",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le statut.",
        variant: "destructive",
      });
    }
  };

  const handleCreateBooking = async () => {
    if (!newBooking.title || !newBooking.date || !newBooking.time) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir au minimum le titre, la date et l'heure.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Créer les dates de début et fin
      const startDateTime = new Date(`${newBooking.date}T${newBooking.time}`);
      const endDateTime = new Date(startDateTime.getTime() + parseInt(newBooking.duration) * 60000);

      const response = await apiRequest('POST', '/api/bookings', {
        title: newBooking.title,
        description: newBooking.description,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        meetingType: newBooking.meetingType,
        status: 'scheduled'
      });

      if (response.ok) {
        toast({
          title: "RDV créé",
          description: "Le rendez-vous a été créé avec succès.",
        });
        setShowNewBookingDialog(false);
        setNewBooking({
          title: '',
          description: '',
          date: '',
          time: '',
          duration: '30',
          meetingType: 'video'
        });
        queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le RDV.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="lg:col-span-2 h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Calendrier de Booking</h2>
          <p className="text-muted-foreground">Gérez vos créneaux et RDV prospects</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showNewBookingDialog} onOpenChange={setShowNewBookingDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau RDV
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">Nouveau rendez-vous</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-white">Titre</Label>
                  <Input 
                    id="title" 
                    value={newBooking.title}
                    onChange={(e) => setNewBooking({...newBooking, title: e.target.value})}
                    placeholder="Ex: Entretien commercial" 
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-white">Description</Label>
                  <Textarea 
                    id="description" 
                    value={newBooking.description}
                    onChange={(e) => setNewBooking({...newBooking, description: e.target.value})}
                    placeholder="Détails du rendez-vous..." 
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date" className="text-white">Date</Label>
                    <Input 
                      id="date" 
                      type="date" 
                      value={newBooking.date}
                      onChange={(e) => setNewBooking({...newBooking, date: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="time" className="text-white">Heure</Label>
                    <Input 
                      id="time" 
                      type="time" 
                      value={newBooking.time}
                      onChange={(e) => setNewBooking({...newBooking, time: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rdvDuration" className="text-white">Durée</Label>
                    <Select value={newBooking.duration} onValueChange={(value) => setNewBooking({...newBooking, duration: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue placeholder="Durée" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="15" className="text-white hover:bg-gray-700">15 min</SelectItem>
                        <SelectItem value="30" className="text-white hover:bg-gray-700">30 min</SelectItem>
                        <SelectItem value="45" className="text-white hover:bg-gray-700">45 min</SelectItem>
                        <SelectItem value="60" className="text-white hover:bg-gray-700">1h</SelectItem>
                        <SelectItem value="90" className="text-white hover:bg-gray-700">1h30</SelectItem>
                        <SelectItem value="120" className="text-white hover:bg-gray-700">2h</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="meetingType" className="text-white">Type</Label>
                    <Select value={newBooking.meetingType} onValueChange={(value) => setNewBooking({...newBooking, meetingType: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="video" className="text-white hover:bg-gray-700">Visio</SelectItem>
                        <SelectItem value="phone" className="text-white hover:bg-gray-700">Téléphone</SelectItem>
                        <SelectItem value="in-person" className="text-white hover:bg-gray-700">Présentiel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleCreateBooking}
                >
                  Créer le RDV
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
            <DialogTrigger asChild>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Configurer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">Configuration du calendrier</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="duration" className="text-white text-sm font-medium">Durée par défaut</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue className="text-white" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="15" className="text-white hover:bg-gray-700">15 min</SelectItem>
                      <SelectItem value="30" className="text-white hover:bg-gray-700">30 min</SelectItem>
                      <SelectItem value="45" className="text-white hover:bg-gray-700">45 min</SelectItem>
                      <SelectItem value="60" className="text-white hover:bg-gray-700">1h</SelectItem>
                      <SelectItem value="90" className="text-white hover:bg-gray-700">1h30</SelectItem>
                      <SelectItem value="120" className="text-white hover:bg-gray-700">2h</SelectItem>
                      <SelectItem value="custom" className="text-white hover:bg-gray-700">Personnalisé</SelectItem>
                    </SelectContent>
                  </Select>
                  {duration === "custom" && (
                    <div className="mt-3">
                      <Input
                        id="customDuration"
                        type="number"
                        placeholder="Durée en minutes"
                        value={customDuration}
                        onChange={(e) => setCustomDuration(e.target.value)}
                        min="5"
                        max="480"
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-white text-sm font-medium">Horaires de disponibilité</Label>
                  <div className="space-y-2 mt-3">
                    {[
                      { key: 'monday', label: 'Lun' },
                      { key: 'tuesday', label: 'Mar' },
                      { key: 'wednesday', label: 'Mer' },
                      { key: 'thursday', label: 'Jeu' },
                      { key: 'friday', label: 'Ven' },
                      { key: 'saturday', label: 'Sam' },
                      { key: 'sunday', label: 'Dim' }
                    ].map(day => (
                      <div key={day.key} className="bg-gray-800 border border-gray-600 rounded p-3">
                        <label className="flex items-center space-x-3 mb-2">
                          <input 
                            type="checkbox" 
                            checked={availableSlots[day.key as keyof typeof availableSlots].enabled}
                            onChange={(e) => setAvailableSlots(prev => ({
                              ...prev,
                              [day.key]: { ...prev[day.key as keyof typeof prev], enabled: e.target.checked }
                            }))}
                            className="w-4 h-4"
                          />
                          <span className="text-white font-medium">{day.label}</span>
                        </label>
                        {availableSlots[day.key as keyof typeof availableSlots].enabled && (
                          <div className="flex items-center space-x-2 ml-7">
                            <Input
                              type="time"
                              value={availableSlots[day.key as keyof typeof availableSlots].startTime}
                              onChange={(e) => setAvailableSlots(prev => ({
                                ...prev,
                                [day.key]: { ...prev[day.key as keyof typeof prev], startTime: e.target.value }
                              }))}
                              className="bg-gray-700 border-gray-500 text-white text-sm"
                            />
                            <span className="text-gray-400">à</span>
                            <Input
                              type="time"
                              value={availableSlots[day.key as keyof typeof availableSlots].endTime}
                              onChange={(e) => setAvailableSlots(prev => ({
                                ...prev,
                                [day.key]: { ...prev[day.key as keyof typeof prev], endTime: e.target.value }
                              }))}
                              className="bg-gray-700 border-gray-500 text-white text-sm"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                  onClick={() => setShowConfigDialog(false)}
                >
                  Sauvegarder
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">RDV ce mois</p>
                <div className="text-2xl font-bold">{bookingsThisMonth}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Configuration */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Durée des RDV configurée
                </label>
                <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                  {duration === "custom" && customDuration ? `${customDuration} minutes` : `${duration} minutes`} par défaut
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Créneaux disponibles
                </label>
                <div className="space-y-1">
                  {Object.entries(availableSlots).map(([key, slot]) => {
                    const dayNames = {
                      monday: 'Lundi',
                      tuesday: 'Mardi', 
                      wednesday: 'Mercredi',
                      thursday: 'Jeudi',
                      friday: 'Vendredi',
                      saturday: 'Samedi',
                      sunday: 'Dimanche'
                    };
                    return (
                      <div key={key} className={`text-sm p-1 rounded ${slot.enabled ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                        {slot.enabled ? '✓' : '✗'} {dayNames[key as keyof typeof dayNames]} {slot.enabled ? `${slot.startTime}-${slot.endTime}` : 'Indisponible'}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Calendar Link avec restriction de plan */}
              {['starter', 'pro', 'growth'].includes((user as any)?.plan || 'free') ? (
                <div className="p-4 bg-primary/5 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-primary">Lien de booking</h4>
                    <Badge variant="outline" className="text-xs">Starter+</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Partagez ce lien pour que vos prospects puissent réserver un créneau
                  </p>
                  <div className="flex items-center space-x-2">
                    <Input 
                      value={`https://leadpilot.com/book/${user?.id || 'user123'}`}
                      readOnly
                      className="text-sm text-primary bg-white border-primary/20"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(`https://leadpilot.com/book/${user?.id || 'user123'}`);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-100 rounded-lg border border-gray-300">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-700">Lien de booking</h4>
                    <Badge variant="secondary" className="text-xs">Starter+</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Les liens de prise de rendez-vous sont disponibles à partir du plan Starter.
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    Upgrader vers Starter
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Calendar View & Bookings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>RDV à venir</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium text-foreground capitalize">
                    {getCurrentMonthName()}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Aucun RDV programmé pour le moment.</p>
                  <p className="text-sm text-muted-foreground">
                    Partagez votre lien de booking pour recevoir des demandes de RDV.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking: Booking) => (
                    <div 
                      key={booking.id} 
                      className={`border rounded-lg p-4 relative ${
                        booking.status === 'confirmed' ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100' :
                        booking.status === 'scheduled' ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100' :
                        booking.status === 'completed' ? 'border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100' :
                        'border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className={`${
                              booking.status === 'confirmed' ? 'bg-emerald-600' :
                              booking.status === 'scheduled' ? 'bg-blue-600' :
                              'bg-gray-600'
                            } text-white`}>
                              {getInitials(booking.title)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium text-foreground">{booking.title}</h4>
                            <p className="text-sm text-muted-foreground">{booking.description}</p>
                          </div>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground space-x-4">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(booking.startTime.toString())}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatTime(booking.startTime.toString())} - {formatTime(booking.endTime.toString())}
                        </span>
                        <span className="flex items-center">
                          {booking.meetingType === 'video' ? (
                            <Video className="h-4 w-4 mr-1" />
                          ) : (
                            <Phone className="h-4 w-4 mr-1" />
                          )}
                          {booking.meetingType === 'video' ? 'Visio' : 'Téléphone'}
                        </span>
                      </div>
                      
                      {/* Boutons d'action */}
                      <div className="mt-4 flex justify-between items-center">
                        <div className="flex gap-2">
                          {booking.status === 'completed' && !booking.conversionStatus && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleConversionUpdate(booking.id, 'converted')}
                              >
                                ✅ Converti
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleConversionUpdate(booking.id, 'not_converted')}
                              >
                                ❌ Non concluant
                              </Button>
                            </>
                          )}
                          {booking.conversionStatus && (
                            <span className={`text-sm px-2 py-1 rounded ${
                              booking.conversionStatus === 'converted' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {booking.conversionStatus === 'converted' ? '✅ Conversion réussie' : '❌ Non concluant'}
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteBooking(booking.id)}
                        >
                          🗑️ Supprimer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Calendar Stats */}
              <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{bookings.length}</div>
                  <div className="text-sm text-muted-foreground">RDV ce mois</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    {bookings.filter(b => b.status === 'confirmed').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Confirmés</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {bookings.length > 0 ? Math.round((bookings.filter(b => b.status === 'completed').length / bookings.length) * 100) : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Taux show-up</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
