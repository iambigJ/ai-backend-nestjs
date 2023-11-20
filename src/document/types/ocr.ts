import { DocumentType, OcrOptions } from '../entity/document.entity';

export type OcrPublishMessage = {
    documentId: string;
    ocrOptions: OcrOptions;
    fileType: 'image' | 'pdf';
    directory: string;
    filename: string;
    docType: DocumentType;
};

export type OcrSubMessage = {
    documentId: string;
    wordUri: string;
    outImageUri: string;
    txtUri: string;
    jsonUri: string;
};
