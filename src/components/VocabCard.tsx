interface VocabCardProps {
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  translation: string;
}

export default function VocabCard({ word, phonetic, meaning, example, translation }: VocabCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{word}</h3>
          <p className="text-sm text-gray-500">{phonetic}</p>
        </div>
        <button className="text-blue-500 hover:text-blue-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div className="mt-3">
        <p className="text-gray-700">{meaning}</p>
      </div>

      <div className="mt-3 bg-gray-50 rounded-lg p-3">
        <p className="text-sm text-gray-800 font-medium">例句：</p>
        <p className="text-sm text-gray-600 mt-1">{example}</p>
        <p className="text-sm text-gray-500 mt-1">{translation}</p>
      </div>
    </div>
  );
} 