-- Migration: add topic_presets column to profiles
-- Run this in the Supabase dashboard SQL editor:
-- https://app.supabase.com/project/csrqxwfypjjgnglsrfhj/sql

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS topic_presets jsonb DEFAULT '[]'::jsonb;
