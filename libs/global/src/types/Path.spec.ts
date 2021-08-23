import { FilePath, isFilePath } from './Path';

describe('FilePath', () => {
  describe(FilePath.IsFilePath.name, () => {
    it('works with correct data', () => {
      expect(isFilePath('some/path/to/image.jpg', ['jpg'])).toBe(true);
    });

    it('fails with non string value', () => {
      expect(isFilePath(5, ['jpg'])).toBe(false);
    });

    it('fails with empty string value', () => {
      expect(isFilePath('', ['jpg'])).toBe(false);
    });

    it('fails with non-whitelisted extension', () => {
      expect(isFilePath('some/path/to/image.png', ['jpg'])).toBe(false);
    });
  });
});
