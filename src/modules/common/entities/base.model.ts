import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
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

  @Column({ nullable: true, type: 'timestamp' })
  public deletedAt: Date | null;

  @Column({ default: false })
  public isDeleted: boolean | false;

  @BeforeInsert()
  public beforeInsert(): void {
    // pass
  }

  @BeforeUpdate()
  public beforeUpdate(): void {
    // pass
  }
}
