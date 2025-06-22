
import { useState, useRef, useCallback } from 'react';
import { Autocomplete, LoadScript } from '@react-google-maps/api';
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

// Configuración de librerías necesarias para Google Maps
const libraries: ("places")[] = ['places'];

// API key de Google Maps - En producción debería venir de variables de entorno
// Por ahora mantenemos la clave para que funcione, pero idealmente sería:
// const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_API_KEY = 'AIzaSyCIHD0nsV6U8JyOx1l-19iCakp2xY6nx1M';

const GoogleMapsAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = "Buscar dirección...",
  label,
  required = false,
  className
}: GoogleMapsAutocompleteProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
    setIsLoaded(true);
  }, []);

  const onPlaceChanged = useCallback(() => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      
      if (!place || !place.geometry || !place.geometry.location) {
        console.warn('No hay detalles disponibles para la entrada:', place?.name);
        return;
      }

      const location = place.geometry.location;
      const coordinates = {
        lat: location.lat(),
        lng: location.lng()
      };

      const formattedAddress = place.formatted_address || place.name || '';
      setInputValue(formattedAddress);
      onChange(formattedAddress, coordinates);
      
      console.log('Ubicación seleccionada:', formattedAddress);
      console.log('Coordenadas:', coordinates);
    }
  }, [onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    // Solo llamamos onChange con el texto cuando el usuario escribe
    // Sin coordenadas para que el padre sepa que es escritura manual
    onChange(newValue);
  };

  const onScriptLoad = () => {
    console.log('Google Maps script loaded successfully');
  };

  const onScriptError = (error: Error) => {
    console.error('Error loading Google Maps script:', error);
  };

  // Sincronizar el valor interno con el prop value cuando cambie desde el padre
  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <LoadScript
      googleMapsApiKey={GOOGLE_MAPS_API_KEY}
      libraries={libraries}
      onLoad={onScriptLoad}
      onError={onScriptError}
    >
      <div className="space-y-3">
        {label && (
          <Label htmlFor="location-input">
            {label} {required && '*'}
          </Label>
        )}
        
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Autocomplete
            onLoad={onLoad}
            onPlaceChanged={onPlaceChanged}
            options={{
              types: ['address'],
              componentRestrictions: { country: 'es' },
            }}
          >
            <Input
              id="location-input"
              type="text"
              placeholder={isLoaded ? placeholder : "Cargando Google Maps..."}
              value={inputValue}
              onChange={handleInputChange}
              className={cn("pl-10", className)}
              disabled={!isLoaded}
            />
          </Autocomplete>
        </div>
        
        {!isLoaded && (
          <p className="text-sm text-gray-500">Cargando Google Maps...</p>
        )}
      </div>
    </LoadScript>
  );
};

export default GoogleMapsAutocomplete;
