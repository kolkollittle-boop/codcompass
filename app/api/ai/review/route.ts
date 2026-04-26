import { NextRequest, NextResponse } from 'next/server';

// Simple code review (MVP - will be replaced with AI API)
const RULES: Record<string, Array<{ pattern: RegExp; message: string; severity?: string; suggestion?: string }>> = {
  typescript: [
    { pattern: /:\s*any\b/g, message: 'Avoid using "any" type', suggestion: 'Use "unknown" or specific types instead' },
    { pattern: /console\.(log|debug|info)/g, message: 'Remove console.log in production', suggestion: 'Use a proper logging library' },
    { pattern: /\/\/\s*TODO/g, message: 'TODO comment found', suggestion: 'Create a ticket for this task' },
    { pattern: /==\s*(null|undefined)/g, message: 'Use === instead of ==', suggestion: 'Always use strict equality' },
    { pattern: /var\s+/g, message: 'Avoid "var", use "let" or "const"', suggestion: 'Use const for immutable values, let for mutable' },
  ],
  javascript: [
    { pattern: /console\.(log|debug|info)/g, message: 'Remove console.log in production', suggestion: 'Use a proper logging library' },
    { pattern: /==\s*(null|undefined)/g, message: 'Use === instead of ==', suggestion: 'Always use strict equality' },
    { pattern: /var\s+/g, message: 'Avoid "var", use "let" or "const"', suggestion: 'Use const for immutable values, let for mutable' },
  ],
  python: [
    { pattern: /print\s*\(/g, message: 'Remove print statements in production', suggestion: 'Use logging module instead' },
    { pattern: /except\s*:/g, message: 'Bare except clause', suggestion: 'Specify the exception type: except Exception:' },
    { pattern: /from\s+\w+\s+import\s+\*/g, message: 'Avoid wildcard imports', suggestion: 'Import specific functions/classes' },
  ],
  go: [
    { pattern: /fmt\.Print/g, message: 'Remove print statements in production', suggestion: 'Use log package instead' },
    { pattern: /panic\(/g, message: 'Avoid panic in production', suggestion: 'Return error instead' },
  ],
  rust: [
    { pattern: /\.unwrap\(\)/g, message: 'Avoid unwrap() in production', suggestion: 'Use expect() or proper error handling' },
    { pattern: /println!/g, message: 'Remove println! in production', suggestion: 'Use log crate instead' },
  ],
};

export async function POST(req: NextRequest) {
  try {
    const { code, language } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const lang = language || 'typescript';
    const rules = RULES[lang] || [];
    
    const issues: Array<{ line: number; severity: string; message: string; suggestion?: string }> = [];
    const lines = code.split('\n');
    
    for (const rule of rules) {
      lines.forEach((line: string, index: number) => {
        if (rule.pattern.test(line)) {
          issues.push({
            line: index + 1,
            severity: rule.severity || 'warning',
            message: rule.message,
            suggestion: rule.suggestion,
          });
        }
      });
    }

    // Calculate score
    const score = Math.max(0, 100 - issues.length * 10);
    
    const summary = issues.length === 0
      ? 'Great code! No issues found.'
      : `Found ${issues.length} issue${issues.length > 1 ? 's' : ''}. Review the suggestions below.`;

    return NextResponse.json({
      score,
      issues,
      summary,
    });
  } catch (error: any) {
    console.error('[Code Review] Error:', error);
    return NextResponse.json(
      { error: 'Failed to review code' },
      { status: 500 }
    );
  }
}
