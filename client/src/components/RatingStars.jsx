import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating = 0, numReviews, size = 14, showScore = true }) => {
  const roundedRating = Math.round(rating * 2) / 2;

  return (
    <div className="flex items-center gap-1 text-[#E5A842]">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={`${
              star <= roundedRating
                ? 'fill-[#E5A842] text-[#E5A842]'
                : star - 0.5 <= roundedRating
                ? 'fill-[#E5A842]/50 text-[#E5A842]'
                : 'fill-[#E7E5E2] text-[#E7E5E2]'
            }`}
          />
        ))}
      </div>
      {showScore && (
        <span className="text-[12px] font-medium text-[#171717] ml-1">
          {rating ? rating.toFixed(1) : '0.0'}
        </span>
      )}
      {numReviews !== undefined && (
        <span className="text-[12px] text-[#6B6B6B]">({numReviews})</span>
      )}
    </div>
  );
};

export default RatingStars;
