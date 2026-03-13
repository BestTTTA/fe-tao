-- Add social media handle columns to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS facebook_handle  TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS instagram_handle TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS tiktok_handle    TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS line_handle      TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS youtube_handle   TEXT DEFAULT '';
