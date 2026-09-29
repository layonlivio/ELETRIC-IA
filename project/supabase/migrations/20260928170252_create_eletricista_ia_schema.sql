/*
# Create Eletricista IA schema

1. New Tables
- `profiles` — user profile data (name, phone, plan, subscription status)
- `projects` — electrical projects (client, environment, etc.)
- `circuits` — circuits within a project (loads, voltage, distance, etc.)
- `materials` — material catalog with default prices
- `project_materials` — materials list for a project (quantity, price)
- `subscriptions` — user subscription tracking (plan, status, validity)
- `chat_history` — AI chat conversation history per user

2. Security
- Enable RLS on all tables.
- Owner-scoped CRUD on profiles, projects, circuits, project_materials, subscriptions, chat_history (authenticated users only).
- Materials catalog is readable by all authenticated users (shared reference data).
- All owner columns default to auth.uid().

3. Notes
- profiles.id references auth.users(id) with 1:1 relationship
- projects → circuits (1:N) → project_materials (1:N)
- subscriptions tracks Mercado Pago payment integration
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  plan text NOT NULL DEFAULT 'normal',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name text NOT NULL DEFAULT '',
  client_phone text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  voltage int NOT NULL DEFAULT 220,
  phases int NOT NULL DEFAULT 1,
  notes text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_projects" ON projects;
CREATE POLICY "select_own_projects" ON projects FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_projects" ON projects;
CREATE POLICY "insert_own_projects" ON projects FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_projects" ON projects;
CREATE POLICY "update_own_projects" ON projects FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_projects" ON projects;
CREATE POLICY "delete_own_projects" ON projects FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Circuits table
CREATE TABLE IF NOT EXISTS circuits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Circuito',
  environment text NOT NULL DEFAULT '',
  circuit_type text NOT NULL DEFAULT 'iluminacao',
  load_type text NOT NULL DEFAULT 'resistiva',
  power_w numeric NOT NULL DEFAULT 1000,
  voltage int NOT NULL DEFAULT 220,
  phases int NOT NULL DEFAULT 1,
  distance_m numeric NOT NULL DEFAULT 10,
  conductor_material text NOT NULL DEFAULT 'cobre',
  installation_method text NOT NULL DEFAULT 'eletroduto',
  points_count int NOT NULL DEFAULT 1,
  results jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE circuits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_circuits" ON circuits;
CREATE POLICY "select_own_circuits" ON circuits FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = circuits.project_id AND projects.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_circuits" ON circuits;
CREATE POLICY "insert_own_circuits" ON circuits FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = circuits.project_id AND projects.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_circuits" ON circuits;
CREATE POLICY "update_own_circuits" ON circuits FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = circuits.project_id AND projects.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = circuits.project_id AND projects.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_circuits" ON circuits;
CREATE POLICY "delete_own_circuits" ON circuits FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = circuits.project_id AND projects.user_id = auth.uid())
  );

-- Materials catalog (shared reference data)
CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'geral',
  unit text NOT NULL DEFAULT 'un',
  default_price numeric NOT NULL DEFAULT 0,
  specs jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_all_materials" ON materials;
CREATE POLICY "read_all_materials" ON materials FOR SELECT
  TO authenticated USING (true);

-- Project materials (bill of materials per project)
CREATE TABLE IF NOT EXISTS project_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  material_id uuid REFERENCES materials(id) ON DELETE SET NULL,
  name text NOT NULL DEFAULT '',
  quantity numeric NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT 'un',
  unit_price numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE project_materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_project_materials" ON project_materials;
CREATE POLICY "select_own_project_materials" ON project_materials FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = project_materials.project_id AND projects.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_project_materials" ON project_materials;
CREATE POLICY "insert_own_project_materials" ON project_materials FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = project_materials.project_id AND projects.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_project_materials" ON project_materials;
CREATE POLICY "update_own_project_materials" ON project_materials FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = project_materials.project_id AND projects.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = project_materials.project_id AND projects.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_project_materials" ON project_materials;
CREATE POLICY "delete_own_project_materials" ON project_materials FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = project_materials.project_id AND projects.user_id = auth.uid())
  );

-- Subscriptions table (Mercado Pago integration)
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'inactive',
  payment_provider text NOT NULL DEFAULT 'mercadopago',
  payment_id text,
  payment_method text,
  period text NOT NULL DEFAULT 'monthly',
  valid_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_subscriptions" ON subscriptions;
CREATE POLICY "select_own_subscriptions" ON subscriptions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_subscriptions" ON subscriptions;
CREATE POLICY "insert_own_subscriptions" ON subscriptions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_subscriptions" ON subscriptions;
CREATE POLICY "update_own_subscriptions" ON subscriptions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Chat history table (AI conversations)
CREATE TABLE IF NOT EXISTS chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_chat" ON chat_history;
CREATE POLICY "select_own_chat" ON chat_history FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_chat" ON chat_history;
CREATE POLICY "insert_own_chat" ON chat_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_chat" ON chat_history;
CREATE POLICY "delete_own_chat" ON chat_history FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_circuits_project_id ON circuits(project_id);
CREATE INDEX IF NOT EXISTS idx_project_materials_project_id ON project_materials(project_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_projects_updated_at ON projects;
CREATE TRIGGER trigger_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trigger_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $
BEGIN
  INSERT INTO public.profiles (id, name, plan)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), 'normal')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$;

REVOKE EXECUTE ON FUNCTION handle_new_user() FROM anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
