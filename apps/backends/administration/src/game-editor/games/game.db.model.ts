import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { classToPlain, plainToClass } from 'class-transformer';

import { FullGame, NewGame } from '@end/global';

@Entity()
export class GameDBModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column('uuid')
  public_id: string;

  @Column({ length: 500 })
  title: string;

  @Column('text')
  description?: string;

  @Column('text')
  image?: string;

}

const toDBModel = (game: FullGame | NewGame) => {
  const gosho = new GameDBModel();
}