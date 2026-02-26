import { MongoClient } from 'mongodb';

import { CuratedGroup, CuratedListRecord } from '../types';

export async function getNextOrder(
    uri: string,
    dbName: string,
    collectionName: string,
): Promise<number> {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const col = client.db(dbName).collection(collectionName);
        const top = await col.findOne<{ order: number }>(
            {},
            { sort: { order: -1 }, projection: { order: 1 } },
        );
        return top ? top.order + 1 : 0;
    } finally {
        await client.close();
    }
}

export async function findGroupByName(
    uri: string,
    dbName: string,
    collectionName: string,
    name: string,
): Promise<boolean> {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const col = client.db(dbName).collection(collectionName);
        const existing = await col.findOne({ name });
        return existing !== null;
    } finally {
        await client.close();
    }
}

export async function publishGroup(
    uri: string,
    dbName: string,
    collectionName: string,
    record: CuratedGroup,
): Promise<void> {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const col = client.db(dbName).collection(collectionName);
        await col.updateOne({ name: record.name }, { $set: record, $inc: { changeVersion: 1 } }, { upsert: true });
    } finally {
        await client.close();
    }
}

export async function publishCuratedList(
    uri: string,
    dbName: string,
    collectionName: string,
    record: CuratedListRecord
): Promise<void> {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const col = client.db(dbName).collection(collectionName);
        await col.updateOne({ tmdbListId: record.tmdbListId }, { $set: record, $inc: { changeVersion: 1 } }, { upsert: true });
    } finally {
        await client.close();
    }
}
