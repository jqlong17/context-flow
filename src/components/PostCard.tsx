import Link from 'next/link';

interface PostCardProps {
  id: string;
  title: string;
  content: string;
  level: string;
  topic: string;
}

export default function PostCard({ id, title, content, level, topic }: PostCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <Link href={`/post/${id}`} className="block p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4 line-clamp-2">{title}</h2>
        <p className="text-sm md:text-base text-gray-600 line-clamp-3 mb-3 md:mb-4">{content}</p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-xs md:text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
              难度: {level}
            </span>
            <span className="text-xs md:text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
              话题: {topic}
            </span>
          </div>
          <span className="text-xs md:text-sm text-blue-600 hover:text-blue-800">
            查看详情 →
          </span>
        </div>
      </Link>
    </div>
  );
} 