-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT,
  style_description TEXT,
  gender TEXT,
  background_story TEXT,
  interest_tags JSONB DEFAULT '[]'::jsonb,
  followers JSONB DEFAULT '[]'::jsonb,
  following JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建文章表
CREATE TABLE IF NOT EXISTS articles (
  article_id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id TEXT REFERENCES users(user_id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  level TEXT,
  topic TEXT,
  vocabularies JSONB DEFAULT '[]'::jsonb,
  key_phrases JSONB DEFAULT '[]'::jsonb,
  learning_points JSONB DEFAULT '[]'::jsonb,
  likes_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建互动类型枚举
DO $$ BEGIN
  CREATE TYPE interaction_type AS ENUM ('like', 'favorite', 'comment', 'reply');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 创建互动表
CREATE TABLE IF NOT EXISTS interactions (
  interaction_id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(user_id),
  article_id BIGINT REFERENCES articles(article_id),
  target_user_id TEXT REFERENCES users(user_id),
  parent_interaction_id TEXT REFERENCES interactions(interaction_id),
  type interaction_type NOT NULL,
  content TEXT,
  translation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- 约束条件
  CONSTRAINT valid_reply CHECK (
    (type = 'reply' AND parent_interaction_id IS NOT NULL) OR
    (type != 'reply' AND parent_interaction_id IS NULL)
  ),
  CONSTRAINT valid_content CHECK (
    (type IN ('comment', 'reply') AND content IS NOT NULL) OR
    (type IN ('like', 'favorite'))
  ),
  CONSTRAINT valid_target_user CHECK (
    (type = 'reply' AND target_user_id IS NOT NULL) OR
    (type != 'reply' AND target_user_id IS NULL)
  )
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_articles_user_id ON articles(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at);
CREATE INDEX IF NOT EXISTS idx_interactions_article_id ON interactions(article_id);
CREATE INDEX IF NOT EXISTS idx_interactions_user_id ON interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON interactions(type);
CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON interactions(created_at);

-- 创建触发器函数来更新文章的互动计数
CREATE OR REPLACE FUNCTION update_article_interaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.type = 'like' THEN
      UPDATE articles SET likes_count = COALESCE(likes_count, 0) + 1 WHERE article_id = NEW.article_id;
    ELSIF NEW.type = 'favorite' THEN
      UPDATE articles SET favorites_count = COALESCE(favorites_count, 0) + 1 WHERE article_id = NEW.article_id;
    ELSIF NEW.type IN ('comment', 'reply') THEN
      UPDATE articles SET comments_count = COALESCE(comments_count, 0) + 1 WHERE article_id = NEW.article_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.type = 'like' THEN
      UPDATE articles SET likes_count = GREATEST(0, COALESCE(likes_count, 0) - 1) WHERE article_id = OLD.article_id;
    ELSIF OLD.type = 'favorite' THEN
      UPDATE articles SET favorites_count = GREATEST(0, COALESCE(favorites_count, 0) - 1) WHERE article_id = OLD.article_id;
    ELSIF OLD.type IN ('comment', 'reply') THEN
      UPDATE articles SET comments_count = GREATEST(0, COALESCE(comments_count, 0) - 1) WHERE article_id = OLD.article_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS update_article_interaction_counts ON interactions;
CREATE TRIGGER update_article_interaction_counts
AFTER INSERT OR DELETE ON interactions
FOR EACH ROW
EXECUTE FUNCTION update_article_interaction_counts();

-- 创建更新所有文章计数的存储过程
CREATE OR REPLACE FUNCTION update_all_article_counts()
RETURNS void AS $$
BEGIN
  -- 更新点赞数
  UPDATE articles a
  SET likes_count = (
    SELECT COUNT(*)
    FROM interactions i
    WHERE i.article_id = a.article_id
    AND i.type = 'like'
  );

  -- 更新收藏数
  UPDATE articles a
  SET favorites_count = (
    SELECT COUNT(*)
    FROM interactions i
    WHERE i.article_id = a.article_id
    AND i.type = 'favorite'
  );

  -- 更新评论数（包括评论和回复）
  UPDATE articles a
  SET comments_count = (
    SELECT COUNT(*)
    FROM interactions i
    WHERE i.article_id = a.article_id
    AND i.type IN ('comment', 'reply')
  );
END;
$$ LANGUAGE plpgsql;

