// TODO: figure out issue with typeorm and strict mode
// @ts-nocheck

import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Tenant } from "./Tenant";

@Entity()
export class File extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.files)
  tenant: Tenant;

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
