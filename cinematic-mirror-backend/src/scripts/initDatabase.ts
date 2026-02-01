/**
 * 影中镜 Cinematic Mirror - 数据库初始化脚本
 *
 * 请在 Supabase 控制台的 SQL Editor 中运行以下 SQL 语句来创建所需的表和函数
 */

const SQL_SCHEMA = `
-- =====================================================
-- 影中镜 Cinematic Mirror 数据库架构
-- =====================================================

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(100) UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_nickname ON users(nickname);

-- 试镜会话表
CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  messages JSONB DEFAULT '[]'::jsonb,
  round INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  profile_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 试镜会话索引
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_status ON interview_sessions(status);

-- 人格档案表
CREATE TABLE IF NOT EXISTS personality_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  subtitle VARCHAR(200),
  analysis TEXT,
  narrative TEXT,
  angles JSONB DEFAULT '[]'::jsonb,
  visual_advice JSONB DEFAULT '{}'::jsonb,
  matches JSONB DEFAULT '[]'::jsonb,
  styling_variants JSONB DEFAULT '[]'::jsonb,
  interview_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 人格档案索引
CREATE INDEX IF NOT EXISTS idx_personality_profiles_user_id ON personality_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_personality_profiles_created_at ON personality_profiles(created_at DESC);

-- 电影广场帖子表
CREATE TABLE IF NOT EXISTS plaza_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_urls TEXT[] DEFAULT '{}',
  inspiration_tags TEXT[] DEFAULT '{}',
  location VARCHAR(200),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 帖子索引
CREATE INDEX IF NOT EXISTS idx_plaza_posts_user_id ON plaza_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_plaza_posts_created_at ON plaza_posts(created_at DESC);

-- 帖子点赞表
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES plaza_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 点赞索引
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);

-- 帖子评论表
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES plaza_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 评论索引
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);

-- =====================================================
-- 存储过程：增加点赞数
-- =====================================================
CREATE OR REPLACE FUNCTION increment_likes_count(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE plaza_posts
  SET likes_count = likes_count + 1,
      updated_at = NOW()
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 存储过程：减少点赞数
-- =====================================================
CREATE OR REPLACE FUNCTION decrement_likes_count(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE plaza_posts
  SET likes_count = GREATEST(likes_count - 1, 0),
      updated_at = NOW()
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 存储过程：增加评论数
-- =====================================================
CREATE OR REPLACE FUNCTION increment_comments_count(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE plaza_posts
  SET comments_count = comments_count + 1,
      updated_at = NOW()
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 存储过程：减少评论数
-- =====================================================
CREATE OR REPLACE FUNCTION decrement_comments_count(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE plaza_posts
  SET comments_count = GREATEST(comments_count - 1, 0),
      updated_at = NOW()
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 触发器：自动更新 updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要的表添加触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_interview_sessions_updated_at ON interview_sessions;
CREATE TRIGGER update_interview_sessions_updated_at
  BEFORE UPDATE ON interview_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_plaza_posts_updated_at ON plaza_posts;
CREATE TRIGGER update_plaza_posts_updated_at
  BEFORE UPDATE ON plaza_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 行级安全策略 (RLS)
-- =====================================================

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE personality_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaza_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- 用户表策略
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- 试镜会话策略
CREATE POLICY "Users can view own sessions" ON interview_sessions FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can create own sessions" ON interview_sessions FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own sessions" ON interview_sessions FOR UPDATE USING (auth.uid()::text = user_id::text);

-- 人格档案策略
CREATE POLICY "Users can view own profiles" ON personality_profiles FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can create own profiles" ON personality_profiles FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- 帖子策略
CREATE POLICY "Anyone can view posts" ON plaza_posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON plaza_posts FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own posts" ON plaza_posts FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own posts" ON plaza_posts FOR DELETE USING (auth.uid()::text = user_id::text);

-- 点赞策略
CREATE POLICY "Anyone can view likes" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Users can create likes" ON post_likes FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own likes" ON post_likes FOR DELETE USING (auth.uid()::text = user_id::text);

-- 评论策略
CREATE POLICY "Anyone can view comments" ON post_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON post_comments FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own comments" ON post_comments FOR DELETE USING (auth.uid()::text = user_id::text);

-- =====================================================
-- 插入示例数据（可选）
-- =====================================================

-- 示例用户（密码是 "123456" 的 bcrypt 哈希）
INSERT INTO users (id, email, password_hash, nickname, avatar_url) VALUES
  ('00000000-0000-0000-0000-000000000001', 'director@studio.com', '$2a$10$rQnM1Q4HGnkBgqZaGj/rPe1Uj.H5TILKvXTR8QY0mBJy3SxVKmNLO', '陆野导演', 'https://picsum.photos/seed/director/200/200')
ON CONFLICT (email) DO NOTHING;

-- 示例帖子
INSERT INTO plaza_posts (user_id, content, image_urls, inspiration_tags, location) VALUES
  ('00000000-0000-0000-0000-000000000001', '今天在老城区发现了一个绝美的取景地，光线穿过梧桐叶的样子，像极了王家卫电影里的某个瞬间。', ARRAY['https://picsum.photos/seed/post1/800/600'], ARRAY['Wong Kar-wai', 'Golden Hour'], '上海·老城区'),
  ('00000000-0000-0000-0000-000000000001', '试着用 Technicolor 的调色方式处理了这组照片，复古的感觉出来了。', ARRAY['https://picsum.photos/seed/post2/800/600', 'https://picsum.photos/seed/post3/800/600'], ARRAY['Technicolor', 'Vintage Hollywood'], '北京·798艺术区')
ON CONFLICT DO NOTHING;

SELECT '数据库初始化完成！' as message;
`;

console.log('='.repeat(60));
console.log('影中镜 Cinematic Mirror - 数据库初始化脚本');
console.log('='.repeat(60));
console.log('\n请在 Supabase 控制台的 SQL Editor 中运行以下 SQL 语句：\n');
console.log(SQL_SCHEMA);
console.log('\n' + '='.repeat(60));
console.log('访问方式：');
console.log('1. 打开 https://supabase.com/dashboard');
console.log('2. 选择你的项目');
console.log('3. 点击左侧菜单的 "SQL Editor"');
console.log('4. 复制上面的 SQL 语句并执行');
console.log('='.repeat(60));
