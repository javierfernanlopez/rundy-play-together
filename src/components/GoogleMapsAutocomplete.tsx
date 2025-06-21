
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
  showMap?: boolean;
}

const GoogleMapsAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = "Buscar dirección...",
  label,
  required = false,
  className,
  showMap = true
}: GoogleMapsAutocompleteProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerInstance = useRef<google.maps.Marker | null>(null);
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
        initializeMap();
      };
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, []);

  const initializeMap = () => {
    if (!inputRef.current || (showMap && !mapRef.current)) return;

    // Coordenadas iniciales (Madrid)
    const initialPosition = { lat: 40.416775, lng: -3.703790 };

    // Crear el mapa si está habilitado
    if (showMap && mapRef.current) {
      mapInstance.current = new google.maps.Map(mapRef.current, {
        zoom: 12,
        center: initialPosition,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      // Crear marcador
      markerInstance.current = new google.maps.Marker({
        map: mapInstance.current,
        anchorPoint: new google.maps.Point(0, -29),
        draggable: true,
      });

      // Listener para cuando se arrastra el marcador
      markerInstance.current.addListener('dragend', () => {
        if (markerInstance.current) {
          const position = markerInstance.current.getPosition();
          if (position) {
            // Geocodificación inversa para obtener la dirección
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: position }, (results, status) => {
              if (status === 'OK' && results?.[0]) {
                const address = results[0].formatted_address;
                onChange(address, {
                  lat: position.lat(),
                  lng: position.lng()
                });
              }
            });
          }
        }
      });
    }

    // Inicializar autocompletado
    autocompleteInstance.current = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'es' }, // Restringir a España
    });

    // Vincular los límites del mapa al autocompletado si el mapa está habilitado
    if (mapInstance.current) {
      autocompleteInstance.current.bindTo('bounds', mapInstance.current);
    }

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

      // Actualizar el mapa si está habilitado
      if (mapInstance.current && markerInstance.current) {
        if (place.geometry.viewport) {
          mapInstance.current.fitBounds(place.geometry.viewport);
        } else {
          mapInstance.current.setCenter(location);
          mapInstance.current.setZoom(17);
        }
        
        markerInstance.current.setPosition(location);
        markerInstance.current.setVisible(true);
      }
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

      {showMap && (
        <div className="space-y-2">
          <div 
            ref={mapRef} 
            className="w-full h-64 rounded-md border border-gray-200"
            style={{ minHeight: '256px' }}
          />
          <p className="text-xs text-gray-500">
            Puedes arrastrar el marcador para ajustar la ubicación exacta
          </p>
        </div>
      )}
      
      {!isLoaded && (
        <p className="text-sm text-gray-500">Cargando Google Maps...</p>
      )}
    </div>
  );
};

export default GoogleMapsAutocomplete;
