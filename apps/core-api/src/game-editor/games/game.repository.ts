import { from, Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import * as e from 'fp-ts/lib/Either';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import {
  CreateGameDto,
  FullGame,
  GameParser,
  ParsingError,
  UnexpectedError,
} from '@end/global';

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
export class GameRepository {
  constructor(
    @InjectRepository(GameDBModel) private repo: Repository<GameDBModel>,
  ) {}

  createNew(
    dto: CreateGameDto,
  ): Observable<e.Either<UnexpectedError | ParsingError, FullGame>> {
    return from(this.repo.save(dto)).pipe(
      switchMap((res) => {
        return GameParser.toFullEntity({
          ...res,
          id: res.public_id,
        });
      }),
      catchError((err) =>
        of(e.left(new UnexpectedError('DB save failed', err))),
      ),
    );
  }
}