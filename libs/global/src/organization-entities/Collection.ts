import { StringOfLength, Tagged, UUIDv4 } from '../types';
import { GameGroupId } from './GameGroup';
import { ProfileGroupId } from './ProfileGroup';

type CollectionId = Tagged<'CollectionId', UUIDv4>;

export class Collection {
  id: CollectionId;
  parent?: CollectionId;
  children: CollectionId[];

  name: StringOfLength<1, 100>;
  description: StringOfLength<1, 5000>;

  admin_group: ProfileGroupId;
  game_groups: GameGroupId[];
}
