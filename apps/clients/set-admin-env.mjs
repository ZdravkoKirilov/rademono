import { writeFile } from 'fs';

const targetPath = './projects/games-admin/src/environments/environment.prod.ts';

const envConfigFile = `export const environment = {
   apiHost: '${process.env.API_HOST}',
   nodeEnv: '${process.env.NODE_ENV}',
   production: ${process.env.NODE_ENV === 'production'},
};
`;
console.log(
  'The file `environment.ts` will be written with the following content: \n' +
    envConfigFile,
);

writeFile(targetPath, envConfigFile, function (err) {
  if (err) {
    throw console.error(err);
  } else {
    console.log(
      `Angular environment.ts file generated correctly at ${targetPath} \n`,
    );
  }
});
