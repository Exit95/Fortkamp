/*
  # Contact Form Submissions Schema

  1. New Tables
    - `contact_submissions`
      - `id` (uuid, primary key) - Unique identifier
      - `reference_id` (text, unique) - Human-readable reference ID
      - `name` (text) - Contact name
      - `email` (text) - Contact email
      - `phone` (text, nullable) - Contact phone number
      - `service` (text, nullable) - Selected service
      - `message` (text) - Message content
      - `consent` (boolean) - Privacy consent
      - `ip_address` (text, nullable) - Submitter IP
      - `user_agent` (text, nullable) - Browser user agent
      - `source_page` (text, nullable) - Page where form was submitted
      - `status` (text) - Submission status (new, contacted, completed)
      - `created_at` (timestamptz) - Submission timestamp
      - `processed_at` (timestamptz, nullable) - When submission was processed
      - `notes` (text, nullable) - Internal notes

  2. Security
    - Enable RLS on contact_submissions table
    - Allow anonymous inserts for form submissions
    - Restrict reads to authenticated users only

  3. Indexes
    - Index on created_at for chronological queries
    - Index on status for filtering
*/

CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id text UNIQUE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  service text,
  message text NOT NULL,
  consent boolean NOT NULL DEFAULT false,
  ip_address text,
  user_agent text,
  source_page text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  notes text
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert on contact_submissions"
  ON contact_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read contact_submissions"
  ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update contact_submissions"
  ON contact_submissions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at
  ON contact_submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_status
  ON contact_submissions(status);
