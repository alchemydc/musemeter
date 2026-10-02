import * as dateUtils from '../../app/utils/date';

describe('date utils', () => {
  test('buildLocalEventDate constructs a local Date with given date and time components', () => {
    const dt = dateUtils.buildLocalEventDate('2025-09-12', '20:30');
    expect(dt.getFullYear()).toBe(2025);
    expect(dt.getMonth()).toBe(8); // September -> monthIndex 8
    expect(dt.getDate()).toBe(12);
    expect(dt.getHours()).toBe(20);
    expect(dt.getMinutes()).toBe(30);
  });

  test('buildLocalEventDate defaults to midnight when time omitted', () => {
    const dt = dateUtils.buildLocalEventDate('2025-01-05');
    expect(dt.getFullYear()).toBe(2025);
    expect(dt.getMonth()).toBe(0); // January
    expect(dt.getDate()).toBe(5);
    expect(dt.getHours()).toBe(0);
    expect(dt.getMinutes()).toBe(0);
  });

  test('formatDisplayDate returns a non-empty formatted string', () => {
    const dt = dateUtils.buildLocalEventDate('2025-09-12', '20:30');
    const s = dateUtils.formatDisplayDate(dt);
    expect(typeof s).toBe('string');
    expect(s.length).toBeGreaterThan(0);
  });

  test('formatDisplayTime returns a non-empty formatted time string', () => {
    const dt = dateUtils.buildLocalEventDate('2025-09-12', '20:30');
    const s = dateUtils.formatDisplayTime(dt);
    expect(typeof s).toBe('string');
    expect(s.length).toBeGreaterThan(0);
  });

  test('formatCalendarDates returns a floating local range with no UTC conversion', () => {
    expect(dateUtils.formatCalendarDates('2025-09-12', '20:30:00')).toBe('20250912T203000/20250912T233000');
  });

  test('formatCalendarDates rolls the end time past midnight', () => {
    expect(dateUtils.formatCalendarDates('2025-12-31', '22:00:00')).toBe('20251231T220000/20260101T010000');
  });

  test('formatCalendarDates makes an all-day range when there is no start time', () => {
    expect(dateUtils.formatCalendarDates('2025-09-12')).toBe('20250912/20250913');
  });

  test('formatCalendarDates returns an empty string for an invalid date', () => {
    expect(dateUtils.formatCalendarDates('not-a-date', '20:00:00')).toBe('');
  });

  describe('getDayHeading', () => {
    const today = new Date(2025, 8, 12, 15, 0); // Fri 12 Sep 2025, 3pm local

    test('labels today and tomorrow', () => {
      expect(dateUtils.getDayHeading('2025-09-12', today).relative).toBe('Today');
      expect(dateUtils.getDayHeading('2025-09-13', today).relative).toBe('Tomorrow');
      expect(dateUtils.getDayHeading('2025-09-14', today).relative).toBeNull();
    });

    test('returns weekday, day and month parts, omitting the current year', () => {
      expect(dateUtils.getDayHeading('2025-09-14', today)).toEqual({
        relative: null, weekday: 'Sun', day: '14', month: 'Sep', year: null,
      });
    });

    test('includes the year when it differs from today', () => {
      expect(dateUtils.getDayHeading('2026-01-03', today).year).toBe('2026');
    });

    test('returns null for an invalid date', () => {
      expect(dateUtils.getDayHeading('TBA', today)).toBeNull();
    });
  });

  test('groupByLocalDate groups consecutive events by start date, preserving order', () => {
    const ev = (id, localDate) => ({ id, dates: { start: { localDate } } });
    const groups = dateUtils.groupByLocalDate([ev('a', '2025-09-12'), ev('b', '2025-09-12'), ev('c', '2025-09-14')]);
    expect(groups.map(g => [g.localDate, g.items.map(i => i.id)])).toEqual([
      ['2025-09-12', ['a', 'b']],
      ['2025-09-14', ['c']],
    ]);
  });
});
