import { MongoClient } from 'mongodb';
import { CuratedListRecord } from '../types';

export async function publishCuratedList(
    uri: string,
    dbName: string,
    collectionName: string,
    record: CuratedListRecord,
): Promise<void> {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const col = client.db(dbName).collection(collectionName);
        await col.updateOne({ tmdbListId: record.tmdbListId }, { $set: record }, { upsert: true });
    } finally {
        await client.close();
    }
}
