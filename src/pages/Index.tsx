
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Home, 
  Calendar, 
  Trophy, 
  User, 
  Plus, 
  MapPin, 
  Clock, 
  Users,
  Search,
  Filter
} from 'lucide-react';
import CreateMatchDialog from '@/components/CreateMatchDialog';
import MatchCard from '@/components/MatchCard';
import NavigationBar from '@/components/NavigationBar';
import FloatingActionButton from '@/components/FloatingActionButton';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateMatch, setShowCreateMatch] = useState(false);

  const recommendedMatches = [
    {
      id: 1,
      sport: 'Fútbol',
      title: 'Partido amistoso',
      location: 'Parque Central',
      date: '2024-06-15',
      time: '18:00',
      players: '6/10',
      price: 'Gratis',
      organizer: 'Carlos M.',
      distance: '0.8 km'
    },
    {
      id: 2,
      sport: 'Tenis',
      title: 'Singles competitivo',
      location: 'Club Deportivo',
      date: '2024-06-16',
      time: '19:30',
      players: '1/2',
      price: '€15',
      organizer: 'Ana L.',
      distance: '1.2 km'
    },
    {
      id: 3,
      sport: 'Pádel',
      title: 'Dobles principiantes',
      location: 'Centro Pádel Sur',
      date: '2024-06-17',
      time: '20:00',
      players: '2/4',
      price: '€12',
      organizer: 'Miguel R.',
      distance: '2.1 km'
    }
  ];

  const upcomingMatches = [
    {
      id: 4,
      sport: 'Voleibol',
      title: 'Torneo local',
      location: 'Polideportivo Norte',
      date: '2024-06-18',
      time: '17:00',
      players: '8/12',
      status: 'confirmed'
    }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">¡Hola, Alex!</h1>
          <p className="text-gray-600">Encuentra tu próximo partido</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" className="hover:bg-blue-50">
            <Search className="h-5 w-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-blue-50">
            <Filter className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Upcoming Matches */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Mis próximos partidos</h2>
        {upcomingMatches.map((match) => (
          <MatchCard key={match.id} match={match} type="upcoming" />
        ))}
      </div>

      {/* Recommended Matches */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Recomendados para ti</h2>
        {recommendedMatches.map((match) => (
          <MatchCard key={match.id} match={match} type="recommended" />
        ))}
      </div>
    </div>
  );

  const renderMyMatches = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mis partidos</h1>
      
      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <Button 
          variant={activeTab === 'created' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('created')}
          className="flex-1 rounded-md"
        >
          Creados
        </Button>
        <Button 
          variant={activeTab === 'joined' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('joined')}
          className="flex-1 rounded-md"
        >
          Unidos
        </Button>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {activeTab === 'created' ? (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No has creado partidos</h3>
            <p className="text-gray-600 mb-4">¡Organiza tu primer partido!</p>
            <Button onClick={() => setShowCreateMatch(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Crear partido
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingMatches.map((match) => (
              <MatchCard key={match.id} match={match} type="joined" />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1>
      
      {/* Profile Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
              <AvatarImage src="/api/placeholder/80/80" />
              <AvatarFallback className="bg-blue-600 text-white text-xl">AM</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Alex Martínez</h2>
              <p className="text-gray-600">alex.martinez@email.com</p>
              <Badge variant="secondary" className="mt-2">Nivel Intermedio</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Favorite Sports */}
      <Card>
        <CardHeader>
          <CardTitle>Deportes favoritos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['Fútbol', 'Tenis', 'Pádel'].map((sport) => (
              <Badge key={sport} variant="outline" className="border-blue-200 text-blue-700">
                {sport}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">15</div>
            <div className="text-sm text-gray-600">Partidos jugados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">12</div>
            <div className="text-sm text-gray-600">Partidos ganados</div>
          </CardContent>
        </Card>
      </div>

      {/* Settings */}
      <div className="space-y-2">
        <Button variant="outline" className="w-full justify-start">
          <User className="h-4 w-4 mr-2" />
          Editar perfil
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <Trophy className="h-4 w-4 mr-2" />
          Deportes favoritos
        </Button>
      </div>
    </div>
  );

  const getCurrentView = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'matches':
        return renderMyMatches();
      case 'profile':
        return renderProfile();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with logo */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center">
          <img 
            src="/lovable-uploads/dcb2ae59-046d-48d7-a15e-284e14f5e723.png" 
            alt="Rundy" 
            className="h-8 w-8 mr-3"
          />
          <span className="text-xl font-bold text-blue-600">Rundy</span>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        {getCurrentView()}
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => setShowCreateMatch(true)} />

      {/* Bottom Navigation */}
      <NavigationBar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Create Match Dialog */}
      <CreateMatchDialog 
        open={showCreateMatch}
        onOpenChange={setShowCreateMatch}
      />
    </div>
  );
};

export default Index;
