/**
 * Language Detector Utility
 * 
 * Maps file extensions to programming languages for granular analytics.
 * Used during sync to categorize files changed in each commit.
 */

// Comprehensive extension to language mapping
const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  // JavaScript/TypeScript ecosystem
  'js': 'JavaScript',
  'jsx': 'JavaScript',
  'mjs': 'JavaScript',
  'cjs': 'JavaScript',
  'ts': 'TypeScript',
  'tsx': 'TypeScript',
  'mts': 'TypeScript',
  'cts': 'TypeScript',
  
  // Web technologies
  'html': 'HTML',
  'htm': 'HTML',
  'css': 'CSS',
  'scss': 'SCSS',
  'sass': 'SASS',
  'less': 'Less',
  'vue': 'Vue',
  'svelte': 'Svelte',
  
  // Python
  'py': 'Python',
  'pyw': 'Python',
  'pyx': 'Python',
  'pxd': 'Python',
  'pyi': 'Python',
  
  // Java/JVM
  'java': 'Java',
  'kt': 'Kotlin',
  'kts': 'Kotlin',
  'scala': 'Scala',
  'groovy': 'Groovy',
  'clj': 'Clojure',
  
  // C family
  'c': 'C',
  'h': 'C',
  'cpp': 'C++',
  'cc': 'C++',
  'cxx': 'C++',
  'hpp': 'C++',
  'hxx': 'C++',
  'cs': 'C#',
  
  // Systems programming
  'rs': 'Rust',
  'go': 'Go',
  'swift': 'Swift',
  'zig': 'Zig',
  
  // Scripting
  'rb': 'Ruby',
  'php': 'PHP',
  'pl': 'Perl',
  'pm': 'Perl',
  'lua': 'Lua',
  'sh': 'Shell',
  'bash': 'Shell',
  'zsh': 'Shell',
  'fish': 'Shell',
  'ps1': 'PowerShell',
  'psm1': 'PowerShell',
  
  // Data/Config
  'json': 'JSON',
  'yaml': 'YAML',
  'yml': 'YAML',
  'toml': 'TOML',
  'xml': 'XML',
  'csv': 'CSV',
  
  // Database
  'sql': 'SQL',
  'prisma': 'Prisma',
  
  // Mobile
  'm': 'Objective-C',
  'mm': 'Objective-C++',
  'dart': 'Dart',
  
  // Functional
  'hs': 'Haskell',
  'ml': 'OCaml',
  'fs': 'F#',
  'fsx': 'F#',
  'ex': 'Elixir',
  'exs': 'Elixir',
  'erl': 'Erlang',
  
  // Documentation
  'md': 'Markdown',
  'mdx': 'MDX',
  'rst': 'reStructuredText',
  'txt': 'Text',
  
  // DevOps/Infrastructure
  'dockerfile': 'Dockerfile',
  'tf': 'Terraform',
  'hcl': 'HCL',
  
  // Other
  'r': 'R',
  'jl': 'Julia',
  'v': 'V',
  'nim': 'Nim',
  'cr': 'Crystal',
  'wasm': 'WebAssembly',
  'sol': 'Solidity',
};

// Files that should be flagged as potential outliers
const OUTLIER_FILE_PATTERNS = [
  /package-lock\.json$/i,
  /yarn\.lock$/i,
  /pnpm-lock\.yaml$/i,
  /Gemfile\.lock$/i,
  /poetry\.lock$/i,
  /Cargo\.lock$/i,
  /composer\.lock$/i,
  /Pipfile\.lock$/i,
  /\.min\.(js|css)$/i,
  /\.bundle\.(js|css)$/i,
  /node_modules/i,
  /vendor\//i,
  /dist\//i,
  /build\//i,
  /\.generated\./i,
];

// Thresholds for outlier detection
export const OUTLIER_THRESHOLDS = {
  singleFileLinesChanged: 1000,  // >1000 lines in single file = outlier
  totalLinesChanged: 5000,       // >5000 total lines = outlier
  lockfileChange: true,          // Any lockfile = potential outlier
} as const;

export interface LanguageDetectionResult {
  language: string | null;
  extension: string;
  isUnknown: boolean;
}

export interface CommitFileAnalysis {
  fileExtensions: Record<string, number>;  // { "ts": 12, "json": 2 }
  languages: Record<string, number>;       // { "TypeScript": 12, "JSON": 2 }
  isOutlier: boolean;
  outlierReason?: string;
  totalFiles: number;
  unknownExtensions: string[];
}

