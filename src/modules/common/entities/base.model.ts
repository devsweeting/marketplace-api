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
  public id: string;

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
}