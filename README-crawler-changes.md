# Codcompass Crawler Scoring and Featured Articles

## Changes Overview

### 1. Score Threshold Adjustment
- **Before**: Articles with AI score ≥ 80 were ingested
- **After**: Articles with AI score ≥ 60 are ingested
- **New Classification**:
  - 80+ = "featured" (highlighted articles)
  - 60-79 = "indexed" (regular articles)

### 2. Featured Article Support
- Added `is_featured` field to distinguish articles with score ≥ 80
- Updated Ingest API to support the `is_featured` field
- Added support in both Article and BlogPost models

### 3. Backfill Script
- Created `backfill-skipped.ts` script to reprocess articles that were previously skipped due to the higher threshold (80) but now qualify with the lower threshold (60)
- Re-processes articles with score ≥ 60 that were marked as "SKIPPED"

### 4. Configuration Updates
- Updated `CRAWLER_SCORE_THRESHOLD` from 80 to 60 in `.env.local`
- Updated `minAiScorePanel` from 70 to 60 in crawler UI config
- Updated default `SCORE_THRESHOLD` in run.ts from 70 to 60

## Usage

### Running the backfill script
```bash
npx tsx src/backfill-skipped.ts
```

### Running with new thresholds
```bash
# Will use threshold of 60 by default
npm run crawler:local
```

### Environment Variables
- `CRAWLER_SCORE_THRESHOLD`: Set to 60 (default)
- `INGEST_SECRET`: Required for API access

## Database Schema Changes

### Added Fields
- `isFeatured` (Boolean) to Article model
- `isFeatured` (Boolean) to BlogPost model

### Migration
A migration script is provided in `prisma/migrations/20260507_add_is_featured_field/migration.sql` to safely add the columns to existing databases.

## Scripts
- `automation/crawler/src/run.ts`: Main crawler with updated thresholds
- `automation/crawler/src/backfill-skipped.ts`: Script to reprocess skipped articles
- `lib/article-ingest-handler.ts`: Updated to support is_featured field