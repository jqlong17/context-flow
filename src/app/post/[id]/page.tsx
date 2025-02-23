import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import ChatBubble from '@/components/ChatBubble';
import VocabCard from '@/components/VocabCard';
import CommentInput from '@/components/CommentInput';
import CommentSection from '@/components/CommentSection';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: false
    }
  }
);

interface Vocabulary {
  word: string;
  meaning: string;
  phonetic: string;
  example: string;
  translation: string;
}

interface KeyPhrase {
  phrase: string;
  meaning: string;
  category: string;
  example?: string;
  translation?: string;
}

interface DialogueContent {
  speaker: string;
  text: string;
}

interface Post {
  article_id: number;
  title: string;
  content: DialogueContent[];
  level: string;
  tags: string[];
  vocabularies: Vocabulary[];
  key_phrases: KeyPhrase[];
  learning_points: string[];
  user_id: string;
  users: {
    user_id: string;
    name: string;
    avatar: string;
    style_description: string;
  };
  likes_count: number;
  favorites_count: number;
  comments_count: number;
}

// 获取所有需要高亮的单词和短语
const getHighlights = (post: Post) => {
  return [
    ...post.vocabularies.map(v => v.word),
    ...post.key_phrases.map(p => p.phrase)
  ];
};

// 按类别分组关键短语
const groupPhrasesByCategory = (phrases: KeyPhrase[]) => {
  return phrases.reduce((acc, phrase) => {
    if (!acc[phrase.category]) {
      acc[phrase.category] = [];
    }
    acc[phrase.category].push(phrase);
    return acc;
  }, {} as Record<string, KeyPhrase[]>);
};

// 修改 categoryStyles 定义，添加默认样式
const categoryStyles = {
  expression: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    title: 'text-blue-800',
    heading: '实用表达'
  },
  response: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    title: 'text-purple-800',
    heading: '回应技巧'
  },
  technique: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    title: 'text-green-800',
    heading: '对话技巧'
  },
  conjunction: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    title: 'text-yellow-800',
    heading: '常用连接词'
  },
  default: {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    title: 'text-gray-800',
    heading: '其他'
  }
} as const;

type CategoryStyleKey = keyof typeof categoryStyles;

// 获取类别样式的辅助函数
const getCategoryStyle = (category: string) => {
  const key = category as CategoryStyleKey;
  return categoryStyles[key] || categoryStyles.default;
};

