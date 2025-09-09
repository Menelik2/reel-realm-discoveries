-- Fix security vulnerability in custom_content table
-- Remove the public read access policy and replace with user-specific policy

-- Drop the existing public read policy
DROP POLICY IF EXISTS "Allow public read access" ON public.custom_content;

-- Create a new user-specific read policy
CREATE POLICY "Users can view their own custom content" 
ON public.custom_content 
FOR SELECT 
USING (auth.uid() = user_id);