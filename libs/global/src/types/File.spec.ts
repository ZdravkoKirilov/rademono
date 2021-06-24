import { CustomFile, ensureIsFile, hasCorrectSize, hasFileType } from './File';

describe('CustomFile type', () => {
  describe(CustomFile.FileSize.name, () => {
    it('passes with correct data', () => {
      const mockFile = { size: 1 * 1024 * 1024 } as CustomFile;
      const result = hasCorrectSize(mockFile, [1, 0]);
      expect(result).toBe(true);
    });

    it('fails when the file is too big', () => {
      const mockFile = { size: 2 * 1024 * 1024 } as CustomFile;
      const result = hasCorrectSize(mockFile, [1, 0]);
      expect(result).toBe(false);
    });

    it('fails when the file is too small', () => {
      const mockFile = { size: 2 * 1024 * 1024 } as CustomFile;
      const result = hasCorrectSize(mockFile, [5, 3]);
      expect(result).toBe(false);
    });
  });

  describe(CustomFile.FileType.name, () => {
    it('passes when the file type is allowed', () => {
      const mockFile = { name: 'picture.jpg' } as CustomFile;

      const result = hasFileType(mockFile, ['jpg']);
      expect(result).toBe(true);
    });

    it('fails when the file type is not allowed', () => {
      const mockFile = { name: 'picture.jpg' } as CustomFile;

      const result = hasFileType(mockFile, ['png']);
      expect(result).toBe(false);
    });
  });

  describe(CustomFile.IsFile.name, () => {
    it('passes with a file-like object', () => {
      const mockFile = { name: 'picture.jpg', size: 5000 };
      expect(ensureIsFile(mockFile)).toBe(true);
    });

    it('fails with a non-file object', () => {
      expect(ensureIsFile({ name: 'file.png' })).toBe(false);
      expect(ensureIsFile({ size: 5000 })).toBe(false);
      expect(ensureIsFile({})).toBe(false);
    });
  });
});
