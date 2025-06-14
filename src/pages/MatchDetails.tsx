
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Users, 
  Calendar,
  Euro,
  MessageCircle,
  Share2
} from 'lucide-react';

const MatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data - en una app real esto vendría de una API
  const match = {
    id: parseInt(id || '1'),
    sport: 'Fútbol',
    title: 'Partido amistoso',
    location: 'Parque Central',
    fullAddress: 'Calle Principal 123, Madrid',
    date: '2024-06-15',
    time: '18:00',
    duration: '90 min',
    players: '6/10',
    price: 'Gratis',
    organizer: 'Carlos M.',
    organizerRating: 4.8,
    description: 'Partido amistoso de fútbol para pasar un buen rato. Todos los niveles son bienvenidos. Traer agua y ganas de jugar.',
    requirements: ['Calzado deportivo', 'Ropa cómoda', 'Botella de agua'],
    distance: '0.8 km'
  };

  const getSportColor = (sport: string) => {
    const colors: { [key: string]: string } = {
      'Fútbol': 'bg-green-100 text-green-800',
      'Tenis': 'bg-yellow-100 text-yellow-800',
      'Pádel': 'bg-purple-100 text-purple-800',
      'Voleibol': 'bg-orange-100 text-orange-800',
    };
    return colors[sport] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="mr-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">Detalles del partido</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Main Info Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <Badge className={getSportColor(match.sport)}>
                {match.sport}
              </Badge>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-4">{match.title}</h2>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                <div>
                  <div className="font-medium">{formatDate(match.date)}</div>
                  <div className="text-sm text-gray-600">{match.time} • {match.duration}</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-3 text-gray-400" />
                <div>
                  <div className="font-medium">{match.location}</div>
                  <div className="text-sm text-gray-600">{match.fullAddress}</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-3 text-gray-400" />
                <div>
                  <div className="font-medium">{match.players} jugadores</div>
                  <div className="text-sm text-gray-600">4 plazas disponibles</div>
                </div>
              </div>
              
              {match.price && (
                <div className="flex items-center">
                  <Euro className="h-5 w-5 mr-3 text-gray-400" />
                  <div className="font-medium text-blue-600">{match.price}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Organizer Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Organizador</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {match.organizer.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{match.organizer}</div>
                <div className="text-sm text-gray-600">
                  ⭐ {match.organizerRating} • 23 partidos organizados
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contactar organizador
            </Button>
          </CardContent>
        </Card>

        {/* Description Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Descripción</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-gray-700 mb-4">{match.description}</p>
            
            <div>
              <h4 className="font-medium mb-2">Requisitos:</h4>
              <ul className="space-y-1">
                {match.requirements.map((req, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-md mx-auto">
          <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg font-medium shadow-lg">
            Unirse al partido
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MatchDetails;
