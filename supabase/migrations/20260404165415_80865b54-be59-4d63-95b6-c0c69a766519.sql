-- Add status field to transactions for subscription tracking
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- Add cancelled_at timestamp
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone;

-- Add last_confirmed_at for subscription confirmation tracking
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS last_confirmed_at timestamp with time zone;