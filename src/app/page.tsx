import { Suspense } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import InteractionButtons from '@/components/InteractionButtons';

interface User {
  user_id: string;
  name: string;
  avatar: string;
  style_description: string;
}

interface Article {
  article_id: string;
  title: string;
  content: string;
  level: string;
  topic: string;
  created_at: string;
  vocabularies: any[];
  key_phrases: any[];
  learning_points: string[];
  likes_count: number;
  favorites_count: number;
  comments_count: number;
  users: User;
}

type SupabaseArticle = {
  article_id: string;
  title: string;
  content: string;
  level: string;
  topic: string;
  created_at: string;
  vocabularies: string | any[];
  key_phrases: string | any[];
  learning_points: string | string[];
  likes_count: number;
  favorites_count: number;
  comments_count: number;
  users: {
    user_id: string;
    name: string;
    avatar: string;
    style_description: string;
  };
};

async function getArticles() {
  try {
    // 先检查数据库连接
    const { data: countData, error: connectionError } = await supabase.from('articles').select('count');
    if (connectionError) {
      console.error('数据库连接错误:', {
        message: connectionError.message,
        code: connectionError.code,
        details: connectionError.details,
        hint: connectionError.hint
      });
      return [];
    }
    
    console.log('数据库连接成功，开始获取文章数据');

    // 获取文章数据
    const { data: articles, error } = await supabase
      .from('articles')
      .select(`
        *,
        users (
          user_id,
          name,
          avatar,
          style_description
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取文章数据错误:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        status: error.status
      });
      return [];
    }

    if (!articles || articles.length === 0) {
      console.log('没有找到文章数据');
      return [];
    }

    console.log('成功获取文章数据，原始数据:', articles);

    return articles.map(article => ({
      ...article,
      vocabularies: typeof article.vocabularies === 'string' 
        ? JSON.parse(article.vocabularies) 
        : article.vocabularies || [],
      key_phrases: typeof article.key_phrases === 'string'
        ? JSON.parse(article.key_phrases)
        : article.key_phrases || [],
      learning_points: typeof article.learning_points === 'string'
        ? JSON.parse(article.learning_points)
        : article.learning_points || []
    })) as Article[];
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          <Suspense fallback={
            <div className="col-span-full text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-500" />
            </div>
          }>
            {articles.map((post: Article) => (
              <Link key={post.article_id} href={`/post/${post.article_id}`} className="block">
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow h-full">
                  <div className="p-4">
                    {/* 标题 */}
                    <h2 className="text-lg font-semibold mb-3 line-clamp-2 text-gray-900">{post.title}</h2>

                    {/* 文章内容 */}
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {post.content.split('\\n')[0]}
                    </p>

                    {/* 标签信息 */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                        难度: {post.level}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                        话题: {post.topic}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                        {post.vocabularies.length} 个生词
                      </span>
                    </div>

                    {/* 互动数据 */}
                    <div className="mb-4">
                      <InteractionButtons
                        articleId={post.article_id}
                        initialLikes={post.likes_count}
                        initialFavorites={post.favorites_count}
                        initialComments={post.comments_count}
                      />
                      <span className="text-xs text-gray-500 ml-4">{formatDate(post.created_at)}</span>
                    </div>

                    {/* 分隔线 */}
                    <div className="border-t border-gray-100 -mx-4 mb-3"></div>

                    {/* 底部作者信息和操作区 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="text-2xl">{post.users?.avatar || '👤'}</div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{post.users?.name || '作者未知'}</div>
                          <div className="text-xs text-gray-500 line-clamp-1">{post.users?.style_description || '暂无描述'}</div>
                        </div>
                      </div>
                      <span className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                        查看详情
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </Suspense>
        </div>
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
