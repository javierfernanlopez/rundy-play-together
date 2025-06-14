
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Clock, Users, Calendar } from 'lucide-react';

interface Match {
  id: number;
  sport: string;
  title: string;
  location: string;
  date: string;
  time: string;
  players: string;
  price?: string;
  organizer?: string;
  distance?: string;
  status?: string;
}

interface MatchCardProps {
  match: Match;
  type: 'recommended' | 'upcoming' | 'joined';
}

const MatchCard = ({ match, type }: MatchCardProps) => {
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
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:scale-[1.02]">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={getSportColor(match.sport)}>
                {match.sport}
              </Badge>
              {match.distance && (
                <Badge variant="outline" className="text-xs">
                  {match.distance}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{match.title}</h3>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {match.location}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(match.date)}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {match.time}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <Users className="h-4 w-4 mr-1" />
              {match.players}
            </div>
            {match.price && (
              <div className="text-sm font-medium text-blue-600">
                {match.price}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          {match.organizer && (
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                  {match.organizer.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">{match.organizer}</span>
            </div>
          )}
          
          <Button 
            size="sm" 
            className={`ml-auto ${
              type === 'recommended' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : type === 'upcoming'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {type === 'recommended' ? 'Unirse' : 
             type === 'upcoming' ? 'Confirmado' : 'Ver detalles'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchCard;
