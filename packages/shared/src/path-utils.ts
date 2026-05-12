declare const process: { platform?: string } | undefined;

function detectPlatform(): string {
  if (typeof globalThis !== 'undefined') {
    const g = globalThis as { process?: { platform?: string }; navigator?: { platform?: string } };
    if (g.process?.platform) {
      return g.process.platform;
    }
    if (g.navigator?.platform) {
      return g.navigator.platform;
    }
  }
  return 'unknown';
}

function isWindowsPlatform(platform: string): boolean {
  return platform.toLowerCase().includes('win');
}

export function normalizePathSeparators(path: string): string {
  return path.replaceAll('\\', '/');
}

export function pathsEqual(path1: string, path2: string, platform?: string): boolean {
  const detectedPlatform = platform ?? detectPlatform();
  const normalized1 = normalizePathSeparators(path1);
  const normalized2 = normalizePathSeparators(path2);
  if (isWindowsPlatform(detectedPlatform)) {
    return normalized1.toLowerCase() === normalized2.toLowerCase();
  }
  return normalized1 === normalized2;
}
