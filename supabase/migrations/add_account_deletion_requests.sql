-- Create account_deletion_requests table
CREATE TABLE IF NOT EXISTS account_deletion_requests (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, approved, rejected, completed
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES auth.users(id),
  note TEXT, -- Admin note (reason for rejection, etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_deletion_requests_user_id ON account_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_status ON account_deletion_requests(status);

-- Enable RLS
ALTER TABLE account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own deletion request
CREATE POLICY "Users can insert own deletion request" ON account_deletion_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own deletion requests
CREATE POLICY "Users can view own deletion requests" ON account_deletion_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Admins can view all deletion requests (you may need to adjust based on your admin setup)
-- CREATE POLICY "Admins can view all deletion requests" ON account_deletion_requests
--   FOR ALL USING (
--     EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
--   );
