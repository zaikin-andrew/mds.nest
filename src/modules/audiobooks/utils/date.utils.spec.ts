import { toIsoWeek, toYYYYMM } from './date.utils';

describe('toIsoWeek', () => {
  it('week 1 of 2020 — Jan 1 (Wednesday)', () => {
    expect(toIsoWeek(new Date('2020-01-01T00:00:00Z'))).toBe('2020-W01');
  });

  it('week 1 of 2020 — Jan 5 (Sunday)', () => {
    expect(toIsoWeek(new Date('2020-01-05T00:00:00Z'))).toBe('2020-W01');
  });

  it('week 2 of 2020 — Jan 6 (Monday)', () => {
    expect(toIsoWeek(new Date('2020-01-06T00:00:00Z'))).toBe('2020-W02');
  });

  it('last days of December belong to week 1 of next year — Dec 30, 2019 (Monday)', () => {
    // ISO: Dec 30, 2019 is Monday — its Thursday is Jan 2, 2020 → 2020-W01
    expect(toIsoWeek(new Date('2019-12-30T00:00:00Z'))).toBe('2020-W01');
  });

  it('Dec 28, 2020 (Monday) — week 53 of 2020', () => {
    expect(toIsoWeek(new Date('2020-12-28T00:00:00Z'))).toBe('2020-W53');
  });

  it('Jan 4, 2021 (Monday) — week 1 of 2021', () => {
    expect(toIsoWeek(new Date('2021-01-04T00:00:00Z'))).toBe('2021-W01');
  });

  it('Jan 1, 2021 (Friday) — week 53 of 2020', () => {
    // ISO: Jan 1, 2021 is Friday — its Thursday is Dec 31, 2020 → 2020-W53
    expect(toIsoWeek(new Date('2021-01-01T00:00:00Z'))).toBe('2020-W53');
  });

  it('regular mid-year week — Jun 15, 2023 (Thursday)', () => {
    expect(toIsoWeek(new Date('2023-06-15T00:00:00Z'))).toBe('2023-W24');
  });

  it('week number is zero-padded', () => {
    const result = toIsoWeek(new Date('2024-01-08T00:00:00Z'));
    expect(result).toMatch(/^\d{4}-W\d{2}$/);
  });
});

describe('toYYYYMM', () => {
  it('January 2024', () => {
    expect(toYYYYMM(new Date('2024-01-15T00:00:00Z'))).toBe('2024-01');
  });

  it('December 2023', () => {
    expect(toYYYYMM(new Date('2023-12-31T00:00:00Z'))).toBe('2023-12');
  });

  it('single-digit month is zero-padded', () => {
    expect(toYYYYMM(new Date('2024-03-01T00:00:00Z'))).toBe('2024-03');
  });

  it('October', () => {
    expect(toYYYYMM(new Date('2022-10-05T00:00:00Z'))).toBe('2022-10');
  });
});
