
import { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from 'lucide-react';
import { cn } from "@/lib/utils";

interface GoogleMapsAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
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
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);

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
        autocompleteService.current = new google.maps.places.AutocompleteService();
      };
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (inputValue.length > 2 && autocompleteService.current) {
      const request = {
        input: inputValue,
        types: ['address'],
        componentRestrictions: { country: 'es' }, // Restringir a España
      };

      autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setPredictions(predictions);
          setShowPredictions(true);
        } else {
          setPredictions([]);
          setShowPredictions(false);
        }
      });
    } else {
      setPredictions([]);
      setShowPredictions(false);
    }
  };

  const handlePredictionClick = (prediction: google.maps.places.AutocompletePrediction) => {
    onChange(prediction.description);
    setPredictions([]);
    setShowPredictions(false);
  };

  const handleInputBlur = () => {
    // Delay hiding predictions to allow for clicks
    setTimeout(() => {
      setShowPredictions(false);
    }, 200);
  };

  return (
    <div className="space-y-2">
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
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={() => {
            if (predictions.length > 0) {
              setShowPredictions(true);
            }
          }}
          className={cn("pl-10", className)}
          disabled={!isLoaded}
        />
        
        {showPredictions && predictions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {predictions.map((prediction) => (
              <div
                key={prediction.place_id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handlePredictionClick(prediction)}
              >
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {prediction.structured_formatting.main_text}
                    </div>
                    <div className="text-xs text-gray-600">
                      {prediction.structured_formatting.secondary_text}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {!isLoaded && (
        <p className="text-sm text-gray-500">Cargando Google Maps...</p>
      )}
    </div>
  );
};

export default GoogleMapsAutocomplete;
