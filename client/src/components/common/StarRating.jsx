import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, totalReviews, size = 16, interactive = false, onRate }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {stars.map((star) => {
          const isFilled = rating >= star;
          const isHalf = rating >= star - 0.5 && rating < star;

          return (
            <button
              key={star}
              type={interactive ? 'button' : undefined}
              disabled={!interactive}
              onClick={() => interactive && onRate && onRate(star)}
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
            >
              <Star
                size={size}
                className={`${
                  isFilled
                    ? 'text-amber-400 fill-amber-400'
                    : isHalf
                    ? 'text-amber-400 fill-amber-200'
                    : 'text-slate-300'
                }`}
              />
            </button>
          );
        })}
      </div>
      {rating > 0 && (
        <span className="text-xs font-semibold text-slate-700">
          {Number(rating).toFixed(1)}
        </span>
      )}
      {totalReviews !== undefined && (
        <span className="text-xs text-slate-500">
          ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
};

export default StarRating;

