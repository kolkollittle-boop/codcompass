-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table
CREATE TABLE IF NOT EXISTS article_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES Article(id) ON DELETE CASCADE,
  embedding vector(1536),  -- OpenAI text-embedding-3-small
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast similarity search
CREATE INDEX IF NOT EXISTS article_embeddings_embedding_idx 
ON article_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create search function
CREATE OR REPLACE FUNCTION search_articles(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  titleEn TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.slug,
    a.titleEn,
    1 - (ae.embedding <=> query_embedding) AS similarity
  FROM article_embeddings ae
  JOIN "Article" a ON ae.article_id = a.id
  WHERE 1 - (ae.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- Verify
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
