import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class GameDBModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid')
  public_id: string;

  @Column({ length: 500 })
  title: string;

  @Column('text')
  description?: string;

  @Column('text')
  image?: string;

}