-- Add line_user_id column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS line_user_id VARCHAR(255) UNIQUE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_line_user_id
ON profiles(line_user_id);

-- Add comment
COMMENT ON COLUMN profiles.line_user_id IS 'LINE user ID for LINE Login integration';
