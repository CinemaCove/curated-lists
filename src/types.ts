export interface MediaItem {
    name: string;
    tmdbId: number;
    mediaType?: 'movie' | 'tv';
}

export interface TmdbListSummary {
    id: number;
    name: string;
    description: string | null;
    item_count: number;
    poster_path: string | null;
}

export interface CuratedListRecord {
    tmdbListId: number;
    name: string;
    description: string;
    icon: string;
    order: number;
    imagePath: string;
}
