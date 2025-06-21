
import { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from 'lucide-react';
import { cn } from "@/lib/utils";

interface GoogleMapsAutocompleteProps {
  value: string;
  onChange: (value: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

const GoogleMapsAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = "Buscar dirección...",
  label,
  required = false,
  className
}: GoogleMapsAutocompleteProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteInstance = useRef<google.maps.places.Autocomplete | null>(null);

  // API key fija de Google Maps
  const GOOGLE_MAPS_API_KEY = 'AIzaSyCIHD0nsV6U8JyOx1l-19iCakp2xY6nx1M';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsLoaded(true);
        initializeAutocomplete();
      };
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, []);

  const initializeAutocomplete = () => {
    if (!inputRef.current) return;

    // Inicializar autocompletado
    autocompleteInstance.current = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'es' }, // Restringir a España
    });

    // Listener para cuando se selecciona un lugar
    autocompleteInstance.current.addListener('place_changed', () => {
      const place = autocompleteInstance.current?.getPlace();
      
      if (!place || !place.geometry || !place.geometry.location) {
        console.warn('No hay detalles disponibles para la entrada:', place?.name);
        return;
      }

      const location = place.geometry.location;
      const coordinates = {
        lat: location.lat(),
        lng: location.lng()
      };

      // Actualizar el valor y las coordenadas
      onChange(place.formatted_address || place.name || '', coordinates);
    });
  };

  return (
    <div className="space-y-3">
      {label && (
        <Label htmlFor="location-input">
          {label} {required && '*'}
        </Label>
      )}
      
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          id="location-input"
          type="text"
          placeholder={isLoaded ? placeholder : "Cargando Google Maps..."}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn("pl-10", className)}
          disabled={!isLoaded}
        />
      </div>
      
      {!isLoaded && (
        <p className="text-sm text-gray-500">Cargando Google Maps...</p>
      )}
    </div>
  );
};

export default GoogleMapsAutocomplete;
