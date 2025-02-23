'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import InteractionButtons from './InteractionButtons';

interface DialogueContent {
  speaker: string;
  text: string;
}

interface Article {
  article_id: number;
  title: string;
  content: DialogueContent[];
  created_at: string;
  user_id: string;
  level: string;
  tags: string[];
  likes_count: number;
  comments_count: number;
  favorites_count: number;
  user: {
    name: string;
    avatar: string;
  };
}

export default function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticles() {
      try {
        // 检查和清理 URL
        let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        let supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        
        // 移除可能的尾部斜杠
        supabaseUrl = supabaseUrl.replace(/\/$/, '');
        
        console.log('=== Supabase 配置 ===');
        console.log('URL:', supabaseUrl);
        console.log('Key长度:', supabaseKey.length);
        console.log('Key前10位:', supabaseKey.substring(0, 10));
        console.log('===================');

        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Supabase 配置缺失');
        }

        console.log('正在创建 Supabase 客户端...');
        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        });
        console.log('Supabase 客户端创建成功');

        // 先尝试一个简单的查询来测试连接
        console.log('正在测试数据库连接...');
        const { data: testData, error: testError } = await supabase
          .from('articles')
          .select('count');

        if (testError) {
          throw new Error(`数据库连接测试失败: ${testError.message}`);
        }

        console.log('数据库连接测试成功，开始查询文章');
        console.log('测试查询结果:', testData);

        // 获取文章数据
        const { data: articles, error } = await supabase
          .from('articles')
          .select(`
            article_id,
            title,
            content,
            created_at,
            user_id,
            level,
            tags,
            likes_count,
            comments_count,
            favorites_count,
            users!articles_user_id_fkey (
              name,
              avatar
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(`获取文章数据错误: ${error.message}`);
        }

        if (!articles || articles.length === 0) {
          console.log('没有找到文章数据');
          setArticles([]);
          return;
        }

        console.log('=== 成功获取文章 ===');
        console.log('文章数量:', articles.length);
        console.log('第一篇文章:', {
          id: articles[0].article_id,
          title: articles[0].title,
          userId: articles[0].user_id,
          hasContent: !!articles[0].content,
          contentType: typeof articles[0].content,
          hasUser: !!articles[0].users,
          userInfo: articles[0].users
        });
        console.log('===================');

        const processedArticles = articles.map((article: any): Article => {
          console.log(`处理文章 ${article.article_id}:`, {
            contentType: typeof article.content,
            tagsType: typeof article.tags,
            hasUser: !!article.users
          });

          return {
            ...article,
            content: typeof article.content === 'string'
              ? JSON.parse(article.content)
              : article.content || [],
            tags: Array.isArray(article.tags) 
              ? article.tags 
              : typeof article.tags === 'string'
                ? article.tags.split(',').map((tag: string) => tag.trim())
                : [],
            user: {
              name: article.users?.name || '作者未知',
              avatar: article.users?.avatar || '👤'
            }
          };
        });

        console.log('数据处理完成，返回文章数量:', processedArticles.length);
        setArticles(processedArticles);
      } catch (error) {
        console.error('获取文章失败:', error);
        setError(error instanceof Error ? error.message : '未知错误');
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-red-600">加载失败</h2>
        <p className="text-gray-500 mt-2">{error}</p>
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-600">暂无文章</h2>
        <p className="text-gray-500 mt-2">请稍后再试</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {articles.map((post: Article) => (
        <Link key={post.article_id} href={`/post/${post.article_id}`} className="block">
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow h-full">
            <div className="flex flex-col h-full p-4">
              <div className="flex-1">
                {/* 标题 */}
                <h2 className="text-lg font-semibold mb-2 line-clamp-2 text-gray-900">{post.title}</h2>

                {/* 标签信息 */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {Array.isArray(post.tags) && post.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="inline-block text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full whitespace-nowrap"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 文章内容 */}
                <p className="text-sm text-gray-600 line-clamp-2">
                  {post.content?.[0] 
                    ? `${post.content[0].speaker}: ${post.content[0].text}` 
                    : '暂无内容'}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                {/* 底部作者信息和互动数据 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <div className="text-2xl">{post.user.avatar || '👤'}</div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{post.user.name || '作者未知'}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end ml-6">
                    <InteractionButtons
                      articleId={post.article_id}
                      initialLikes={post.likes_count}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 