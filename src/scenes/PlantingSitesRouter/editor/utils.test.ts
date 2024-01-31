import { alphabetName, subzoneNameGenerator } from './utils';

describe('subzoneNameGenerator', () => {
  test("should return 'A' when there are no used names", () => {
    const usedNames = new Set<string>();
    expect(subzoneNameGenerator(usedNames)).toBe('A');
  });

  test('should return the next unused name', () => {
    const usedNames = new Set<string>(['A', 'B', 'C', 'D']);
    expect(subzoneNameGenerator(usedNames)).toBe('E');
  });

  test('should return the next incremented characters sequence in the name', () => {
    const asciiA = 'A'.charCodeAt(0);
    // A to Z, simpler to map from ascii to char here
    const usedNames = new Set<string>(
      Array.from({ length: 26 }, (_, index) => asciiA + index).map((ascii) => String.fromCharCode(ascii))
    );
    expect(subzoneNameGenerator(usedNames)).toBe('AA');
  });

  test('should be able to handle names with many character positions', () => {
    const asciiA = 'A'.charCodeAt(0);
    const usedNames = new Set<string>();
    // 5000 is 'GJH'
    for (let i = 1; i <= 5000; i++) {
      usedNames.add(alphabetName(i));
    }
    expect(subzoneNameGenerator(usedNames)).toBe('GJI');
  });
});
