import { FC } from 'react';
import { Event } from '../lib/types';
import ClassificationIcon from './ClassificationIcon';
import { buildLocalEventDate, formatDisplayTime } from '../utils/date';

interface EventRowProps {
  event: Event;
  isLastViewed: boolean;
  onSelect: (eventId: string) => void;
}

const formatPlace = (venue: NonNullable<NonNullable<Event['_embedded']>['venues']>[number]) =>
  [
    venue.city?.name,
    venue.state?.stateCode,
    venue.country?.name !== 'United States Of America' ? venue.country?.name : null,
  ]
    .filter(Boolean)
    .join(', ');

const EventRow: FC<EventRowProps> = ({ event, isLastViewed, onSelect }) => {
  const venue = event._embedded?.venues?.[0];
  const segment = event.classifications?.[0]?.segment?.name;
  const { localDate, localTime } = event.dates.start;

  return (
    <button
      type="button"
      data-event-id={event.id}
      onClick={() => onSelect(event.id)}
      className={`group grid w-full grid-cols-[4.5rem_1fr] gap-4 rounded-lg px-3 py-3 text-left transition-colors
        hover:bg-surface-50 dark:hover:bg-surface-900
        ${isLastViewed ? 'bg-surface-50 dark:bg-surface-900' : ''}`}
    >
      <span className="pt-0.5 text-sm font-semibold tabular-nums text-accent-700 dark:text-accent-300">
        {localTime ? formatDisplayTime(buildLocalEventDate(localDate, localTime)) : 'TBA'}
      </span>
      <span className="min-w-0">
        <span className="flex items-start justify-between gap-3">
          <span className="font-semibold text-surface-950 dark:text-white line-clamp-2 group-hover:underline underline-offset-4 decoration-1">
            {event.name}
          </span>
          {segment && (
            <span className="shrink-0 pt-0.5 text-surface-400 dark:text-surface-500" title={segment}>
              <ClassificationIcon segmentName={segment} className="h-4 w-4" />
              <span className="sr-only">{segment}</span>
            </span>
          )}
        </span>
        <span className="mt-0.5 block truncate text-sm text-surface-500 dark:text-surface-400">
          {venue?.name || 'Venue TBA'}
          {venue && formatPlace(venue) && <> · {formatPlace(venue)}</>}
        </span>
      </span>
    </button>
  );
};

export default EventRow;
