export class CreateGameDto {}

if (!isObject(input)) {
  return toTagged<ParsingError>('ParsingError', { message: 'PayloadIsNotAnObject' })
}

const parsingError = toTagged<ParsingError>('ParsingError');
parsingError.errors = {};

const public_id = UUIDv4.generate();
const title = parseTitle(input, parsingError);
const description = parseDescription(input, parsingError);
const image = parseImage(input, parsingError);

if (!title || !isEmpty(parsingError.errors)) {
  return parsingError;
}

return { public_id, title, description, image };