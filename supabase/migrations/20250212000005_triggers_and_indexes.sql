-- Add updated_at triggers and performance indexes

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update conversation timestamp when message is sent
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations 
  SET updated_at = NOW() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_message_insert
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_timestamp();

-- Add soft delete columns
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add indexes for soft delete
CREATE INDEX IF NOT EXISTS idx_posts_deleted ON public.posts(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_comments_deleted ON public.comments(deleted_at) WHERE deleted_at IS NULL;

-- Enable pg_trgm extension for better search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add trigram index for username search
CREATE INDEX IF NOT EXISTS idx_profiles_username_trgm ON public.profiles 
  USING gin (username gin_trgm_ops);

-- Add composite indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_author_created ON public.posts(author_id, created_at DESC) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_friendships_composite ON public.friendships(user_id, friend_id, status);

-- Update RLS policies to respect soft delete
DROP POLICY IF EXISTS "Users can view friends posts" ON public.posts;
CREATE POLICY "Users can view friends posts" ON public.posts
  FOR SELECT USING (
    deleted_at IS NULL AND (
      author_id = auth.uid()
      OR author_id IN (SELECT public.get_friend_ids(auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can view comments on visible posts" ON public.comments;
CREATE POLICY "Users can view comments on visible posts" ON public.comments
  FOR SELECT USING (
    deleted_at IS NULL AND
    post_id IN (
      SELECT id FROM public.posts 
      WHERE deleted_at IS NULL AND (
        author_id = auth.uid() 
        OR author_id IN (SELECT public.get_friend_ids(auth.uid()))
      )
    )
  );

-- Add policies for soft delete
CREATE POLICY "Users can soft delete own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can soft delete own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = user_id);
