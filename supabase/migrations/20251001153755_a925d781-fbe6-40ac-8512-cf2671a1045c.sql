-- Create notification_tokens table to store FCM tokens
CREATE TABLE public.notification_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  device_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_tokens ENABLE ROW LEVEL SECURITY;

-- Users can view their own tokens
CREATE POLICY "Users can view their own notification tokens"
ON public.notification_tokens
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own tokens
CREATE POLICY "Users can insert their own notification tokens"
ON public.notification_tokens
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own tokens
CREATE POLICY "Users can update their own notification tokens"
ON public.notification_tokens
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own tokens
CREATE POLICY "Users can delete their own notification tokens"
ON public.notification_tokens
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster token lookups
CREATE INDEX idx_notification_tokens_user_id ON public.notification_tokens(user_id);
CREATE INDEX idx_notification_tokens_token ON public.notification_tokens(token);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_notification_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_notification_tokens_updated_at
BEFORE UPDATE ON public.notification_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_notification_tokens_updated_at();