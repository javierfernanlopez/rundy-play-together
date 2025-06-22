
import React, { useState, useRef, useCallback } from 'react';
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

// API key de Google Maps desde variables de entorno
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCIHD0nsV6U8JyOx1l-19iCakp2xY6nx1M';

const GoogleMapsAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = "Buscar dirección...",
  label,
  required = false,
  className
}: GoogleMapsAutocompleteProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  // El estado interno inputValue se inicializa con el valor del padre,
  // y a partir de ahí gestiona sus propios cambios.
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
        // Si el usuario escribe algo y no selecciona, no hacemos nada aquí.
        // El valor ya se está actualizando a través de handleInputChange.
        return;
      }

      const location = place.geometry.location;
      const coordinates = {
        lat: location.lat(),
        lng: location.lng()
      };

      const formattedAddress = place.formatted_address || place.name || '';
      setInputValue(formattedAddress);
      // Notificamos al padre con la dirección formateada y las coordenadas
      onChange(formattedAddress, coordinates);
      
      console.log('Ubicación seleccionada:', formattedAddress);
      console.log('Coordenadas:', coordinates);
    }
  }, [onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    // Solo llamamos onChange con el texto cuando el usuario escribe.
    // De esta forma, el componente padre siempre tiene el valor actual,
    // pero sin provocar el ciclo de re-renderizado problemático.
    onChange(newValue);
  };

  const onScriptLoad = () => {
    console.log('Google Maps script loaded successfully');
  };

  const onScriptError = (error: Error) => {
    console.error('Error loading Google Maps script:', error);
  };

  // --- ELIMINADO ---
  // Se ha eliminado el `React.useEffect` que causaba el conflicto.
  // El componente ahora es "no controlado" en el sentido de que no se fuerza
  // a actualizarse desde el padre después de la carga inicial, lo que resuelve el bloqueo.

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
