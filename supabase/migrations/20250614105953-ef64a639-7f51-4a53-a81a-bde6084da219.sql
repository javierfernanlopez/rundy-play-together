
-- Crear tabla de perfiles de usuario
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Crear tabla de partidos
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_players INTEGER NOT NULL DEFAULT 10,
  current_players INTEGER NOT NULL DEFAULT 0,
  creator_id UUID REFERENCES auth.users NOT NULL,
  sport_type TEXT NOT NULL DEFAULT 'football',
  price DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de inscripciones a partidos
CREATE TABLE public.match_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(match_id, user_id)
);

-- Habilitar Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_participants ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Políticas para matches
CREATE POLICY "Anyone can view matches" 
  ON public.matches 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can create matches" 
  ON public.matches 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their matches" 
  ON public.matches 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their matches" 
  ON public.matches 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = creator_id);

-- Políticas para match_participants
CREATE POLICY "Users can view match participants" 
  ON public.match_participants 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can join matches" 
  ON public.match_participants 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave matches" 
  ON public.match_participants 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Función para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Función para actualizar current_players automáticamente
CREATE OR REPLACE FUNCTION public.update_match_players()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.matches 
    SET current_players = current_players + 1
    WHERE id = NEW.match_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.matches 
    SET current_players = current_players - 1
    WHERE id = OLD.match_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Triggers para actualizar current_players
CREATE TRIGGER on_participant_added
  AFTER INSERT ON public.match_participants
  FOR EACH ROW EXECUTE PROCEDURE public.update_match_players();

CREATE TRIGGER on_participant_removed
  AFTER DELETE ON public.match_participants
  FOR EACH ROW EXECUTE PROCEDURE public.update_match_players();
