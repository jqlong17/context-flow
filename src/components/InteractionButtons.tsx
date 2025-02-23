'use client';

import { useState } from 'react';

interface InteractionButtonsProps {
  articleId: number;
  initialLikes?: number;
  initialFavorites?: number;
}

export default function InteractionButtons({
  articleId,
  initialLikes = 0,
  initialFavorites = 0
}: InteractionButtonsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [favorites, setFavorites] = useState(initialFavorites);

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setLikes(prev => prev + 1)}
        className="text-gray-500 hover:text-red-500 transition-colors"
      >
        ❤️ {likes}
      </button>
      <button
        onClick={() => setFavorites(prev => prev + 1)}
        className="text-gray-500 hover:text-yellow-500 transition-colors"
      >
        ⭐️ {favorites}
      </button>
    </div>
  );
} 