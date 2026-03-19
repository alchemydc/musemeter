import { FC } from 'react';

interface Attraction {
  id: string;
  name: string;
  type: string;
  images?: {
    url: string;
    ratio: string;
    width: number;
    height: number;
  }[];
  classifications?: {
    primary: boolean;
    segment: {
      id: string;
      name: string;
    };
  }[];
}

interface AttractionListProps {
  attractions: Attraction[];
  onSelect: (attractionId: string) => void;
}

const AttractionList: FC<AttractionListProps> = ({ attractions, onSelect }) => {
  if (!attractions.length) {
    return (
      <div className="text-center py-16 text-surface-400 dark:text-surface-500">
        <svg className="mx-auto h-12 w-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        <p className="text-sm font-medium">No attractions found</p>
        <p className="text-xs mt-1">Try a different search term</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {attractions.map(attraction => (
        <div
          key={attraction.id}
          className="bg-white dark:bg-surface-900 rounded-xl overflow-hidden shadow-sm cursor-pointer
            hover:shadow-md hover:scale-[1.02] transition-all"
          onClick={() => onSelect(attraction.id)}
        >
          {attraction.images?.[0] ? (
            <img
              src={attraction.images[0].url}
              alt={attraction.name}
              className="w-full h-32 object-cover"
            />
          ) : (
            <div className="w-full h-32 bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
              <svg className="h-10 w-10 text-surface-300 dark:text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
          )}
          <div className="p-3">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white line-clamp-2">
              {attraction.name}
            </h3>
            <div className="text-xs text-surface-500 dark:text-surface-400 mt-1">
              {attraction.classifications?.[0]?.segment?.name ||
                (attraction.type.charAt(0).toUpperCase() + attraction.type.slice(1))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttractionList;
