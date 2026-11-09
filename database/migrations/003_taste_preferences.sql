CREATE TABLE taste_preferences (
  user_id bigint PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  favorite_genres text[] NOT NULL DEFAULT '{}' CHECK (cardinality(favorite_genres) <= 5),
  favorite_themes text[] NOT NULL DEFAULT '{}' CHECK (cardinality(favorite_themes) <= 5),
  avoid_traits text[] NOT NULL DEFAULT '{}' CHECK (cardinality(avoid_traits) <= 5),
  preferred_pace text NOT NULL DEFAULT 'any'
    CHECK (preferred_pace IN ('any', 'slow', 'balanced', 'fast')),
  twist_interest smallint CHECK (twist_interest BETWEEN 1 AND 5),
  psychological_depth smallint CHECK (psychological_depth BETWEEN 1 AND 5),
  writing_style text NOT NULL DEFAULT 'any'
    CHECK (writing_style IN ('any', 'direct', 'lyrical')),
  updated_at timestamptz NOT NULL DEFAULT now()
);
