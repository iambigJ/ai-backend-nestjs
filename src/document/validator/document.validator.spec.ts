import { DocumentValidator } from './document.validator';
import * as fs from 'fs/promises';
import { Readable } from 'stream';

describe('DocumentValidator', () => {
    let documentValidator: DocumentValidator;

    beforeEach(() => {
        documentValidator = new DocumentValidator({
            fileType: /image\/*|application\/pdf/,
        });
    });

    it('should create an instance of DocumentValidator', () => {
        expect(documentValidator).toBeInstanceOf(DocumentValidator);
    });

    describe('isImageValid', () => {
        it('should return true for a valid image', async () => {
            const validImage = {
                buffer: Buffer.from(
                    await fs.readFile('storage/test/MAMAD.jpeg'),
                ),
                originalname: 'MAMAD.jpeg',
                mimetype: 'image/jpeg',
                fieldname: '',
                encoding: '',
                size: 0,
                stream: new Readable(),
                destination: '',
                filename: '',
                path: '',
            };
            const result = await documentValidator.isImageValid(validImage);
            expect(result).toBe(true);
        });

        it('should return false for an invalid image', async () => {
            const invalidImage = {
                buffer: Buffer.from(
                    await fs.readFile('storage/test/bad-file.jpeg'),
                ),
                originalname: 'bad-file.jpeg',
                mimetype: 'image/jpeg',
                fieldname: '',
                encoding: '',
                size: 0,
                stream: new Readable(),
                destination: '',
                filename: '',
                path: '',
            };
            const result = await documentValidator.isImageValid(invalidImage);
            expect(result).toBe(false);
        });
    });

    describe('isPdfValid', () => {
        it('should return true for a valid PDF', async () => {
            const validPdf = {
                buffer: Buffer.from(await fs.readFile('storage/test/test.pdf')),
                originalname: 'test.pdf',
                mimetype: 'application/pdf',
                fieldname: '',
                encoding: '',
                size: 0,
                stream: new Readable(),
                destination: '',
                filename: '',
                path: '',
            };
            const result = documentValidator.isPdfValid(validPdf);
            expect(result).toBe(true);
        });

        it('should return false for an invalid PDF', async () => {
            const invalidPdf = {
                buffer: Buffer.from(
                    await fs.readFile('storage/test/bad-file.pdf'),
                ),
                originalname: 'bad-file.pdf',
                mimetype: 'application/pdf',
                fieldname: '',
                encoding: '',
                size: 0,
                stream: new Readable(),
                destination: '',
                filename: '',
                path: '',
            };
            const result = documentValidator.isPdfValid(invalidPdf);
            expect(result).toBe(false);
        });
    });

    describe('isValid', () => {
        it('should return true for a valid file', async () => {
            const validImage = {
                buffer: Buffer.from(
                    await fs.readFile('storage/test/MAMAD.jpeg'),
                ),
                originalname: 'MAMAD.jpeg',
                mimetype: 'image/jpeg',
                fieldname: '',
                encoding: '',
                size: 0,
                stream: new Readable(),
                destination: '',
                filename: '',
                path: '',
            };
            const result = await documentValidator.isValid(validImage);
            expect(result).toBe(true);
        });

        it('should return false for an invalid file', async () => {
            const invalidFile = {
                buffer: Buffer.from(await fs.readFile('storage/test/text.txt')),
                originalname: 'text.txt',
                mimetype: 'text/plain',
                fieldname: '',
                encoding: '',
                size: 0,
                stream: new Readable(),
                destination: '',
                filename: '',
                path: '',
            };
            const result = await documentValidator.isValid(invalidFile);
            expect(result).toBe(false);
        });
    });
});
