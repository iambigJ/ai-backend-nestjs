import { applyDecorators } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiConsumes,
    ApiCreatedResponse,
    ApiHeaders,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiProduces,
    ApiResponse,
    getSchemaPath,
} from '@nestjs/swagger';
import { responseMessage } from 'src/dictionaries/response-message';
import { Document, DocumentType } from '../entity/document.entity';
import { errorMessage } from 'src/dictionaries/error-message';

export const ApiUploadDocument = () => {
    return applyDecorators(
        ApiConsumes('multipart/form-data'),
        ApiBody({
            schema: {
                type: 'object',
                properties: {
                    file: {
                        type: 'string',
                        format: 'binary',
                        nullable: false,
                    },
                    type: {
                        type: 'enum',
                        nullable: false,
                        enum: [DocumentType.General, DocumentType.Identity],
                    },
                },
            },
        }),
        ApiCreatedResponse({
            description: 'File Successfully uploaded',
            schema: {
                properties: {
                    message: {
                        type: 'string',
                        example: responseMessage.document.upload,
                    },
                    document: {
                        $ref: getSchemaPath(Document),
                    },
                },
            },
        }),
        ApiBadRequestResponse({
            schema: {
                properties: {
                    statusCode: { type: 'number', example: 400 },
                    message: {
                        type: 'string',
                        items: { type: 'string' },
                        example: errorMessage.document.unsupportedFileType,
                        examples: [
                            errorMessage.document.unsupportedFileType,
                            [errorMessage.document.unsupportedFileType],
                        ],
                    },
                    error: { type: 'string', example: 'Bad Request' },
                },
            },
        }),
    );
};

export const ApiStartOcrDocument = () => {
    return applyDecorators(
        ApiResponse({
            schema: {
                properties: {
                    message: {
                        type: 'string',
                        example: responseMessage.document.startOcr,
                    },
                },
            },
            status: 201,
        }),
        ApiBadRequestResponse({
            schema: {
                properties: {
                    statusCode: { type: 'number', example: 400 },
                    message: {
                        type: 'string',
                        items: { type: 'string' },
                        example: errorMessage.wallet.insufficientBalance,
                        examples: [
                            errorMessage.wallet.insufficientBalance,
                            [errorMessage.wallet.insufficientBalance],
                        ],
                    },
                    error: { type: 'string', example: 'Bad Request' },
                },
            },
        }),
        ApiNotFoundResponse({
            schema: {
                properties: {
                    statusCode: { type: 'number', example: 404 },
                    message: {
                        type: 'string',
                        example: errorMessage.document.documentNotFound,
                    },
                    error: { type: 'string', example: 'Not Found' },
                },
            },
        }),
    );
};

export const ApiGetOneDocument = () => {
    return applyDecorators(
        ApiOkResponse({
            schema: {
                properties: {
                    message: {
                        type: 'string',
                        example: responseMessage.document.getOne,
                    },
                    document: {
                        $ref: getSchemaPath(Document),
                    },
                },
            },
        }),
        ApiNotFoundResponse({
            schema: {
                properties: {
                    statusCode: { type: 'number', example: 404 },
                    message: {
                        type: 'string',
                        example: errorMessage.document.documentNotFound,
                    },
                    error: { type: 'string', example: 'Not Found' },
                },
            },
        }),
    );
};

export const ApiDownloadDocument = () => {
    return applyDecorators(ApiOkResponse({}), ApiProduces('application/zip'));
};

export const ApiDeleteDocument = () => {
    return applyDecorators(
        ApiOkResponse({
            schema: {
                properties: {
                    message: {
                        type: 'string',
                        example: responseMessage.document.delete,
                    },
                },
            },
        }),
        ApiNotFoundResponse({
            schema: {
                properties: {
                    statusCode: { type: 'number', example: 404 },
                    message: {
                        type: 'string',
                        example: errorMessage.document.documentNotFound,
                    },
                    error: { type: 'string', example: 'Not Found' },
                },
            },
        }),
    );
};

export const ApiEditDocumentText = () => {
    return applyDecorators(
        ApiOkResponse({
            schema: {
                properties: {
                    message: {
                        type: 'string',
                        example: responseMessage.document.editDocumentText,
                    },
                },
            },
        }),
        ApiNotFoundResponse({
            schema: {
                properties: {
                    statusCode: { type: 'number', example: 404 },
                    message: {
                        type: 'string',
                        example: errorMessage.document.documentNotFound,
                    },
                    error: { type: 'string', example: 'Not Found' },
                },
            },
        }),
    );
};
