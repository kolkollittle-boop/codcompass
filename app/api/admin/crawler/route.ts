import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // 通过 GitHub Actions API 触发爬虫
    // 需要设置 GITHUB_TOKEN 环境变量
    
    const githubToken = process.env.GITHUB_TOKEN;
    const repoOwner = process.env.GITHUB_REPO_OWNER;
    const repoName = process.env.GITHUB_REPO_NAME;
    
    if (!githubToken || !repoOwner || !repoName) {
      return NextResponse.json(
        { error: 'Missing GitHub configuration. Set GITHUB_TOKEN, GITHUB_REPO_OWNER, and GITHUB_REPO_NAME environment variables.' },
        { status: 500 }
      );
    }
    
    // 触发 GitHub Actions workflow
    const response = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/actions/workflows/crawler.yml/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ref: 'main' }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to trigger crawler: ${response.status} ${errorText}` },
        { status: response.status }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Crawler triggered successfully. Check GitHub Actions for progress.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to trigger the crawler.',
    schedule: 'Crawler runs every hour via GitHub Actions cron schedule.',
  });
}
