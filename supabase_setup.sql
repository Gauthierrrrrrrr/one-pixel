-- Colle ce code dans l'éditeur SQL de Supabase

-- Table principale des pixels
CREATE TABLE pixels (
  id        BIGSERIAL PRIMARY KEY,
  x         INTEGER NOT NULL CHECK (x >= 0 AND x < 100),
  y         INTEGER NOT NULL CHECK (y >= 0 AND y < 100),
  color     TEXT NOT NULL DEFAULT '#000000',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Empêche deux pixels au même endroit
CREATE UNIQUE INDEX pixels_position ON pixels (x, y);

-- Autorise la lecture publique (pour afficher la grille)
ALTER TABLE pixels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique"
  ON pixels FOR SELECT
  USING (true);

-- Seul le backend (service role) peut insérer
CREATE POLICY "Insertion backend uniquement"
  ON pixels FOR INSERT
  WITH CHECK (false);
