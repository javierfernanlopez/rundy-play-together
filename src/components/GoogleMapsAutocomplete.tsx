
import React, { useState, useRef, useCallback, useEffect } from 'react';
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

const libraries: ("places")[] = ['places'];
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
  const [inputValue, setInputValue] = useState(value);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // --- CAMBIO CLAVE 1: Sincronizar desde el padre ---
  // Este useEffect ahora es seguro. Solo actualiza el input si el valor
  // cambia "desde fuera" (por ej, si el formulario se resetea).
  // No entrará en conflicto con la escritura del usuario.
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
    }
  }, [value, inputValue]);

  const onLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
    setIsLoaded(true);
  }, []);

  const onPlaceChanged = useCallback(() => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      
      if (!place?.geometry?.location) {
        console.warn('El lugar seleccionado no tiene una ubicación válida.');
        return;
      }

      const formattedAddress = place.formatted_address || place.name || '';
      const coordinates = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };

      setInputValue(formattedAddress);
      // Notificamos al padre con el valor final y las coordenadas
      onChange(formattedAddress, coordinates);
      
      console.log('Ubicación seleccionada:', formattedAddress);
      console.log('Coordenadas:', coordinates);
    }
  }, [onChange]);

  // --- CAMBIO CLAVE 2: Simplificar el manejador de input ---
  // Esta función ahora SOLO actualiza el estado interno.
  // NO llama al onChange del padre. Esto evita el re-renderizado en cada tecla.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  // --- CAMBIO CLAVE 3: Añadir un manejador de "onBlur" ---
  // Cuando el usuario hace clic fuera del input, consideramos que ha terminado
  // de escribir manualmente. En este momento, actualizamos al padre.
  const handleBlur = () => {
    // Si el valor actual es diferente al del padre (prop `value`),
    // notificamos el cambio. Pasamos 'undefined' para las coordenadas
    // porque es una entrada manual.
    if (inputValue !== value) {
      onChange(inputValue, undefined);
    }
  };

  const onScriptLoad = () => {
    console.log('Google Maps script loaded successfully');
  };

  const onScriptError = (error: Error) => {
    console.error('Error loading Google Maps script:', error);
  };

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
              onBlur={handleBlur}
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

// --- CAMBIO CLAVE 4: Envolver en React.memo ---
// Esto es un seguro adicional. Evita que el componente se vuelva a renderizar
// si las props que le pasa el padre no han cambiado, optimizando el rendimiento.
export default React.memo(GoogleMapsAutocomplete);
