import { Injectable } from '@nestjs/common';
import path from 'path';
import fs from 'fs';

@Injectable()
export class FileService {
  deleteFile(filePath: string) {
    const basePath = path.join(__dirname, '../../..');
    return new Promise((resolve, reject) => {
      fs.unlink(basePath + 'uploads/' + filePath, (err) => {
        if (err) {
          console.log('Failed to delete the file. ', err);
          reject(err);
        }
        console.log('File deleted: ' + filePath);
        resolve(undefined);
      });
    });
  }
}
