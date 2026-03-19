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
});
