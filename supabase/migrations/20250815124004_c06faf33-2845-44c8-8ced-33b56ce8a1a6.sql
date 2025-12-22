-- Create table for storing Clinicorp credentials
CREATE TABLE public.clinicorp_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key TEXT NOT NULL,
  subscriber_id TEXT NOT NULL,
  base_url TEXT DEFAULT 'https://api.clinicorp.com/rest/v1',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.clinicorp_credentials ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own credentials" 
ON public.clinicorp_credentials 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own credentials" 
ON public.clinicorp_credentials 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credentials" 
ON public.clinicorp_credentials 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credentials" 
ON public.clinicorp_credentials 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_clinicorp_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_clinicorp_credentials_updated_at
BEFORE UPDATE ON public.clinicorp_credentials
FOR EACH ROW
EXECUTE FUNCTION public.update_clinicorp_credentials_updated_at();