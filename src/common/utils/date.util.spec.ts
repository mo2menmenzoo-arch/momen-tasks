import { DateUtil } from './date.util';

describe('DateUtil', () => {
  describe('toUTC', () => {
    it('should convert a date string to a Date', () => {
      const result = DateUtil.toUTC('2024-01-15T10:00:00Z');
      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe('2024-01-15T10:00:00.000Z');
    });

    it('should return the same Date instance when given a Date', () => {
      const input = new Date('2024-06-01T12:00:00Z');
      const result = DateUtil.toUTC(input);
      expect(result.getTime()).toBe(input.getTime());
    });

    it('should handle invalid date strings', () => {
      const result = DateUtil.toUTC('not-a-date');
      expect(result.toString()).toBe('Invalid Date');
    });
  });

  describe('startOfDay', () => {
    it('should set time to 00:00:00.000', () => {
      const result = DateUtil.startOfDay('2024-03-15T14:30:00Z');
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it('should preserve the date portion', () => {
      const result = DateUtil.startOfDay('2024-12-25T18:00:00Z');
      expect(result.getDate()).toBe(25);
      expect(result.getMonth()).toBe(11); // December
      expect(result.getFullYear()).toBe(2024);
    });
  });

  describe('endOfDay', () => {
    it('should set time to 23:59:59.999', () => {
      const result = DateUtil.endOfDay('2024-03-15T14:30:00Z');
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });
  });

  describe('daysBetween', () => {
    it('should return 0 for the same day', () => {
      const d = new Date('2024-01-01');
      expect(DateUtil.daysBetween(d, d)).toBe(0);
    });

    it('should return positive difference when end is after start', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-10');
      expect(DateUtil.daysBetween(start, end)).toBe(9);
    });

    it('should handle crossing month boundaries', () => {
      const start = new Date('2024-01-31');
      const end = new Date('2024-02-01');
      expect(DateUtil.daysBetween(start, end)).toBe(1);
    });

    it('should handle crossing year boundaries', () => {
      const start = new Date('2023-12-31');
      const end = new Date('2024-01-01');
      expect(DateUtil.daysBetween(start, end)).toBe(1);
    });
  });

  describe('isToday', () => {
    it('should return true for the current date', () => {
      expect(DateUtil.isToday(new Date())).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(DateUtil.isToday(yesterday)).toBe(false);
    });

    it('should return false for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(DateUtil.isToday(tomorrow)).toBe(false);
    });
  });
});
