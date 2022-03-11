export interface BaseEntityInterface {
  id: string; // uuid
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