// 添加高亮文本处理函数
const highlightText = (text: string, highlights: string[]) => {
  if (!highlights.length) return text;
  
  const regex = new RegExp(`(${highlights.join('|')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => {
    if (highlights.some(h => h.toLowerCase() === part.toLowerCase())) {
      return `<span class="bg-yellow-100 px-0.5 rounded">${part}</span>`;
    }
    return part;
  }).join('');
};

async function getPost(id: string) {
  try {
    console.log('Fetching post with ID:', id);
    const { data: post, error } = await supabase
      .from('articles')
      .select(`
        article_id,
        title,
        content,
        level,
        tags,
        vocabularies,
        key_phrases,
        learning_points,
        user_id,
        likes_count,
        comments_count,
        favorites_count,
        users!articles_user_id_fkey (
          user_id,
          name,
          avatar,
          style_description
        )
      `)
      .eq('article_id', id)
      .single();

    if (error) {
      console.error('Error fetching post:', error);
      return null;
    }

    if (!post || !post.users) {
      console.log('No post found with ID:', id);
      return null;
    }

    console.log('Post data:', post);

    // 处理数据
    const processedPost = {
      ...post,
      content: typeof post.content === 'string' ? JSON.parse(post.content) : post.content || [],
      vocabularies: typeof post.vocabularies === 'string' ? JSON.parse(post.vocabularies) : post.vocabularies || [],
      key_phrases: typeof post.key_phrases === 'string' ? JSON.parse(post.key_phrases) : post.key_phrases || [],
      learning_points: typeof post.learning_points === 'string' ? JSON.parse(post.learning_points) : post.learning_points || [],
      tags: Array.isArray(post.tags) ? post.tags : typeof post.tags === 'string' ? post.tags.split(',').map(tag => tag.trim()) : [],
      users: Array.isArray(post.users) ? post.users[0] : post.users
    } as Post;

    return processedPost;
  } catch (error) {
    console.error('Error in getPost:', error);
    return null;
  }
}

export default async function PostPage({ params }: { params: { id: string } }) {
  console.log('Rendering PostPage with ID:', params.id);
  const post = await getPost(params.id);

  if (!post) {
    console.log('Post not found, redirecting to 404');
    notFound();
  }

  const conversations = post.content;
  const vocabularies = post.vocabularies;
  const keyPhrases = post.key_phrases;
  const learningPoints = post.learning_points;
  const highlights = getHighlights(post);
  const groupedPhrases = groupPhrasesByCategory(keyPhrases);
  const author = post.users;

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Link 
                href="/"
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div className="text-2xl">{author?.avatar || '👤'}</div>
              <div>
                <h3 className="font-medium text-gray-900 text-sm leading-tight">{author?.name || '作者未知'}</h3>
                <p className="text-xs text-gray-500">{author?.style_description || '暂无描述'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-2.5 py-1 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-full text-xs transition-colors">
                关注
              </button>
              <button className="p-1.5 border border-gray-300 hover:bg-gray-50 rounded-full text-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 -mx-6 mb-4"></div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h1>
            <div className="flex gap-2">
              <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                难度: {post.level}
              </span>
              {post.tags && post.tags.map((tag: string) => (
                <span key={tag} className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {conversations.map((dialogue, index) => {
              const isFirstSpeaker = index === 0 ? true : dialogue.speaker !== conversations[index - 1].speaker;
              const alignment = dialogue.speaker === conversations[0].speaker ? 'justify-start' : 'justify-end';
              const bgColor = dialogue.speaker === conversations[0].speaker ? 'bg-blue-50' : 'bg-green-50';
              const highlightedText = highlightText(dialogue.text, highlights);

              return (
                <div key={index} className={`flex ${alignment}`}>
                  <div className={`max-w-[80%] ${bgColor} rounded-lg px-4 py-2`}>
                    <div className="text-sm font-medium text-gray-900 mb-1">{dialogue.speaker}</div>
                    <div 
                      className="text-gray-800"
                      dangerouslySetInnerHTML={{ __html: highlightedText }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">重点单词</h2>
              <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
                添加到生词本
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {vocabularies.map((vocab: Vocabulary, index: number) => (
                <VocabCard key={index} {...vocab} />
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t">
            <h2 className="text-xl font-semibold mb-4">学习要点</h2>
            <div className="space-y-4">
              {Object.entries(groupedPhrases).map(([category, phrases]) => {
                const style = getCategoryStyle(category);
                return (
                  <div
                    key={category}
                    className={`${style.bg} rounded-lg p-4`}
                  >
                    <h3 className={`font-medium ${style.title} mb-2`}>
                      {style.heading}
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      {phrases.map((phrase: KeyPhrase, index: number) => (
                        <li key={index}>
                          <span className={`font-bold ${style.text}`}>
                            {phrase.phrase}
                          </span>
                          <span className={style.text}>
                            {' - ' + phrase.meaning}
                          </span>
                          {phrase.example && (
                            <div className="ml-5 mt-1">
                              <p className="text-sm text-gray-600">{phrase.example}</p>
                              <p className="text-sm text-gray-500">{phrase.translation}</p>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {learningPoints && (
              <div className="mt-6 bg-indigo-50 rounded-lg p-4">
                <h3 className="font-medium text-indigo-800 mb-2">总结提示</h3>
                <ul className="list-disc list-inside space-y-1">
                  {learningPoints.map((point: string, index: number) => (
                    <li key={index} className="text-indigo-700">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* 评论区域 */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">评论</h2>
          <CommentSection articleId={post.article_id} />
        </div>
      </div>

      {/* 底部工具栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center space-x-4">
          {/* 评论输入框 */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="写下你的想法..."
              className="w-full h-10 px-4 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              readOnly
            />
          </div>

          {/* 互动按钮组 */}
          <div className="flex items-center space-x-4">
            <button className="flex items-center text-gray-600 hover:text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="ml-1 text-sm">{post.likes_count || 0}</span>
            </button>
            <button className="flex items-center text-gray-600 hover:text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="ml-1 text-sm">{post.favorites_count || 0}</span>
            </button>
            <button className="flex items-center text-gray-600 hover:text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="ml-1 text-sm">{post.comments_count || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
} 