-- Add foreign key from posts.author_id to profiles for Supabase embed to work
-- profiles.id = auth.users.id, so author_id can reference profiles
ALTER TABLE public.posts
ADD CONSTRAINT posts_author_profiles_fk
FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
