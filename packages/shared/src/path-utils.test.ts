import { describe, expect, it } from 'vitest';
import { normalizePathSeparators, pathsEqual } from './path-utils';

function expectPathEqual(actual: string, expected: string): void {
  const normalizedActual = normalizePathSeparators(actual);
  const normalizedExpected = normalizePathSeparators(expected);
  expect(normalizedActual, `Expected paths to be equal after normalization`).toBe(
    normalizedExpected,
  );
}

describe('normalizePathSeparators', () => {
  it('converts Windows backslashes to forward slashes', () => {
    expect(normalizePathSeparators('C:\\Users\\test\\file.txt')).toBe('C:/Users/test/file.txt');
  });

  it('keeps Linux paths unchanged', () => {
    expect(normalizePathSeparators('/home/user/file.txt')).toBe('/home/user/file.txt');
    expect(normalizePathSeparators('/var/log/app.log')).toBe('/var/log/app.log');
  });

  it('handles mixed separators', () => {
    expect(normalizePathSeparators('C:\\Users/test\\Documents\\file.txt')).toBe(
      'C:/Users/test/Documents/file.txt',
    );
  });

  it('handles empty string', () => {
    expect(normalizePathSeparators('')).toBe('');
  });
});

describe('pathsEqual', () => {
  describe('Windows platform', () => {
    it('compares paths case-insensitively', () => {
      expect(pathsEqual('C:\\Users\\Test', 'c:\\users\\test', 'Win32')).toBe(true);
      expect(pathsEqual('C:/Users/TEST', 'c:/users/test', 'win32')).toBe(true);
    });

    it('compares paths with different separators', () => {
      expect(pathsEqual('C:\\Users\\test', 'C:/Users/test', 'Win32')).toBe(true);
    });

    it('returns false for different paths', () => {
      expect(pathsEqual('C:\\Users\\test', 'C:\\Users\\other', 'Win32')).toBe(false);
    });

    it('returns true for same paths', () => {
      expect(pathsEqual('C:\\Users\\test', 'C:\\Users\\test', 'Win32')).toBe(true);
    });
  });

  describe('Linux/macOS platform', () => {
    it('compares paths case-sensitively', () => {
      expect(pathsEqual('/Users/Test', '/Users/test', 'Linux')).toBe(false);
      expect(pathsEqual('/Users/Test', '/Users/Test', 'Linux')).toBe(true);
    });

    it('compares paths with different separators', () => {
      expect(pathsEqual('/home\\user/test', '/home/user/test', 'Linux')).toBe(true);
    });

    it('returns false for different paths', () => {
      expect(pathsEqual('/home/user/test', '/home/user/other', 'Linux')).toBe(false);
    });

    it('returns true for same paths', () => {
      expect(pathsEqual('/home/user/test', '/home/user/test', 'Darwin')).toBe(true);
    });
  });
});

describe('expectPathEqual', () => {
  it('does not throw for equal paths', () => {
    expect(() => expectPathEqual('C:\\Users\\test', 'C:/Users/test')).not.toThrow();
    expect(() => expectPathEqual('/home/user', '/home/user')).not.toThrow();
  });

  it('throws for unequal paths', () => {
    expect(() => expectPathEqual('C:\\Users\\test', 'C:\\Users\\other')).toThrow();
    expect(() => expectPathEqual('/home/user/test', '/home/user/other')).toThrow();
  });
});
