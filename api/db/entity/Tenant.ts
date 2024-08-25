// TODO: figure out issue with typeorm and strict mode
// @ts-nocheck

import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class Tenant extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  @Generated("uuid")
  apiKey: string;

  @Column("varchar", {
    length: 128,
    unique: true,
  })
  name: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  modified: Date;

  @Column("boolean", { default: true })
  active: boolean;
}
