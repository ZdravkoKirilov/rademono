import { FileInterceptor } from '@nestjs/platform-express';

import { toBadRequest } from '@app/shared';
import { ParsingError } from '@end/global';

export const applyImageRules = () =>
  FileInterceptor('file', {
    fileFilter: (_req, file, cb) => {
      if (['image/jpeg', 'image/png'].includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          toBadRequest({
            message: 'Unsupported file type: ' + file.mimetype,
            name: ParsingError.name,
          }),
          false,
        );
      }
    },
  });
