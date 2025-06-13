-- 프로필 테이블 (사용자 추가 정보)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 리뷰 테이블
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  keyboard_frame VARCHAR(255),
  switch_type VARCHAR(255),
  keycap_type VARCHAR(255),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 리뷰 미디어 테이블
CREATE TABLE IF NOT EXISTS review_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_keyboard_frame ON reviews(keyboard_frame);
CREATE INDEX IF NOT EXISTS idx_reviews_switch_type ON reviews(switch_type);
CREATE INDEX IF NOT EXISTS idx_reviews_keycap_type ON reviews(keycap_type);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_review_media_review_id ON review_media(review_id);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_media ENABLE ROW LEVEL SECURITY;

-- 프로필 정책
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 리뷰 정책
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- 리뷰 미디어 정책
CREATE POLICY "Anyone can view review media" ON review_media
  FOR SELECT USING (true);

CREATE POLICY "Users can create review media for own reviews" ON review_media
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM reviews 
      WHERE reviews.id = review_media.review_id 
      AND reviews.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own review media" ON review_media
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM reviews 
      WHERE reviews.id = review_media.review_id 
      AND reviews.user_id = auth.uid()
    )
  );

-- 트리거 함수 생성 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage 버킷 생성 (Supabase CLI 또는 대시보드에서 실행)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('review-media', 'review-media', true);

-- Storage 정책 (대시보드에서 설정 필요)
-- CREATE POLICY "Anyone can view review media files" ON storage.objects
--   FOR SELECT USING (bucket_id = 'review-media');

-- CREATE POLICY "Users can upload review media files" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'review-media' AND auth.role() = 'authenticated');

-- CREATE POLICY "Users can update own review media files" ON storage.objects
--   FOR UPDATE USING (bucket_id = 'review-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete own review media files" ON storage.objects
--   FOR DELETE USING (bucket_id = 'review-media' AND auth.uid()::text = (storage.foldername(name))[1]); 