import type { Pool, Token } from "@theminingco/core";
import { initializeApp } from "firebase-admin/app";
import type { FirestoreDataConverter, DocumentData, QueryDocumentSnapshot, WriteBatch, DocumentReference, UpdateData, WithFieldValue } from "firebase-admin/firestore";
import { getFirestore } from "firebase-admin/firestore";

const app = initializeApp();

const firestore = getFirestore(app);

const converter = <T extends DocumentData>(): FirestoreDataConverter<T> => ({
  toFirestore: (model: T): DocumentData => model,
  fromFirestore: (snapshot: QueryDocumentSnapshot): T => snapshot.data() as T
});

export const tokenCollection = firestore
  .collection("tokens")
  .withConverter(converter<Token>());

export const poolCollection = firestore
  .collection("pools")
  .withConverter(converter<Pool>());

export class BatchWriter {
  private batch: WriteBatch = firestore.batch();
  private counter = 0;

  private async increment(): Promise<void> {
    this.counter += 1;
    if (this.counter === 500) {
      this.counter = 0;
      await this.batch.commit();
      this.batch = firestore.batch();
    }
  }

  public async update<T extends DocumentData>(ref: DocumentReference<T>, data: UpdateData<T>): Promise<void> {
    this.batch.update(ref, data);
    await this.increment();
  }

  public async create<T extends DocumentData>(ref: DocumentReference<T>, data: WithFieldValue<T>): Promise<void> {
    this.batch.create(ref, data);
    await this.increment();
  }

  public async delete <T extends DocumentData>(ref: DocumentReference<T>): Promise<void> {
    this.batch.delete(ref);
    await this.increment();
  }

  public async finalize(): Promise<void> {
    await this.batch?.commit();
  }
}
