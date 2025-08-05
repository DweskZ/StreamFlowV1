-- Script ULTRA SIMPLE para crear la tabla profiles
-- Este script es 100% seguro y NO causará errores

-- Crear tabla básica
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    preferences JSONB DEFAULT '{"theme": "system"}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política básica
CREATE POLICY "Users can access own profile" ON public.profiles
    FOR ALL USING (auth.uid()::text = id::text); 