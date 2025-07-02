import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, MapPin, Users, Euro } from 'lucide-react';
import { format, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useMatches } from '@/hooks/useMatches';
import { useToast } from '@/hooks/use-toast';

interface CreateMatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateMatchDialog = ({ open, onOpenChange }: CreateMatchDialogProps) => {
  const [date, setDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sport: '',
    title: '',
    description: '',
    location: '',
    maxPlayers: '',
    price: '',
    time: '',
  });

  const { createMatch } = useMatches();
  const { toast } = useToast();

  const sports = [
    { label: 'Fútbol', value: 'football' },
    { label: 'Tenis', value: 'tennis' },
    { label: 'Pádel', value: 'padel' },
    { label: 'Voleibol', value: 'volleyball' },
    { label: 'Baloncesto', value: 'basketball' },
    { label: 'Bádminton', value: 'badminton' }
  ];

  const timeSlots = useMemo(() => {
    const slots = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    for (let h = 8; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        if (date && isToday(date)) {
          if (h < currentHour || (h === currentHour && m <= currentMinute)) {
            continue;
          }
        }
        const hour = h.toString().padStart(2, '0');
        const minute = m.toString().padStart(2, '0');
        slots.push(`${hour}:${minute}`);
      }
    }
    return slots;
  }, [date]);

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    handleInputChange('time', ''); // Reset time when date changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !formData.sport || !formData.title || !formData.location || !formData.time) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await createMatch({
        title: formData.title,
        description: formData.description,
        location: formData.location,
        date: date,
        time: formData.time,
        sport_type: formData.sport,
        max_players: parseInt(formData.maxPlayers) || 10,
        price: parseFloat(formData.price) || 0,
      });

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "¡Partido creado!",
          description: "Tu partido se ha creado exitosamente",
        });
        onOpenChange(false);
        // Reset form
        setFormData({
          sport: '',
          title: '',
          description: '',
          location: '',
          maxPlayers: '',
          price: '',
          time: '',
        });
        setDate(undefined);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error inesperado al crear el partido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="w-full max-w-md max-h-[90vh] overflow-y-auto sm:w-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Crear nuevo partido
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sport Selection */}
          <div className="space-y-2">
            <Label htmlFor="sport">Deporte *</Label>
            <Select value={formData.sport} onValueChange={(value) => handleInputChange('sport', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un deporte" />
              </SelectTrigger>
              <SelectContent>
                {sports.map((sport) => (
                  <SelectItem key={sport.value} value={sport.value}>
                    {sport.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título del partido *</Label>
            <Input
              id="title"
              placeholder="Ej: Partido amistoso de fútbol"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe tu partido..."
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Ubicación *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="location"
                placeholder="Dirección o nombre del lugar"
                className="pl-10"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: es }) : "Seleccionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    fromDate={new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Hora *</Label>
              <Select value={formData.time} onValueChange={(value) => handleInputChange('time', value)} disabled={!date}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una hora" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Players and Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxPlayers">Jugadores máx.</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="maxPlayers"
                  type="number"
                  placeholder="10"
                  className="pl-10"
                  value={formData.maxPlayers}
                  onChange={(e) => handleInputChange('maxPlayers', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Precio</Label>
              <div className="relative">
                <Euro className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="price"
                  placeholder="0"
                  className="pl-10"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Creando..." : "Crear partido"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMatchDialog;
