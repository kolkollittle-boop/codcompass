#!/usr/bin/env python3
"""
CPKB Content Crawler - P0 Data Sources
Collects from: Hacker News, GitHub Trending, Dev.to, Reddit
Outputs raw JSON to data/raw/ for AI processing pipeline.
"""

import json
import os
import time
import urllib.request
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'raw')
os.makedirs(DATA_DIR, exist_ok=True)

HEADERS = {
    'User-Agent': 'CyberPunkKB/1.0 (educational content crawler)',
}


def fetch_json(url, retries=3):
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=15) as resp:
                return json.loads(resp.read().decode())
        except Exception as e:
            if i < retries - 1:
                time.sleep(2)
            else:
                print(f"  ❌ Failed: {url} - {e}")
                return None


def save_items(source, items):
    if not items:
        return
    ts = datetime.now().strftime('%Y%m%d_%H%M%S')
    path = os.path.join(DATA_DIR, f"{source}_{ts}.json")
    with open(path, 'w') as f:
        json.dump({'source': source, 'fetched_at': ts, 'count': len(items), 'items': items}, f, indent=2)
    print(f"  ✅ Saved {len(items)} items → {path}")


def crawl_hacker_news():
    print("\n📰 Hacker News (Firebase API)...")
    top_ids = fetch_json('https://hacker-news.firebaseio.com/v0/topstories.json')
    if not top_ids:
        return

    stories = []
    for story_id in top_ids[:30]:
        story = fetch_json(f'https://hacker-news.firebaseio.com/v0/item/{story_id}.json')
        if story and story.get('url') and story.get('title'):
            stories.append({
                'id': story['id'],
                'title': story['title'],
                'url': story['url'],
                'score': story.get('score', 0),
                'by': story.get('by', ''),
                'descendants': story.get('descendants', 0),
                'time': story.get('time', 0),
                'type': 'hackernews',
            })

    save_items('hackernews', stories)


def crawl_github_trending():
    print("\n🐙 GitHub Trending (HTML)...")
    # For now, use the raw HTML since there's no official API
    # In production, use a proper HTML parser
    try:
        req = urllib.request.Request('https://github.com/trending/typescript', headers=HEADERS)
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode()
            # Simple extraction - in production use BeautifulSoup/cheerio
            ts = datetime.now().strftime('%Y%m%d_%H%M%S')
            path = os.path.join(DATA_DIR, f"github_ts_{ts}.html")
            with open(path, 'w') as f:
                f.write(html)
            print(f"  ✅ Saved GitHub TS trending HTML → {path}")
    except Exception as e:
        print(f"  ❌ GitHub Trending failed: {e}")


def crawl_devto():
    print("\n📝 Dev.to (Official API)...")
    tags = ['typescript', 'python', 'ai', 'webdev', 'rust']
    all_articles = []

    for tag in tags:
        url = f'https://dev.to/api/articles?tag={tag}&per_page=5&sort_by=public_reactions_count'
        articles = fetch_json(url)
        if articles:
            for a in articles:
                all_articles.append({
                    'id': a.get('id'),
                    'title': a.get('title', ''),
                    'url': a.get('url', ''),
                    'description': a.get('description', ''),
                    'tags': a.get('tag_list', []),
                    'reactions': a.get('public_reactions_count', 0),
                    'comments': a.get('comments_count', 0),
                    'author': a.get('user', {}).get('name', ''),
                    'published_at': a.get('published_at', ''),
                    'type': 'devto',
                })
        time.sleep(1)  # Rate limit

    save_items('devto', all_articles)


def crawl_reddit():
    print("\n🔴 Reddit r/programming (JSON API)...")
    url = 'https://www.reddit.com/r/programming/hot.json?limit=25'
    data = fetch_json(url)
    if not data:
        return

    posts = []
    for child in data.get('data', {}).get('children', []):
        d = child.get('data', {})
        if d.get('url'):
            posts.append({
                'id': d.get('id'),
                'title': d.get('title', ''),
                'url': d.get('url', ''),
                'subreddit': d.get('subreddit', ''),
                'score': d.get('score', 0),
                'author': d.get('author', ''),
                'created_utc': d.get('created_utc', 0),
                'num_comments': d.get('num_comments', 0),
                'selftext': d.get('selftext', '')[:500],
                'type': 'reddit',
            })

    save_items('reddit', posts)


def main():
    print("=" * 60)
    print("  CPKB Content Crawler - P0 Data Sources")
    print(f"  Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    crawl_hacker_news()
    crawl_github_trending()
    crawl_devto()
    crawl_reddit()

    # Summary
    files = [f for f in os.listdir(DATA_DIR) if f.endswith(('.json', '.html'))]
    print(f"\n{'=' * 60}")
    print(f"  Done! {len(files)} files in data/raw/")
    print(f"{'=' * 60}")


if __name__ == '__main__':
    main()
