
-- Create orders table to track ad-free purchase information
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE NOT NULL,
  amount INTEGER,
  currency TEXT,
  status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row-Level Security on the new table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow users to view their own orders
CREATE POLICY "select_own_orders" ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create a policy to allow server-side code (like an edge function) to insert new orders
CREATE POLICY "allow_insert_for_service_role" ON public.orders
  FOR INSERT
  WITH CHECK (true);

-- Create a policy to allow server-side code to update orders
CREATE POLICY "allow_update_for_service_role" ON public.orders
  FOR UPDATE
  USING (true);
