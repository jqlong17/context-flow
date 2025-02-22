'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface InteractionButtonsProps {
  articleId: string;
  initialLikes: number;
  initialFavorites: number;
  initialComments: number;
  userId?: string;
}

export default function InteractionButtons({
  articleId,
  initialLikes,
  initialFavorites,
  initialComments,
  userId
}: InteractionButtonsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [favorites, setFavorites] = useState(initialFavorites);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // 检查用户是否已经点赞或收藏
  useEffect(() => {
    async function checkUserInteractions() {
      if (!userId) return;

      const { data: userLikes } = await supabase
        .from('interactions')
        .select('interaction_id')
        .eq('article_id', articleId)
        .eq('user_id', userId)
        .eq('type', 'like')
        .single();

      const { data: userFavorites } = await supabase
        .from('interactions')
        .select('interaction_id')
        .eq('article_id', articleId)
        .eq('user_id', userId)
        .eq('type', 'favorite')
        .single();

      setIsLiked(!!userLikes);
      setIsFavorited(!!userFavorites);
    }

    checkUserInteractions();
  }, [articleId, userId]);

  // 处理点赞
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); // 阻止链接跳转
    if (!userId) {
      alert('请先登录');
      return;
    }

    if (isLiked) {
      // 取消点赞
      const { error } = await supabase
        .from('interactions')
        .delete()
        .eq('article_id', articleId)
        .eq('user_id', userId)
        .eq('type', 'like');

      if (!error) {
        setLikes(prev => prev - 1);
        setIsLiked(false);
      }
    } else {
      // 添加点赞
      const { error } = await supabase
        .from('interactions')
        .insert([
          {
            article_id: articleId,
            user_id: userId,
            type: 'like'
          }
        ]);

      if (!error) {
        setLikes(prev => prev + 1);
        setIsLiked(true);
      }
    }
  };

  // 处理收藏
  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // 阻止链接跳转
    if (!userId) {
      alert('请先登录');
      return;
    }

    if (isFavorited) {
      // 取消收藏
      const { error } = await supabase
        .from('interactions')
        .delete()
        .eq('article_id', articleId)
        .eq('user_id', userId)
        .eq('type', 'favorite');

      if (!error) {
        setFavorites(prev => prev - 1);
        setIsFavorited(false);
      }
    } else {
      // 添加收藏
      const { error } = await supabase
        .from('interactions')
        .insert([
          {
            article_id: articleId,
            user_id: userId,
            type: 'favorite'
          }
        ]);

      if (!error) {
        setFavorites(prev => prev + 1);
        setIsFavorited(true);
      }
    }
  };

  return (
    <div className="flex items-center space-x-4 text-xs text-gray-500">
      <button
        onClick={handleLike}
        className={`flex items-center ${isLiked ? 'text-blue-600' : ''}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
        </svg>
        {likes}
      </button>
      <button
        onClick={handleFavorite}
        className={`flex items-center ${isFavorited ? 'text-blue-600' : ''}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
        </svg>
        {favorites}
      </button>
      <span className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
        </svg>
        {initialComments}
      </span>
    </div>
  );
} 