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

export default function CalendarSection() {
  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showNewBookingDialog, setShowNewBookingDialog] = useState(false);
  const [duration, setDuration] = useState("30");
  const [customDuration, setCustomDuration] = useState("");
  const [availableSlots, setAvailableSlots] = useState({
    monday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    tuesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    wednesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    thursday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    friday: { enabled: true, startTime: "09:00", endTime: "17:00" }
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouveau RDV</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre du RDV</Label>
                  <Input id="title" placeholder="Ex: Entretien commercial avec prospect" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Détails du rendez-vous..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="time">Heure de début</Label>
                    <Input id="time" type="time" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="rdvDuration">Durée du RDV</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir la durée" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 heure</SelectItem>
                      <SelectItem value="90">1h30</SelectItem>
                      <SelectItem value="120">2 heures</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="meetingType">Type de meeting</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Visioconférence</SelectItem>
                      <SelectItem value="phone">Téléphone</SelectItem>
                      <SelectItem value="in-person">En personne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">Créer le RDV</Button>
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configuration du calendrier</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="duration">Durée par défaut des RDV</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                      <SelectItem value="120">2 heures</SelectItem>
                      <SelectItem value="custom">Durée personnalisée</SelectItem>
                    </SelectContent>
                  </Select>
                  {duration === "custom" && (
                    <div className="mt-2">
                      <Label htmlFor="customDuration">Durée en minutes</Label>
                      <Input
                        id="customDuration"
                        type="number"
                        placeholder="Ex: 75"
                        value={customDuration}
                        onChange={(e) => setCustomDuration(e.target.value)}
                        min="5"
                        max="480"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <Label>Jours et horaires disponibles</Label>
                  <div className="space-y-3 mt-2">
                    {[
                      { key: 'monday', label: 'Lundi' },
                      { key: 'tuesday', label: 'Mardi' },
                      { key: 'wednesday', label: 'Mercredi' },
                      { key: 'thursday', label: 'Jeudi' },
                      { key: 'friday', label: 'Vendredi' }
                    ].map(day => (
                      <div key={day.key} className="border rounded-lg p-3 space-y-2">
                        <label className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            checked={availableSlots[day.key as keyof typeof availableSlots].enabled}
                            onChange={(e) => setAvailableSlots(prev => ({
                              ...prev,
                              [day.key]: { ...prev[day.key as keyof typeof prev], enabled: e.target.checked }
                            }))}
                            className="rounded"
                          />
                          <span className="text-sm font-medium text-foreground">{day.label}</span>
                        </label>
                        {availableSlots[day.key as keyof typeof availableSlots].enabled && (
                          <div className="grid grid-cols-2 gap-2 ml-6">
                            <div>
                              <Label className="text-xs">De</Label>
                              <Input
                                type="time"
                                value={availableSlots[day.key as keyof typeof availableSlots].startTime}
                                onChange={(e) => setAvailableSlots(prev => ({
                                  ...prev,
                                  [day.key]: { ...prev[day.key as keyof typeof prev], startTime: e.target.value }
                                }))}
                                className="text-xs"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">À</Label>
                              <Input
                                type="time"
                                value={availableSlots[day.key as keyof typeof availableSlots].endTime}
                                onChange={(e) => setAvailableSlots(prev => ({
                                  ...prev,
                                  [day.key]: { ...prev[day.key as keyof typeof prev], endTime: e.target.value }
                                }))}
                                className="text-xs"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                    💡 Vous pouvez définir des horaires personnalisés pour chaque jour (ex: 7h-19h)
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => setShowConfigDialog(false)}
                >
                  Sauvegarder
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
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
                      friday: 'Vendredi'
                    };
                    return (
                      <div key={key} className={`text-sm p-1 rounded ${slot.enabled ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                        {slot.enabled ? '✓' : '✗'} {dayNames[key as keyof typeof dayNames]} {slot.enabled ? `${slot.startTime}-${slot.endTime}` : 'Indisponible'}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Calendar Link */}
              <div className="p-4 bg-primary/5 rounded-lg">
                <h4 className="font-medium text-primary mb-2">Lien de booking</h4>
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
                      className={`border rounded-lg p-4 ${
                        booking.status === 'confirmed' ? 'border-emerald-200 bg-emerald-50' :
                        booking.status === 'scheduled' ? 'border-blue-200 bg-blue-50' :
                        'border-gray-200 bg-gray-50'
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
