import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Comment {
  interaction_id: string;
  user_id: string;
  content: string;
  translation?: string;
  created_at: string;
  type: 'comment' | 'reply';
  parent_interaction_id?: string;
  users: {
    user_id: string;
    name: string;
    avatar: string;
  };
  replies?: Comment[];
}

interface CommentSectionProps {
  articleId: string;
  initialComments: Comment[];
}

export default function CommentSection({ articleId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [commentContent, setCommentContent] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 获取评论列表
  async function fetchComments() {
    const { data: commentsData, error } = await supabase
      .from('interactions')
      .select(`
        interaction_id,
        user_id,
        content,
        translation,
        created_at,
        type,
        parent_interaction_id,
        users (
          user_id,
          name,
          avatar
        )
      `)
      .eq('article_id', articleId)
      .in('type', ['comment', 'reply'])
      .order('created_at', { ascending: true });

    if (error) {
      console.error('获取评论失败:', error);
      return;
    }

    // 组织评论树结构
    const commentTree = (commentsData || []).reduce<Comment[]>((acc, comment) => {
      const typedComment = comment as unknown as Comment;
      if (typedComment.type === 'reply' && typedComment.parent_interaction_id) {
        const parentComment = acc.find(c => c.interaction_id === typedComment.parent_interaction_id);
        if (parentComment) {
          parentComment.replies = parentComment.replies || [];
          parentComment.replies.push(typedComment);
        }
        return acc;
      }
      acc.push({ ...typedComment, replies: [] });
      return acc;
    }, []);

    setComments(commentTree);
  }

  // 提交评论
  const handleSubmitComment = async () => {
    if (!commentContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('interactions')
        .insert([
          {
            article_id: articleId,
            user_id: 'test-user', // 在实际应用中应该使用真实的用户ID
            type: replyTo ? 'reply' : 'comment',
            content: commentContent,
            parent_interaction_id: replyTo?.interaction_id
          }
        ]);

      if (error) {
        console.error('提交评论失败:', error);
        return;
      }

      // 重新获取评论列表
      setCommentContent('');
      setReplyTo(null);
      await fetchComments();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="comments-section" className="mt-8 pt-6 border-t">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">学习心得</h2>
        <span className="text-sm text-gray-500">{comments.length} 条评论</span>
      </div>
      
      {/* 评论列表 */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.interaction_id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{comment.users.avatar}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{comment.users.name}</h3>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <p className="mt-2 text-gray-800">{comment.content}</p>
                {comment.translation && (
                  <p className="mt-1 text-gray-600 text-sm">{comment.translation}</p>
                )}
                <div className="mt-3 flex items-center space-x-4">
                  <button 
                    className="flex items-center text-gray-500 hover:text-blue-500 transition-colors"
                    onClick={() => setReplyTo(comment)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">回复</span>
                  </button>
                </div>

                {/* 回复列表 */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 ml-6 space-y-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.interaction_id} className="bg-white rounded-lg p-3">
                        <div className="flex items-start space-x-3">
                          <div className="text-xl">{reply.users.avatar}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">{reply.users.name}</h4>
                              <span className="text-xs text-gray-500">
                                {new Date(reply.created_at).toLocaleDateString('zh-CN')}
                              </span>
                            </div>
                            <p className="mt-1 text-gray-800">{reply.content}</p>
                            {reply.translation && (
                              <p className="mt-1 text-gray-600 text-sm">{reply.translation}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 评论输入框 */}
      <div className="mt-6">
        {replyTo && (
          <div className="mb-2 flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg">
            <span className="text-sm text-gray-600">
              回复 {replyTo.users.name}
            </span>
            <button 
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setReplyTo(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex space-x-4">
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder={replyTo ? "写下你的回复..." : "写下你的想法..."}
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <button
            onClick={handleSubmitComment}
            disabled={isSubmitting || !commentContent.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300"
          >
            {isSubmitting ? "发送中..." : "发送"}
          </button>
        </div>
      </div>
    </div>
  );
} 