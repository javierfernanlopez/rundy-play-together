import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Home, Calendar, Trophy, User, Plus, MapPin, Clock, Users, Search, Filter, LogOut, History } from 'lucide-react';
import CreateMatchDialog from '@/components/CreateMatchDialog';
import MatchCard from '@/components/MatchCard';
import NavigationBar from '@/components/NavigationBar';
import FloatingActionButton from '@/components/FloatingActionButton';
import EditProfileDialog from '@/components/EditProfileDialog';
import { useAuth } from '@/hooks/useAuth';
import { useMatches } from '@/hooks/useMatches';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const {
    user,
    signOut
  } = useAuth();
  const {
    loading,
    getUserFutureMatches,
    getUserPastMatches,
    getAvailableMatches
  } = useMatches();
  const {
    profile,
    refetch: refetchProfile
  } = useProfile();
  const {
    toast
  } = useToast();

  // Establecer deportes favoritos como filtros por defecto cuando se carga el perfil
  useEffect(() => {
    if (profile?.favorite_sports && profile.favorite_sports.length > 0) {
      // Convertir los deportes favoritos del perfil a nombres de visualización
      const sportDisplayNames = profile.favorite_sports.map(sport => {
        const sportNames: {
          [key: string]: string;
        } = {
          'football': 'Fútbol',
          'tennis': 'Tenis',
          'padel': 'Pádel',
          'volleyball': 'Voleibol',
          'basketball': 'Baloncesto',
          'badminton': 'Bádminton'
        };
        return sportNames[sport] || sport;
      });
      setSelectedSports(sportDisplayNames);
    }
  }, [profile]);
  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cerrar sesión",
        variant: "destructive"
      });
    }
  };

  // Convert matches to the format expected by MatchCard
  const convertMatches = (matches: any[]) => {
    return matches.map(match => ({
      id: match.id,
      sport: match.sport_type === 'football' ? 'Fútbol' : match.sport_type === 'tennis' ? 'Tenis' : match.sport_type === 'padel' ? 'Pádel' : match.sport_type === 'volleyball' ? 'Voleibol' : match.sport_type === 'basketball' ? 'Baloncesto' : match.sport_type === 'badminton' ? 'Bádminton' : 'Deporte',
      title: match.title,
      location: match.location,
      date: new Date(match.date).toISOString().split('T')[0],
      time: new Date(match.date).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      players: `${match.participants ? match.participants.length : match.current_players}/${match.max_players}`,
      price: match.price > 0 ? `€${match.price}` : 'Gratis',
      organizer: 'Usuario',
      distance: '0.5 km',
      is_creator: match.is_creator,
      is_participant: match.is_participant,
      creator_profile: match.creator_profile
    }));
  };

  // Obtener partidos usando las nuevas funciones
  const userFutureMatches = convertMatches(getUserFutureMatches());
  const userPastMatches = convertMatches(getUserPastMatches());
  const availableMatches = convertMatches(getAvailableMatches());

  // Lista de deportes y partidos recomendados filtrados
  const sports = ['Fútbol', 'Tenis', 'Pádel', 'Voleibol', 'Baloncesto', 'Bádminton'];
  const filteredRecommendedMatches = selectedSports.length > 0 ? availableMatches.filter(match => selectedSports.includes(match.sport)) : availableMatches;

  // Filtrar partidos para las pestañas - separando futuros y pasados
  const createdFutureMatches = userFutureMatches.filter(match => match.is_creator);
  const createdPastMatches = userPastMatches.filter(match => match.is_creator);
  const joinedFutureMatches = userFutureMatches.filter(match => !match.is_creator && match.is_participant);
  const joinedPastMatches = userPastMatches.filter(match => !match.is_creator && match.is_participant);
  const getSportToggleClasses = (sport: string) => {
    const sportClasses: {
      [key: string]: string;
    } = {
      'Fútbol': 'text-green-800 border-green-300 hover:bg-green-100 data-[state=on]:bg-green-500 data-[state=on]:text-white data-[state=on]:border-green-500',
      'Tenis': 'text-yellow-800 border-yellow-300 hover:bg-yellow-100 data-[state=on]:bg-yellow-400 data-[state=on]:text-white data-[state=on]:border-yellow-400',
      'Pádel': 'text-purple-800 border-purple-300 hover:bg-purple-100 data-[state=on]:bg-purple-500 data-[state=on]:text-white data-[state=on]:border-purple-500',
      'Voleibol': 'text-orange-800 border-orange-300 hover:bg-orange-100 data-[state=on]:bg-orange-400 data-[state=on]:text-white data-[state=on]:border-orange-400',
      'Baloncesto': 'text-red-800 border-red-300 hover:bg-red-100 data-[state=on]:bg-red-500 data-[state=on]:text-white data-[state=on]:border-red-500',
      'Bádminton': 'text-blue-800 border-blue-300 hover:bg-blue-100 data-[state=on]:bg-blue-500 data-[state=on]:text-white data-[state=on]:border-blue-500'
    };
    return sportClasses[sport] || 'text-gray-800 border-gray-300 hover:bg-gray-100 data-[state=on]:bg-gray-500 data-[state=on]:text-white data-[state=on]:border-gray-500';
  };
  const renderDashboard = () => <div className="space-y-6">
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
          
          <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-red-50">
            <LogOut className="h-5 w-5 text-red-600" />
          </Button>
        </div>
      </div>

      {/* Sport Filters */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Filtrar por deporte</h2>
        <ScrollArea className="w-full whitespace-nowrap">
          <ToggleGroup type="multiple" variant="outline" value={selectedSports} onValueChange={setSelectedSports} className="flex gap-2 pb-3">
            {sports.map(sport => <ToggleGroupItem key={sport} value={sport} aria-label={`Toggle ${sport}`} className={`rounded-full px-3 py-1 h-8 text-sm ${getSportToggleClasses(sport)}`}>
                {sport}
              </ToggleGroupItem>)}
          </ToggleGroup>
          <ScrollBar orientation="horizontal" className="h-2" />
        </ScrollArea>
      </div>

      {/* Loading State */}
      {loading && <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando partidos...</p>
        </div>}

      {/* Upcoming Matches */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Mis próximos partidos</h2>
        {userFutureMatches.length > 0 ? userFutureMatches.map(match => <MatchCard key={match.id} match={match} type="upcoming" />) : <Card className="p-6 text-center">
            <p className="text-gray-500">No tienes partidos programados</p>
          </Card>}
      </div>

      {/* Recommended Matches */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Partidos disponibles</h2>
        {!loading && filteredRecommendedMatches.length > 0 ? filteredRecommendedMatches.map(match => <MatchCard key={match.id} match={match} type="recommended" />) : !loading ? <Card className="p-6 text-center">
            <p className="text-gray-500">
              {selectedSports.length > 0 ? 'No hay partidos disponibles para los deportes seleccionados.' : 'No hay partidos disponibles'}
            </p>
            <Button onClick={() => setShowCreateMatch(true)} className="mt-4 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Crear el primer partido
            </Button>
          </Card> : null}
      </div>
    </div>;
  const renderMyMatches = () => <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mis partidos</h1>
      
      {/* Tabs */}
      <Tabs defaultValue="created" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="created">Creados</TabsTrigger>
          <TabsTrigger value="joined">Unidos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="created" className="space-y-6 mt-6">
          {/* Partidos creados futuros */}
          <div className="space-y-3">
            <h3 className="text-md font-semibold text-gray-900 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Próximos partidos
            </h3>
            {createdFutureMatches.length > 0 ? createdFutureMatches.map(match => <MatchCard key={match.id} match={match} type="created" />) : <Card className="p-4 text-center">
                <p className="text-gray-500 text-sm">No tienes partidos futuros creados</p>
              </Card>}
          </div>

          {/* Partidos creados pasados */}
          <div className="space-y-3">
            <h3 className="text-md font-semibold text-gray-900 flex items-center">
              <History className="h-4 w-4 mr-2" />
              Partidos pasados
            </h3>
            {createdPastMatches.length > 0 ? createdPastMatches.map(match => <MatchCard key={match.id} match={match} type="created" />) : <Card className="p-4 text-center">
                <p className="text-gray-500 text-sm">No tienes partidos pasados creados</p>
              </Card>}
          </div>

          {/* Empty state si no hay ningún partido */}
          {createdFutureMatches.length === 0 && createdPastMatches.length === 0 && <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No has creado partidos</h3>
              <p className="text-gray-600 mb-4">¡Organiza tu primer partido!</p>
              <Button onClick={() => setShowCreateMatch(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Crear partido
              </Button>
            </div>}
        </TabsContent>
        
        <TabsContent value="joined" className="space-y-6 mt-6">
          {/* Partidos unidos futuros */}
          <div className="space-y-3">
            <h3 className="text-md font-semibold text-gray-900 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Próximos partidos
            </h3>
            {joinedFutureMatches.length > 0 ? joinedFutureMatches.map(match => <MatchCard key={match.id} match={match} type="joined" />) : <Card className="p-4 text-center">
                <p className="text-gray-500 text-sm">No tienes partidos futuros programados</p>
              </Card>}
          </div>

          {/* Partidos unidos pasados */}
          <div className="space-y-3">
            <h3 className="text-md font-semibold text-gray-900 flex items-center">
              <History className="h-4 w-4 mr-2" />
              Partidos pasados
            </h3>
            {joinedPastMatches.length > 0 ? joinedPastMatches.map(match => <MatchCard key={match.id} match={match} type="joined" />) : <Card className="p-4 text-center">
                <p className="text-gray-500 text-sm">No tienes partidos pasados</p>
              </Card>}
          </div>

          {/* Empty state si no hay ningún partido */}
          {joinedFutureMatches.length === 0 && joinedPastMatches.length === 0 && <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No te has unido a partidos</h3>
              <p className="text-gray-600">¡Únete a tu primer partido!</p>
            </div>}
        </TabsContent>
      </Tabs>
    </div>;
  const renderProfile = () => <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1>
      
      {/* Profile Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
              <AvatarImage src="/api/placeholder/80/80" />
              <AvatarFallback className="bg-blue-600 text-white text-xl">
                {user?.user_metadata?.full_name?.split(' ').map((n: string) => n[0]).join('') || user?.email?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {user?.user_metadata?.full_name || 'Usuario'}
              </h2>
              <p className="text-gray-600">{user?.email}</p>
              <Badge variant="secondary" className="mt-2">
                {profile?.skill_level ? profile.skill_level === 'beginner' ? 'Principiante' : profile.skill_level === 'intermediate' ? 'Intermedio' : profile.skill_level === 'advanced' ? 'Avanzado' : profile.skill_level === 'expert' ? 'Experto' : 'Principiante' : 'Principiante'}
              </Badge>
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
            {profile?.favorite_sports && profile.favorite_sports.length > 0 ? profile.favorite_sports.map(sport => {
            const sportNames: {
              [key: string]: string;
            } = {
              'football': 'Fútbol',
              'tennis': 'Tenis',
              'padel': 'Pádel',
              'volleyball': 'Voleibol',
              'basketball': 'Baloncesto',
              'badminton': 'Bádminton'
            };
            return <Badge key={sport} variant="outline" className="border-blue-200 text-blue-700">
                    {sportNames[sport] || sport}
                  </Badge>;
          }) : <p className="text-gray-500 text-sm">No has seleccionado deportes favoritos</p>}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{userFutureMatches.length + userPastMatches.length}</div>
            <div className="text-sm text-gray-600">Partidos jugados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{createdFutureMatches.length + createdPastMatches.length}</div>
            <div className="text-sm text-gray-600">Partidos organizados</div>
          </CardContent>
        </Card>
      </div>

      {/* Settings */}
      <div className="space-y-2">
        <EditProfileDialog onProfileUpdate={refetchProfile}>
          <Button variant="outline" className="w-full justify-start">
            <User className="h-4 w-4 mr-2" />
            Editar perfil
          </Button>
        </EditProfileDialog>
        
        <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar sesión
        </Button>
      </div>
    </div>;
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
  return <div className="min-h-screen bg-gray-50">
      {/* Header with logo */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center">
          <img src="/lovable-uploads/dcb2ae59-046d-48d7-a15e-284e14f5e723.png" alt="Rundy" className="h-8 w-8 mr-3" />
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
      <NavigationBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Create Match Dialog */}
      <CreateMatchDialog open={showCreateMatch} onOpenChange={setShowCreateMatch} />
    </div>;
};
export default Index;