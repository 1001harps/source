// TODO: figure out issue with typeorm and strict mode
// @ts-nocheck

import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class File extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  tenantId: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  modified: Date;

  @Column("boolean", { default: false })
  active: boolean;

  @Column("boolean", { default: false })
  deleted: boolean;

  path = () => `${this.tenantId}/${this.id}.mp3`;
}
