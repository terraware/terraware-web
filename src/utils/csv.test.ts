import { escapeCsvFormula } from './csv';

describe('escapeCsvFormula', () => {
  it.each(['=1+1', '+1', '-1', '@SUM(A1)', '\tx', '\rx'])('quotes %j so a spreadsheet reads it as text', (value) => {
    expect(escapeCsvFormula(value)).toBe(`'${value}`);
  });

  it('leaves ordinary text alone', () => {
    expect(escapeCsvFormula('Shipped in two boxes')).toBe('Shipped in two boxes');
    expect(escapeCsvFormula('23-1-1-003')).toBe('23-1-1-003');
  });

  it('passes non-strings through untouched', () => {
    expect(escapeCsvFormula(500)).toBe(500);
    expect(escapeCsvFormula(undefined)).toBeUndefined();
    expect(escapeCsvFormula(null)).toBeNull();
  });
});
