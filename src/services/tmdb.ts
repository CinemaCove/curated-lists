import { MediaItem, TmdbListSummary } from '../types';

const BASE_URL = 'https://api.themoviedb.org/4';

async function apiFetch<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(options.headers ?? {}),
        },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`TMDB API error ${res.status}: ${text}`);
    }

    return res.json() as Promise<T>;
}

// ── Auth ────────────────────────────────────────────────────────────────────

export interface TmdbRequestTokenResponse {
    request_token: string;
    success: boolean;
    status_message: string;
}

export interface TmdbAccessTokenResponse {
    account_id: string;
    access_token: string;
    success: boolean;
    status_message: string;
}

export async function createRequestToken(appToken: string): Promise<string> {
    const data = await apiFetch<TmdbRequestTokenResponse>('/auth/request_token', appToken, {
        method: 'POST',
        body: JSON.stringify({}),
    });
    return data.request_token;
}

export async function createAccessToken(
    appToken: string,
    requestToken: string,
): Promise<TmdbAccessTokenResponse> {
    return apiFetch<TmdbAccessTokenResponse>('/auth/access_token', appToken, {
        method: 'POST',
        body: JSON.stringify({ request_token: requestToken }),
    });
}

// ── Lists ───────────────────────────────────────────────────────────────────

export async function createList(
    userToken: string,
    name: string,
    description: string,
): Promise<number> {
    const data = await apiFetch<{ id: number; success: boolean }>('/list', userToken, {
        method: 'POST',
        body: JSON.stringify({ name, description, iso_639_1: 'en', public: true }),
    });
    return data.id;
}

export async function addItemsToList(
    userToken: string,
    listId: number,
    items: MediaItem[],
): Promise<void> {
    await apiFetch(`/list/${listId}/items`, userToken, {
        method: 'POST',
        body: JSON.stringify({
            items: items.map((item) => ({
                media_type: item.mediaType ?? 'movie',
                media_id: item.tmdbId,
            })),
        }),
    });
}

interface TmdbListsPage {
    results: TmdbListSummary[];
    page: number;
    total_pages: number;
    total_results: number;
}

export async function getAllLists(
    userToken: string,
    accountId: string,
): Promise<TmdbListSummary[]> {
    const all: TmdbListSummary[] = [];
    let page = 1;
    let totalPages = 1;

    do {
        const data = await apiFetch<TmdbListsPage>(
            `/account/${accountId}/lists?page=${page}`,
            userToken,
        );
        all.push(...data.results);
        totalPages = data.total_pages;
        page++;
    } while (page <= totalPages);

    return all;
}
