import { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import InteractionButtons from '@/components/InteractionButtons';
import ArticleList from '@/components/ArticleList';

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

interface DatabaseArticle {
  article_id: number;
  title: string;
  content: string | DialogueContent[];
  created_at: string;
  user_id: string;
  level: string;
  tags: string[] | string;
  likes_count: number;
  comments_count: number;
  favorites_count: number;
  users: {
    name: string;
    avatar: string;
  } | null;
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
      console.error('Supabase 配置缺失');
      return [];
    }

    console.log('正在创建 Supabase 客户端...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase 客户端创建成功');

    // 先尝试一个简单的查询来测试连接
    console.log('正在测试数据库连接...');
    const { data: testData, error: testError } = await supabase
      .from('articles')
      .select('count');

    if (testError) {
      console.error('数据库连接测试失败:', {
        message: testError.message,
        code: testError.code,
        details: testError.details,
        hint: testError.hint,
        status: testError.status
      });
      return [];
    }

    console.log('数据库连接测试成功，开始查询文章');
    console.log('测试查询结果:', testData);

    // 获取文章数据
    const query = supabase
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

    console.log('执行查询:', query.toURL());
    
    const { data: articles, error } = await query;

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

    const processedArticles = (articles as DatabaseArticle[]).map((article): Article => {
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
    return processedArticles;
  } catch (error) {
    console.error('处理文章数据时发生异常:', {
      错误类型: error?.constructor?.name,
      消息: error instanceof Error ? error.message : String(error),
      堆栈: error instanceof Error ? error.stack : undefined
    });
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
    return hours + '小时前';
  }
  
  // 小于30天显示"x天前"
  if (diff < 30 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return days + '天前';
  }
  
  // 其他情况显示具体日期
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export default function Home() {
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
        
        <ArticleList />
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
