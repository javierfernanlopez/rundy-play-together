import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Filter,
  LogOut
} from 'lucide-react';
import CreateMatchDialog from '@/components/CreateMatchDialog';
import MatchCard from '@/components/MatchCard';
import NavigationBar from '@/components/NavigationBar';
import FloatingActionButton from '@/components/FloatingActionButton';
import { useAuth } from '@/hooks/useAuth';
import { useMatches } from '@/hooks/useMatches';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const { user, signOut } = useAuth();
  const { matches, loading } = useMatches();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cerrar sesión",
        variant: "destructive",
      });
    }
  };

  // Convert matches to the format expected by MatchCard
  const convertMatches = (matches: any[]) => {
    return matches.map(match => ({
      id: match.id,
      sport: match.sport_type === 'football' ? 'Fútbol' : 
             match.sport_type === 'tennis' ? 'Tenis' :
             match.sport_type === 'padel' ? 'Pádel' : 
             match.sport_type === 'volleyball' ? 'Voleibol' :
             match.sport_type === 'basketball' ? 'Baloncesto' :
             match.sport_type === 'badminton' ? 'Bádminton' : 'Deporte',
      title: match.title,
      location: match.location,
      date: new Date(match.date).toISOString().split('T')[0],
      time: new Date(match.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      players: `${match.current_players}/${match.max_players}`,
      price: match.price > 0 ? `€${match.price}` : 'Gratis',
      organizer: 'Usuario',
      distance: '0.5 km',
      is_creator: match.is_creator,
      is_participant: match.is_participant
    }));
  };

  // Separar partidos según la participación del usuario
  const userMatches = matches.filter(match => match.is_creator || match.is_participant);
  const availableMatches = matches.filter(match => !match.is_creator && !match.is_participant);

  const upcomingMatches = convertMatches(userMatches);
  const recommendedMatches = convertMatches(availableMatches);

  // Filtrar partidos para las pestañas
  const createdMatches = upcomingMatches.filter(match => match.is_creator);
  const joinedMatches = upcomingMatches.filter(match => !match.is_creator && match.is_participant);

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            ¡Hola, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600">Encuentra tu próximo partido</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" className="hover:bg-blue-50">
            <Search className="h-5 w-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-blue-50">
            <Filter className="h-5 w-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-red-50">
            <LogOut className="h-5 w-5 text-red-600" />
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando partidos...</p>
        </div>
      )}

      {/* Upcoming Matches */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Mis próximos partidos</h2>
        {upcomingMatches.length > 0 ? (
          upcomingMatches.map((match) => (
            <MatchCard key={match.id} match={match} type="upcoming" />
          ))
        ) : (
          <Card className="p-6 text-center">
            <p className="text-gray-500">No tienes partidos programados</p>
          </Card>
        )}
      </div>

      {/* Recommended Matches */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Partidos disponibles</h2>
        {!loading && recommendedMatches.length > 0 ? (
          recommendedMatches.map((match) => (
            <MatchCard key={match.id} match={match} type="recommended" />
          ))
        ) : !loading ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500">No hay partidos disponibles</p>
            <Button onClick={() => setShowCreateMatch(true)} className="mt-4 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Crear el primer partido
            </Button>
          </Card>
        ) : null}
      </div>
    </div>
  );

  const renderMyMatches = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mis partidos</h1>
      
      {/* Tabs */}
      <Tabs defaultValue="created" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="created">Creados</TabsTrigger>
          <TabsTrigger value="joined">Unidos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="created" className="space-y-3 mt-6">
          {createdMatches.length > 0 ? (
            createdMatches.map((match) => (
              <MatchCard key={match.id} match={match} type="created" />
            ))
          ) : (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No has creado partidos</h3>
              <p className="text-gray-600 mb-4">¡Organiza tu primer partido!</p>
              <Button onClick={() => setShowCreateMatch(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Crear partido
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="joined" className="space-y-3 mt-6">
          {joinedMatches.length > 0 ? (
            joinedMatches.map((match) => (
              <MatchCard key={match.id} match={match} type="joined" />
            ))
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No te has unido a partidos</h3>
              <p className="text-gray-600">¡Únete a tu primer partido!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
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
              <AvatarFallback className="bg-blue-600 text-white text-xl">
                {user?.user_metadata?.full_name?.split(' ').map((n: string) => n[0]).join('') || 
                 user?.email?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {user?.user_metadata?.full_name || 'Usuario'}
              </h2>
              <p className="text-gray-600">{user?.email}</p>
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
            <div className="text-2xl font-bold text-blue-600">{upcomingMatches.length}</div>
            <div className="text-sm text-gray-600">Partidos jugados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{upcomingMatches.filter(m => m.is_creator).length}</div>
            <div className="text-sm text-gray-600">Partidos organizados</div>
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
        <Button 
          variant="outline" 
          className="w-full justify-start text-red-600 hover:text-red-700"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar sesión
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
