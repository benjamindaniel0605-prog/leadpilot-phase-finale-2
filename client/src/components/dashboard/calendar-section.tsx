import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Settings, Calendar, Clock, Video, Phone, ChevronLeft, ChevronRight, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Booking } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

export default function CalendarSection() {
  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const { user } = useAuth();

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
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Configurer
        </Button>
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
                  Durée des RDV
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option>30 minutes</option>
                  <option>45 minutes</option>
                  <option>60 minutes</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Créneaux disponibles
                </label>
                <div className="space-y-2">
                  {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map((day) => (
                    <label key={day} className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-foreground">{day} 9h-17h</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Calendar Link */}
              <div className="p-4 bg-primary/5 rounded-lg">
                <h4 className="font-medium text-primary mb-2">Lien de booking</h4>
                <div className="flex items-center space-x-2">
                  <Input 
                    value={`leadpilot.com/book/${user?.id || 'user123'}`}
                    readOnly
                    className="text-sm text-primary bg-white border-primary/20"
                  />
                  <Button variant="ghost" size="sm">
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
                  <Button variant="ghost" size="sm">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium text-foreground">Janvier 2024</span>
                  <Button variant="ghost" size="sm">
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
                          {formatDate(booking.startTime)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
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
