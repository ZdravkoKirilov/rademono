import { Either, left, right, isRight } from 'fp-ts/lib/Either';
import { isObject } from 'lodash/fp';

import { InvalidPayload, PayloadIsNotAnObject, UpdateGameDtoParsingError } from '@end/global';

type UpdateGameDto = {
  id: string;
  title: string;
  description: string;
  image: string;
};

export const parseUpdateGameDto = (input: unknown): Either<UpdateGameDtoParsingError, UpdateGameDto> => {

  if (!isObject(input)) {
    return left({__tag: InvalidPayload, message: PayloadIsNotAnObject});
  }
  
  const id = parseId(input);
  const title = parseTitle(input);
  const description = parseDescription(input);
  const image = parseImage(input);

  if ([id, title, description, image].every(isRight)) {
    return right({ id.right, title.right, description.right, image.right });
  }
  
};


