import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArrowLeft, MapPin, Clock, Users, Calendar, Euro, MessageCircle, Share2, Trash2 } from 'lucide-react';
import { useMatches } from '@/hooks/useMatches';
import { useToast } from '@/hooks/use-toast';
const MatchDetails = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    getMatchById,
    joinMatch,
    leaveMatch,
    deleteMatch
  } = useMatches();
  const {
    toast
  } = useToast();
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  useEffect(() => {
    if (id) {
      loadMatchDetails();
    }
  }, [id]);
  const loadMatchDetails = async () => {
    if (!id) return;
    setLoading(true);
    const {
      data,
      error
    } = await getMatchById(id);
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
      navigate('/');
      return;
    }
    setMatch(data);
    setLoading(false);
  };
  const handleJoinMatch = async () => {
    if (!match) return;
    setActionLoading(true);
    const {
      error
    } = await joinMatch(match.id);
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "¡Te has unido al partido!",
        description: "Ahora formas parte de este partido"
      });
      // Recargar los detalles del partido
      await loadMatchDetails();
    }
    setActionLoading(false);
  };
  const handleLeaveMatch = async () => {
    if (!match) return;
    setActionLoading(true);
    const {
      error
    } = await leaveMatch(match.id);
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Has salido del partido",
        description: "Ya no formas parte de este partido"
      });
      // Recargar los detalles del partido
      await loadMatchDetails();
    }
    setActionLoading(false);
  };
  const handleDeleteMatch = async () => {
    if (!match) return;
    setActionLoading(true);
    const {
      error
    } = await deleteMatch(match.id);
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Partido eliminado",
        description: "El partido ha sido eliminado exitosamente"
      });
      navigate('/');
    }
    setActionLoading(false);
    setShowDeleteDialog(false);
  };
  const getSportColor = (sport: string) => {
    const colors: {
      [key: string]: string;
    } = {
      'football': 'bg-green-100 text-green-800',
      'tennis': 'bg-yellow-100 text-yellow-800',
      'padel': 'bg-purple-100 text-purple-800',
      'volleyball': 'bg-orange-100 text-orange-800',
      'basketball': 'bg-red-100 text-red-800',
      'badminton': 'bg-blue-100 text-blue-800'
    };
    return colors[sport] || 'bg-gray-100 text-gray-800';
  };
  const getSportName = (sport: string) => {
    const names: {
      [key: string]: string;
    } = {
      'football': 'Fútbol',
      'tennis': 'Tenis',
      'padel': 'Pádel',
      'volleyball': 'Voleibol',
      'basketball': 'Baloncesto',
      'badminton': 'Bádminton'
    };
    return names[sport] || sport;
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
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const getParticipantName = (participant: any) => {
    if (participant.profiles?.full_name) {
      return participant.profiles.full_name;
    }
    if (participant.profiles?.email) {
      return participant.profiles.email.split('@')[0];
    }
    return 'Usuario';
  };
  const getParticipantInitials = (participant: any) => {
    const name = getParticipantName(participant);
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  };
  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando detalles del partido...</p>
        </div>
      </div>;
  }
  if (!match) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Partido no encontrado</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Volver al inicio
          </Button>
        </div>
      </div>;
  }
  const canJoin = !match.is_participant && !match.is_creator && match.current_players < match.max_players;
  const canLeave = match.is_participant && !match.is_creator;
  return <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-3">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">Detalles del partido</h1>
          </div>
          {match.is_creator && <Button variant="ghost" size="icon" onClick={() => setShowDeleteDialog(true)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="h-5 w-5" />
            </Button>}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Main Info Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <Badge className={getSportColor(match.sport_type)}>
                {getSportName(match.sport_type)}
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
                  <div className="text-sm text-gray-600">{formatTime(match.date)}</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-3 text-gray-400" />
                <div>
                  <div className="font-medium">{match.location}</div>
                </div>
              </div>
              
              
              
              <div className="flex items-center">
                <Euro className="h-5 w-5 mr-3 text-gray-400" />
                <div className="font-medium text-blue-600">
                  {match.price > 0 ? `€${match.price}` : 'Gratis'}
                </div>
              </div>
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
                  OR
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">Organizador</div>
                {match.is_creator && <div className="text-sm text-blue-600">¡Eres tú!</div>}
              </div>
            </div>
            {!match.is_creator && <Button variant="outline" className="w-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contactar organizador
              </Button>}
          </CardContent>
        </Card>

        {/* Participants Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">
              Participantes ({match.participants?.length || 0}/{match.max_players})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {match.participants && match.participants.length > 0 ? <div className="space-y-3">
                {match.participants.map((participant: any, index: number) => <div key={participant.user_id} className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {getParticipantInitials(participant)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{getParticipantName(participant)}</div>
                      <div className="text-sm text-gray-600">
                        {participant.user_id === match.creator_id ? 'Organizador' : 'Participante'}
                      </div>
                    </div>
                  </div>)}
              </div> : <p className="text-gray-600 text-center py-4">
                Aún no hay participantes registrados
              </p>}
          </CardContent>
        </Card>

        {/* Description Card */}
        {match.description && <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Descripción</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-700">{match.description}</p>
            </CardContent>
          </Card>}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-4 left-4 right-4">
        <div className="max-w-md mx-auto">
          {canJoin && <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg font-medium shadow-lg" onClick={handleJoinMatch} disabled={actionLoading}>
              {actionLoading ? 'Uniéndose...' : 'Unirse al partido'}
            </Button>}
          {canLeave && <Button className="w-full h-12 bg-red-600 hover:bg-red-700 text-lg font-medium shadow-lg" onClick={handleLeaveMatch} disabled={actionLoading}>
              {actionLoading ? 'Saliendo...' : 'Salir del partido'}
            </Button>}
          {match.is_creator && <Button className="w-full h-12 bg-green-600 hover:bg-green-700 text-lg font-medium shadow-lg" disabled>
              Eres el organizador
            </Button>}
          {match.current_players >= match.max_players && !match.is_participant && !match.is_creator && <Button className="w-full h-12 bg-gray-600 text-lg font-medium shadow-lg" disabled>
              Partido completo
            </Button>}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar partido?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El partido será eliminado permanentemente y todos los participantes serán notificados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMatch} className="bg-red-600 hover:bg-red-700" disabled={actionLoading}>
              {actionLoading ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};
export default MatchDetails;