/**
 * Detect programming language from filename
 */
export function detectLanguage(filename: string): LanguageDetectionResult {
  // Handle files without extensions (like Dockerfile, Makefile)
  const basename = filename.split('/').pop() || filename;
  
  // Special cases for files without traditional extensions
  const specialFiles: Record<string, string> = {
    'Dockerfile': 'Dockerfile',
    'Makefile': 'Makefile',
    'Jenkinsfile': 'Groovy',
    'Vagrantfile': 'Ruby',
    '.gitignore': 'Git',
    '.dockerignore': 'Docker',
    '.env': 'Environment',
    '.editorconfig': 'EditorConfig',
  };

  if (specialFiles[basename]) {
    return {
      language: specialFiles[basename],
      extension: basename.toLowerCase(),
      isUnknown: false,
    };
  }

  // Extract extension
  const lastDotIndex = basename.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === 0) {
    return {
      language: null,
      extension: '',
      isUnknown: true,
    };
  }

  const extension = basename.slice(lastDotIndex + 1).toLowerCase();
  const language = EXTENSION_TO_LANGUAGE[extension] || null;

  return {
    language,
    extension,
    isUnknown: language === null,
  };
}

/**
 * Check if a file is a potential outlier (lockfiles, generated files, etc.)
 */
export function isOutlierFile(filename: string): { isOutlier: boolean; reason?: string } {
  for (const pattern of OUTLIER_FILE_PATTERNS) {
    if (pattern.test(filename)) {
      return {
        isOutlier: true,
        reason: `Matches pattern: ${pattern.source}`,
      };
    }
  }
  return { isOutlier: false };
}

/**
 * Analyze files changed in a commit
 * @param files - Array of file information from GitHub API
 * @param additions - Total additions in commit
 * @param deletions - Total deletions in commit
 */
export function analyzeCommitFiles(
  files: Array<{ filename: string; additions?: number; deletions?: number }>,
  totalAdditions: number,
  totalDeletions: number
): CommitFileAnalysis {
  const fileExtensions: Record<string, number> = {};
  const languages: Record<string, number> = {};
  const unknownExtensions: string[] = [];
  let hasOutlierFile = false;
  let outlierReason: string | undefined;

  for (const file of files) {
    // Check for outlier files
    const outlierCheck = isOutlierFile(file.filename);
    if (outlierCheck.isOutlier && !hasOutlierFile) {
      hasOutlierFile = true;
      outlierReason = `Contains outlier file: ${file.filename}`;
    }

    // Check for large single-file changes
    const fileChanges = (file.additions || 0) + (file.deletions || 0);
    if (fileChanges > OUTLIER_THRESHOLDS.singleFileLinesChanged && !hasOutlierFile) {
      hasOutlierFile = true;
      outlierReason = `Single file changed ${fileChanges} lines (threshold: ${OUTLIER_THRESHOLDS.singleFileLinesChanged})`;
    }

    // Detect language
    const detection = detectLanguage(file.filename);
    
    if (detection.extension) {
      fileExtensions[detection.extension] = (fileExtensions[detection.extension] || 0) + 1;
    }
    
    if (detection.language) {
      languages[detection.language] = (languages[detection.language] || 0) + 1;
    } else if (detection.isUnknown && detection.extension) {
      unknownExtensions.push(detection.extension);
    }
  }

  // Check for total lines changed outlier
  const totalChanges = totalAdditions + totalDeletions;
  if (totalChanges > OUTLIER_THRESHOLDS.totalLinesChanged && !hasOutlierFile) {
    hasOutlierFile = true;
    outlierReason = `Total changes ${totalChanges} lines exceeds threshold ${OUTLIER_THRESHOLDS.totalLinesChanged}`;
  }

  return {
    fileExtensions,
    languages,
    isOutlier: hasOutlierFile,
    outlierReason,
    totalFiles: files.length,
    unknownExtensions: [...new Set(unknownExtensions)],
  };
}

/**
 * Calculate percentage of unknown file types
 * Used for data quality indicators in UI
 */
export function calculateUnknownPercentage(
  fileExtensions: Record<string, number>,
  unknownExtensions: string[]
): number {
  const totalFiles = Object.values(fileExtensions).reduce((sum, count) => sum + count, 0);
  const unknownFiles = unknownExtensions.length;
  
  if (totalFiles === 0) return 0;
  
  return Math.round((unknownFiles / totalFiles) * 100);
}
