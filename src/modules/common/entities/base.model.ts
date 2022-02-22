import {
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  BaseEntity,
} from 'typeorm';
import { IsUUID } from 'class-validator';

export abstract class BaseModel extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: number;

  @UpdateDateColumn()
  public updatedAt: Date;

  @CreateDateColumn()
  public createdAt: Date;

  @BeforeInsert()
  public beforeInsert(): void {
    // pass
  }

  @BeforeUpdate()
  public beforeUpdate(): void {
    // pass
  }

  /**
   * Method to generate slug value from a given text
   * @param text: string
   * @return text: string
   */
  public generateSlug(text: string): string {
    return text
      ? text
          .toString()
          .toLowerCase()
          .normalize('NFD')
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '')
          .replace(/\-\-+/g, '-')
      : '';
  }
}
