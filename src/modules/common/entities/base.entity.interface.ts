export interface IBaseEntity {
  id: string; // uuid
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  isDeleted: boolean | false;
}
