'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface Comment {
  comment_id: number;
  content: string;
  created_at: string;
  user: {
    name: string;
    avatar: string;
  };
}

interface CommentSectionProps {
  articleId: number;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  const loadComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select(`
        comment_id,
        content,
        created_at,
        user:users (
          name,
          avatar
        )
      `)
      .eq('article_id', articleId)
      .order('created_at', { ascending: false });

    if (data) {
      setComments(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const { error } = await supabase
      .from('comments')
      .insert([
        {
          article_id: articleId,
          content: newComment,
          user_id: 'u1' // 临时使用固定用户ID
        }
      ]);

    if (!error) {
      setNewComment('');
      loadComments();
    }
  };

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold mb-6">评论</h2>
      
      {/* 评论输入框 */}
      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-4 border rounded-lg resize-none"
          rows={4}
          placeholder="写下你的评论..."
        />
        <button
          type="submit"
          className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          发表评论
        </button>
      </form>

      {/* 评论列表 */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.comment_id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-2">{comment.user.avatar}</span>
              <div>
                <div className="font-medium">{comment.user.name}</div>
                <time className="text-sm text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString()}
                </time>
              </div>
            </div>
            <p className="text-gray-700">{comment.content}</p>
          </div>
        ))}
      </div>
    </section>
  );
} 