import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface CommentInputProps {
  articleId: string;
  onClose: () => void;
  onSubmit: () => void;
  isVisible: boolean;
}

export default function CommentInput({ articleId, onClose, onSubmit, isVisible }: CommentInputProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // 生成一个新的 interaction_id
      const timestamp = new Date().getTime();
      const randomStr = Math.random().toString(36).substring(2, 5);
      const interactionId = `i_${timestamp}_${randomStr}`;

      // 插入评论
      const { error: commentError } = await supabase
        .from('interactions')
        .insert([
          {
            interaction_id: interactionId,
            article_id: parseInt(articleId),
            user_id: 'u1',
            type: 'comment',
            content: content.trim()
          }
        ]);

      if (commentError) {
        console.error('提交评论失败:', {
          message: commentError.message,
          details: commentError.details,
          hint: commentError.hint,
          code: commentError.code
        });
        return;
      }

      setContent('');
      onSubmit();
      onClose();
    } catch (error) {
      console.error('提交评论时发生错误:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 bg-white border-t transform transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex space-x-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的想法..."
            className="flex-1 h-20 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            autoFocus
          />
          <div className="flex flex-col justify-between">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300"
            >
              {isSubmitting ? '发送中...' : '发送'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 