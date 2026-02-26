# curated-lists

CLI tool for creating and managing [CinemaCove](https://cinemacove.com) curated lists. Pulls data from TMDB and publishes list metadata to MongoDB.

## Requirements

- Node.js 18+
- A [TMDB](https://www.themoviedb.org/) account with API v4 access
- A MongoDB instance

## Setup

```bash
npm install
npm run build
```

Copy `.env.example` to `.env` and fill in the values:

```env
TMDB_API_READ_ACCESS_TOKEN=   # TMDB app-level read access token (v4)
TMDB_USER_ACCESS_TOKEN=       # Set automatically by `login`
TMDB_ACCOUNT_ID=              # Set automatically by `login`
MONGODB_URI=
MONGODB_DB_NAME=cinemacove
MONGODB_COLLECTION=curatedLists
MONGODB_GROUPS_COLLECTION=curatedGroups
```

## CLI Commands

Run commands with:

```bash
node dist/cli.mjs <command>
# or after npm link:
curated-lists <command>
```

| Command | Description |
|---|---|
| `login` | TMDB v4 OAuth flow — saves `TMDB_USER_ACCESS_TOKEN` and `TMDB_ACCOUNT_ID` to `.env` |
| `lists` | Display all your TMDB lists in a table |
| `create-list <json-file>` | Create a new TMDB list and populate it from a JSON file |
| `add-to-list <id> <json-file>` | Append items from a JSON file to an existing TMDB list |
| `search <json-file>` | Interactively search TMDB and append picks to a JSON file |
| `delete-list <id>` | Delete a TMDB list by ID |
| `publish` | Select a TMDB list and publish/upsert it to MongoDB as a `CuratedList` |
| `publish-group` | Select multiple TMDB lists and publish them to MongoDB as a `CuratedGroup` |

## MongoDB Documents

### CuratedList

Published via `publish`. Upserted by `tmdbListId`.

```ts
{
  tmdbListId: number
  name: string
  description: string
  icon: string          // Material icon name, default: "movie_filter"
  order: number
  imagePath: string
  isUnified: boolean
}
```

### CuratedGroup

Published via `publish-group`. Upserted by `name`.

```ts
{
  name: string
  description?: string
  icon: string
  imagePath?: string
  order: number
  lists: {
    name: string
    tmdbListId: string
    unified: boolean
  }[]
}
```

## Entries Files

JSON files used to populate TMDB lists. Each file is an array of:

```ts
{
  name: string
  tmdbId: number
  mediaType: "movie" | "tv"
  backdropPath: string
}
```

Organised into three folders:

```
entries/
  franchises/      # 32 franchise lists (MCU, Star Wars, Batman, Dragon Ball…)
  curated-lists/   # 8 hand-curated thematic lists
  directors/       # 56 director filmographies
```

## Scripts

One-off utility scripts in `scripts/`:

| Script | Description |
|---|---|
| `batch-franchises.mjs` | Search TMDB for a hardcoded list of franchise titles and write entries JSON files |
| `batch-directors.mjs` | Pull full filmographies for a list of directors from TMDB person credits |
| `batch-create-lists.mjs` | Create TMDB lists in bulk from entries JSON files |
| `batch-lego.mjs` | One-off batch search for LEGO titles |

Run any script with:

```bash
node scripts/<script-name>.mjs
```

## Development

```bash
npm run build        # typecheck + build
npm run build:dev    # build without typecheck
npm test             # run tests
npm run lint         # lint
npm run lint:fix     # lint + autofix
```
