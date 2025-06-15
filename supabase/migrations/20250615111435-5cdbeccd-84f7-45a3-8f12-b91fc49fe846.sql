
-- Primero, corregimos el conteo actual de jugadores para todos los partidos existentes.
UPDATE public.matches
SET current_players = (
  SELECT COUNT(*)
  FROM public.match_participants
  WHERE match_participants.match_id = matches.id
);

-- Luego, creamos el disparador para mantener los conteos actualizados automáticamente.
CREATE TRIGGER on_match_participant_change
  AFTER INSERT OR DELETE ON public.match_participants
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_match_players();
