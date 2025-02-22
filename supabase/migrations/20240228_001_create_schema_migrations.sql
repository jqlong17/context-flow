-- 创建迁移历史表
CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 记录当前迁移
INSERT INTO schema_migrations (version, description)
VALUES ('20240228_001', '创建迁移历史表')
ON CONFLICT (version) DO NOTHING; 