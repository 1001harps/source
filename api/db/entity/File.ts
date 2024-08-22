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

  path = () => `${this.tenantId}/${this.id}.mp3`;
}
