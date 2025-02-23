import { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import InteractionButtons from '@/components/InteractionButtons';

interface User {
  user_id: string;
  name: string;
  avatar: string;
  style_description: string;
}

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

interface ArticleCounts {
  likes_count: number;
  comments_count: number;
  favorites_count: number;
}

async function getArticles() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

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
        user:users (
          name,
          avatar
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取文章数据错误:', error);
      return [];
    }

    if (!articles || articles.length === 0) {
      console.log('没有找到文章数据');
      return [];
    }

    return articles.map((article: any): Article => ({
      ...article,
      content: typeof article.content === 'string'
        ? JSON.parse(article.content)
        : article.content || [],
      tags: Array.isArray(article.tags) 
        ? article.tags 
        : typeof article.tags === 'string'
          ? article.tags.split(',').map((tag: string) => tag.trim())
          : []
    }));
  } catch (error) {
    console.error('处理文章数据时发生异常:', error);
    return [];
  }
}

// 格式化时间函数
function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // 小于24小时显示"x小时前"
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours}小时前`;
  }
  
  // 小于30天显示"x天前"
  if (diff < 30 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days}天前`;
  }
  
  // 其他情况显示具体日期
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export default async function Home() {
  const articles = await getArticles();

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">语境 Flow</h1>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
        
        {!articles || articles.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-600">暂无文章</h2>
            <p className="text-gray-500 mt-2">请稍后再试</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Suspense fallback={
              <div className="col-span-full text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-500" />
              </div>
            }>
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
            </Suspense>
          </div>
        )}
      </div>

      {/* 底部导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-around">
          <Link href="/" className="flex flex-col items-center text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-0.5">首页</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs mt-0.5">我的</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
