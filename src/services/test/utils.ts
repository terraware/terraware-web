import fs from 'fs';

export const readData = (fileName: string) => JSON.parse(fs.readFileSync(`src/services/test/data/${fileName}`, 'utf8'));
