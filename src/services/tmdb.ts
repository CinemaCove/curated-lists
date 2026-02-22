import { TmdbClient, MediaType, AccountCustomListResultItem } from '@cinemacove/tmdb-client/v4';
import { TmdbClient as TmdbClientV3, MediaType as MediaTypeV3 } from '@cinemacove/tmdb-client/v3';

import { MediaItem, TmdbListSummary } from '../types';

// ── Auth ────────────────────────────────────────────────────────────────────

export async function createRequestToken(appToken: string): Promise<string> {
    const client = new TmdbClient(appToken);
    const result = await client.authentication.createRequestToken({ redirectTo: '' });
    return result.requestToken;
}

/**
 * The client's createAccessToken sends { access_token } in the body but TMDB
 * expects { request_token }, so we use raw fetch here as a workaround.
 */
export async function createAccessToken(
    appToken: string,
    requestToken: string
): Promise<{ accountId: string; accessToken: string }> {
    const res = await fetch('https://api.themoviedb.org/4/auth/access_token', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${appToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ request_token: requestToken }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`TMDB auth error ${res.status}: ${text}`);
    }

    const data = (await res.json()) as { account_id: string; access_token: string };
    return { accountId: data.account_id, accessToken: data.access_token };
}

// ── Lists ───────────────────────────────────────────────────────────────────

export async function createList(
    userToken: string,
    name: string,
    description: string
): Promise<number> {
    const client = new TmdbClient(userToken);
    const result = await client.list.create({
        name,
        description,
        iso639_1: 'en',
        iso3166_1: 'US',
        public: true,
    });
    return result.id;
}

export async function addItemsToList(
    userToken: string,
    listId: number,
    items: MediaItem[]
): Promise<void> {
    const client = new TmdbClient(userToken);
    await client.list.addItems(listId, {
        items: items.map(item => ({
            mediaType: item.mediaType === 'tv' ? MediaType.TvShow : MediaType.Movie,
            mediaId: item.tmdbId,
        })),
    });
}

export async function getAllLists(
    userToken: string,
    accountId: string
): Promise<TmdbListSummary[]> {
    const client = new TmdbClient(userToken);
    const all: TmdbListSummary[] = [];
    let page = 1;
    let totalPages = 1;

    do {
        // The client types accountObjectId as number | null, but the v4 API accepts
        // the string account_object_id returned by the auth flow — cast accordingly.
        const data = await client.account.getCustomLists(accountId as unknown as number, { page });

        all.push(
            ...data.results.map((r: AccountCustomListResultItem) => ({
                id: r.id,
                name: r.name,
                description: r.description,
                item_count: r.numberOfItems,
                poster_path: null,
            }))
        );

        totalPages = data.totalPages;
        page++;
    } while (page <= totalPages);

    return all;
}

export async function deleteList(userToken: string, listId: number): Promise<void> {
    const client = new TmdbClient(userToken);
    await client.list.delete(listId);
}

// ── Search ──────────────────────────────────────────────────────────────────

export interface SearchResult {
    tmdbId: number;
    name: string;
    mediaType: 'movie' | 'tv';
    releaseDate: string;
    voteAverage: number;
    backdropPath: string;
    overview: string;
}

export async function searchMedia(userToken: string, query: string): Promise<SearchResult[]> {
    const client = new TmdbClientV3({
        accessToken: userToken,
    });
    const data = await client.search.multi({ query });

    return data.results
        .filter(r => r.mediaType === MediaTypeV3.Movie || r.mediaType === MediaTypeV3.TvShow)
        .map(r => {
            // The type only covers movie fields; TV results carry `name` and
            // `firstAirDate` at runtime even though they're not in the type.
            const raw = r as typeof r & { name?: string; firstAirDate?: string };
            return {
                tmdbId: r.id,
                name: r.title || raw.name || '',
                mediaType: (r.mediaType === MediaTypeV3.TvShow ? 'tv' : 'movie') as 'movie' | 'tv',
                releaseDate: r.releaseDate || raw.firstAirDate || '',
                voteAverage: r.voteAverage,
                backdropPath: r.backdropPath || '',
                overview: r.overview || '',
            };
        });
}
