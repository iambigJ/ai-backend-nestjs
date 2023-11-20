import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

const pagesRegex = new RegExp(/(?<=Pages:.*)[1-9]/);
const encryptedRegex = new RegExp(/(?<=Encrypted:.*)[aA-zZ]/);

const savePdfInTemp = async (buffer: Buffer) => {
    const id = randomUUID();
    const addr = path.join('tmp', id);
    const filePath = path.join(addr, 'tmp.pdf');
    await fs.mkdir(addr, { recursive: true });
    await fs.writeFile(filePath, buffer);
    return [addr, 'tmp.pdf'];
};

export const getPdfInfo = async (buffer: Buffer) => {
    const [cwd, filename] = await savePdfInTemp(buffer);
    const filePath = path.join(cwd, filename);
    return new Promise<{ pages: number; encrypted: boolean }>(
        (resolve, reject) => {
            let result = '';
            let error = '';
            const process = spawn('pdfinfo', [filename], { cwd });
            process.stdout.on('data', (data) => {
                result += data;
            });

            process.stderr.on('data', (data) => {
                error += data;
            });
            process.on('exit', async (code, signal) => {
                if (error.length > 0) {
                    reject(error);
                    return;
                }

                if (code !== 0) {
                    reject(error);
                    return;
                }
                const pages = result.match(pagesRegex)[0];
                const encrypted = result.match(encryptedRegex)[0] !== 'no';
                if (!pages) {
                    reject('count of pages not found');
                    return;
                }
                await fs.rm(filePath);
                resolve({ pages: +pages, encrypted });
            });
        },
    );
};
