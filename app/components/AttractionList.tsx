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
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No attractions found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {attractions.map(attraction => (
        <div
          key={attraction.id}
          className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onSelect(attraction.id)}
        >
          <div className="flex items-start space-x-4">
            {attraction.images?.[0] && (
              <img
                src={attraction.images[0].url}
                alt={attraction.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
            )}
            <div className="flex-grow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {attraction.name}
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {attraction.type.charAt(0).toUpperCase() + attraction.type.slice(1)}
              </div>
              {attraction.classifications?.[0]?.segment && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {attraction.classifications[0].segment.name}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttractionList;
