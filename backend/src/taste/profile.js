import { getOwnerId, pool } from "../db/pool.js";

export const TASTE_OPTIONS = Object.freeze({
  genres: ["Mystery", "Thriller", "Fantasy", "Science fiction", "Literary fiction", "Romance", "Historical fiction", "Horror", "Biography", "Nonfiction"],
  themes: ["Identity", "Family", "Power", "Survival", "Justice", "Love", "Grief", "Discovery"],
  avoidTraits: ["Graphic violence", "Explicit content", "Slow openings", "Ambiguous endings", "Heavy romance", "Complex prose"],
  paces: ["any", "slow", "balanced", "fast"],
  writingStyles: ["any", "direct", "lyrical"],
});

const emptyProfile = Object.freeze({
  favoriteGenres: [],
  favoriteThemes: [],
  avoidTraits: [],
  preferredPace: "any",
  twistInterest: null,
  psychologicalDepth: null,
  writingStyle: "any",
  updatedAt: null,
});

export class TasteProfileError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "TasteProfileError";
    this.status = status;
  }
}

function selection(value, allowed, label) {
  if (!Array.isArray(value) || value.length > 5 || new Set(value).size !== value.length
    || value.some((item) => typeof item !== "string" || !allowed.includes(item))) {
    throw new TasteProfileError(`Choose up to five valid ${label}, without duplicates.`);
  }
  return value;
}

function interest(value, label) {
  if (value === null || (Number.isInteger(value) && value >= 1 && value <= 5)) return value;
  throw new TasteProfileError(`${label} must be 1 to 5, or empty.`);
}

function validateProfile(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TasteProfileError("Send your reading preferences as an object.");
  }
  const favoriteGenres = selection(input.favoriteGenres, TASTE_OPTIONS.genres, "genres");
  const favoriteThemes = selection(input.favoriteThemes, TASTE_OPTIONS.themes, "themes");
  const avoidTraits = selection(input.avoidTraits, TASTE_OPTIONS.avoidTraits, "traits to avoid");
  if (!TASTE_OPTIONS.paces.includes(input.preferredPace)) {
    throw new TasteProfileError("Choose a valid reading pace.");
  }
  if (!TASTE_OPTIONS.writingStyles.includes(input.writingStyle)) {
    throw new TasteProfileError("Choose a valid writing style.");
  }
  return {
    favoriteGenres,
    favoriteThemes,
    avoidTraits,
    preferredPace: input.preferredPace,
    twistInterest: interest(input.twistInterest, "Twist interest"),
    psychologicalDepth: interest(input.psychologicalDepth, "Psychological depth"),
    writingStyle: input.writingStyle,
  };
}

function fromRow(row) {
  if (!row) return { ...emptyProfile };
  return {
    favoriteGenres: row.favorite_genres,
    favoriteThemes: row.favorite_themes,
    avoidTraits: row.avoid_traits,
    preferredPace: row.preferred_pace,
    twistInterest: row.twist_interest,
    psychologicalDepth: row.psychological_depth,
    writingStyle: row.writing_style,
    updatedAt: row.updated_at,
  };
}

export async function getTasteProfile() {
  const ownerId = await getOwnerId();
  const result = await pool.query("SELECT * FROM taste_preferences WHERE user_id = $1", [ownerId]);
  return fromRow(result.rows[0]);
}

export async function saveTasteProfile(input) {
  const profile = validateProfile(input);
  const ownerId = await getOwnerId();
  const result = await pool.query(`
    INSERT INTO taste_preferences (
      user_id, favorite_genres, favorite_themes, avoid_traits,
      preferred_pace, twist_interest, psychological_depth, writing_style
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (user_id) DO UPDATE SET
      favorite_genres = EXCLUDED.favorite_genres,
      favorite_themes = EXCLUDED.favorite_themes,
      avoid_traits = EXCLUDED.avoid_traits,
      preferred_pace = EXCLUDED.preferred_pace,
      twist_interest = EXCLUDED.twist_interest,
      psychological_depth = EXCLUDED.psychological_depth,
      writing_style = EXCLUDED.writing_style,
      updated_at = now()
    RETURNING *
  `, [ownerId, profile.favoriteGenres, profile.favoriteThemes, profile.avoidTraits,
    profile.preferredPace, profile.twistInterest, profile.psychologicalDepth, profile.writingStyle]);
  return fromRow(result.rows[0]);
}
