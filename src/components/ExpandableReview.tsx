import React from 'react';
import type { Review } from '../types';
import { formatStars } from '../utils/format';

interface ExpandableReviewProps {
  review: Review;
}

export const ExpandableReview: React.FC<ExpandableReviewProps> = ({ review }) => {
  const hasRating = review.rating !== null && review.rating !== undefined;

  return (
    <article className="rev">
      <div className="rh">
        <b>{review.memberName}</b>
        {hasRating ? (
          <span
            className="nota"
            aria-label={`${review.rating} de 5 estrelas`}
          >
            {formatStars(review.rating!)}
          </span>
        ) : (
          <span className="mut" style={{ fontSize: 14 }}>
            ainda não avaliou
          </span>
        )}
      </div>

      {review.reviewText && (
        <details>
          <summary>Ler crítica (pode ter spoilers)</summary>
          <p>{review.reviewText}</p>
          {review.letterboxdUrl && (
            <a
              href={review.letterboxdUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver no Letterboxd
            </a>
          )}
        </details>
      )}
    </article>
  );
};
