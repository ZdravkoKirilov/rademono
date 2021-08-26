import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { Request } from 'express';

import { toBadRequest } from '@app/shared';

export const applyImageRules = () =>
  FileInterceptor('file', {
    fileFilter: (_req, file, cb) => {
      if (['image/jpeg', 'image/png'].includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          toBadRequest({
            message: 'Unsupported file type: ' + file.mimetype,
            name: 'InvalidFileType',
          }),
          false,
        );
      }
    },
  });

export const applyFileNameRules = (
  _req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, filename: string) => void,
) => {
  const randomName = Array(32)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  return cb(null, `${randomName}${extname(file.originalname)}`);
};
