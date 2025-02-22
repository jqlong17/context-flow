interface ChatBubbleProps {
  message: string;
  speaker: string;
  isRight?: boolean;
  highlights?: string[]; // 需要高亮的单词列表
}

export default function ChatBubble({ message, speaker, isRight = false, highlights = [] }: ChatBubbleProps) {
  // 高亮处理函数
  const highlightText = (text: string) => {
    if (!highlights.length) return text;

    const pattern = new RegExp(`(${highlights.join('|')})`, 'gi');
    return text.split(pattern).map((part, index) => {
      if (highlights.some(word => word.toLowerCase() === part.toLowerCase())) {
        return (
          <span key={index} className="font-bold text-blue-700 dark:text-blue-300">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className={`flex ${isRight ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isRight ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[80%]`}>
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
          {speaker[0].toUpperCase()}
        </div>
        <div className={`mx-2 flex flex-col ${isRight ? 'items-end' : 'items-start'}`}>
          <span className="text-sm text-gray-600 mb-1">{speaker}</span>
          <div
            className={`rounded-2xl px-4 py-2 max-w-lg ${
              isRight
                ? 'bg-blue-500 text-white rounded-tr-none'
                : 'bg-gray-100 text-gray-800 rounded-tl-none'
            }`}
          >
            {highlightText(message)}
          </div>
        </div>
      </div>
    </div>
  );
} 