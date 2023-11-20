import { Request, Response } from 'express';
import * as multer from 'multer';

export const assignFileToReq = (
    req: Request,
    res: Response,
    fieldName: string,
): Promise<void> => {
    return new Promise((resolve, reject) => {
        const upload = multer().single(fieldName);
        upload(req, res, (err) => {
            if (err) {
                // reject(err);
            }
            resolve();
        });
    });
};

export const getFileType = (mimeType: string) => {
    if (mimeType.match(/image\/*/)) {
        return 'image';
    }
    if (mimeType.match(/application\/pdf/)) {
        return 'pdf';
    }
    return null;
};
