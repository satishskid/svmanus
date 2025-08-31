import Dexie, { Table } from 'dexie';
import { ChildRecord } from './models/Child';
import { MeasurementRecord } from './models/Measurement';

export class ChildGrowthDatabase extends Dexie {
  children!: Table<ChildRecord, number>; // number is the type of the primary key
  measurements!: Table<MeasurementRecord, number>;

  constructor() {
    super('ChildGrowthDatabase');
    this.version(1).stores({
      // The '++id' for the primary key is implied by Dexie when using auto-increment.
      // The subsequent strings are the indexes we want to create.
      children: '++localId, id, name', // Using localId as the auto-incrementing key
      measurements: '++id, childId, measurementDate'
    });
  }
}

export const db = new ChildGrowthDatabase();
