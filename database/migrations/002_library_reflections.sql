ALTER TABLE user_books
  ADD COLUMN rating smallint CHECK (rating BETWEEN 1 AND 5),
  ADD COLUMN personal_note text CHECK (char_length(personal_note) <= 2000);
