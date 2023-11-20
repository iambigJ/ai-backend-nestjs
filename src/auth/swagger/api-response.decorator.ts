import { applyDecorators } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiCreatedResponse,
    ApiOkResponse,
} from '@nestjs/swagger';
import { errorMessage } from 'src/dictionaries/error-message';
import { responseMessage } from 'src/dictionaries/response-message';

export const ApiLogin = () => {
    return applyDecorators(
        ApiBody({
            schema: {
                type: 'object',
                properties: {
                    phone: {
                        type: 'string',
                        nullable: false,
                    },
                    password: {
                        type: 'string',
                        nullable: false,
                    },
                },
            },
        }),
        ApiOkResponse({
            schema: {
                properties: {
                    message: {
                        type: 'string',
                        example: responseMessage.auth.login,
                    },
                    accessToken: {
                        type: 'string',
                    },
                },
            },
        }),
        ApiBadRequestResponse({
            schema: {
                properties: {
                    message: {
                        type: 'string',
                        example: 'Bad Request',
                    },
                    statusCode: { type: 'number', example: 400 },
                },
            },
        }),
    );
};

export const ApiSendOtp = () => {
    return applyDecorators(
        ApiOkResponse({
            schema: {
                properties: {
                    message: {
                        type: 'string',
                        example: responseMessage.auth.sendOtp,
                    },
                },
            },
        }),
        ApiBadRequestResponse({
            schema: {
                properties: {
                    statusCode: { type: 'number', example: 400 },
                    message: {
                        type: 'array',
                        items: {
                            type: 'string',
                            example:
                                errorMessage.auth.validation.phone.validate,
                        },
                        example: [errorMessage.auth.validation.phone.validate],
                    },
                    error: { type: 'string', example: 'Bad Request' },
                },
            },
        }),
    );
};

export const ApiSignup = () => {
    return applyDecorators(
        ApiCreatedResponse({
            schema: {
                properties: {
                    message: {
                        type: 'string',
                        example: responseMessage.auth.signup,
                    },
                    accessToken: {
                        type: 'string',
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
                        example: errorMessage.auth.alreadyHaveAccount,
                    },
                    error: { type: 'string', example: 'Bad Request' },
                },
            },
        }),
    );
};

export const ApiResetpassword = () => {
    return applyDecorators(
        ApiOkResponse({
            schema: {
                properties: {
                    message: {
                        type: 'string',
                        example: responseMessage.auth.resetPassword,
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
                        example: errorMessage.auth.validation.phone.validate,
                    },
                    error: { type: 'string', example: 'Bad Request' },
                },
            },
        }),
    );
};
