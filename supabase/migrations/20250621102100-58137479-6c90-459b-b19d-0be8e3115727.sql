
-- Agregar columnas de latitud y longitud a la tabla matches
ALTER TABLE public.matches 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Agregar comentarios para documentar las columnas
COMMENT ON COLUMN public.matches.latitude IS 'Latitud de la ubicación del partido';
COMMENT ON COLUMN public.matches.longitude IS 'Longitud de la ubicación del partido';
