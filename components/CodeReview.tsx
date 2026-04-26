'use client';

import { useState } from 'react';

interface ReviewResult {
  score: number;
  issues: Array<{
    line: number;
    severity: 'error' | 'warning' | 'info';
    message: string;
    suggestion?: string;
  }>;
  summary: string;
}

export default function CodeReview() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [isReviewing, setIsReviewing] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);

  const handleReview = async () => {
    if (!code.trim()) return;
    
    setIsReviewing(true);
    try {
      const response = await fetch('/api/ai/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });

      if (!response.ok) throw new Error('Review failed');

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Review error:', error);
    }
    setIsReviewing(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">Code Review</h3>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500"
          >
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
          </select>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full p-4 font-mono text-sm min-h-[200px] resize-y focus:outline-none"
          placeholder="Paste your code here..."
        />
        <div className="flex justify-end px-4 py-2 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleReview}
            disabled={isReviewing || !code.trim()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {isReviewing ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reviewing...
              </span>
            ) : (
              'Review Code'
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Review Results</h3>
              <span className={`text-lg font-bold ${getScoreColor(result.score)}`}>
                {result.score}/100
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{result.summary}</p>
          </div>
          
          {result.issues.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {result.issues.map((issue, i) => (
                <div key={i} className="px-4 py-3">
                  <div className="flex items-start gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                      {issue.severity.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">Line {issue.line}</span>
                  </div>
                  <p className="text-sm text-gray-900 mt-1">{issue.message}</p>
                  {issue.suggestion && (
                    <p className="text-sm text-gray-600 mt-1">
                      💡 {issue.suggestion}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-sm text-gray-500">No issues found!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
