
-- Agregar columnas para deportes favoritos y nivel en la tabla profiles
ALTER TABLE public.profiles 
ADD COLUMN favorite_sports TEXT[] DEFAULT '{}',
ADD COLUMN skill_level TEXT DEFAULT 'beginner';

-- Crear un tipo enum para los niveles de habilidad (opcional, para validación)
CREATE TYPE skill_level_enum AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

-- Actualizar la columna para usar el enum (opcional)
-- ALTER TABLE public.profiles ALTER COLUMN skill_level TYPE skill_level_enum USING skill_level::skill_level_enum;
