import {
    Body,
    Controller,
    Delete,
    Get,
    Header,
    NotFoundException,
    Param,
    ParseFilePipe,
    Patch,
    Post,
    Query,
    Req,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentValidator } from './validator/document.validator';
import { ApiBody, ApiConsumes, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guard/auth-jwt.guard';
import { DocumentSizeValidationPipe } from './pipe/document-size.pipe';
import { Request, Response } from 'express';
import { OcrDto, UploadDto } from './dto/upload.dto';
import { Document, DocumentType } from './entity/document.entity';
import { FindDocumentQuery } from './dto/find.dto';
import { ApiPaginatedResponse } from 'src/pagination/decorator/api-paginated-response.decorator';
import { UpdateDocumentTextDto } from './dto/update.dto';
import * as archiver from 'archiver';
import * as path from 'path';
import { responseMessage } from 'src/dictionaries/response-message';
import {
    ApiDeleteDocument,
    ApiDownloadDocument,
    ApiEditDocumentText,
    ApiGetOneDocument,
    ApiStartOcrDocument,
    ApiUploadDocument,
} from './swagger/api-response.decorator';
import { DocumentNotFoundException } from './exception/document.exception';

@ApiSecurity('user-auth')
@ApiTags('document')
@UseGuards(JwtAuthGuard)
@Controller('document')
export class DocumentController {
    constructor(private readonly documentService: DocumentService) {}

    @ApiUploadDocument()
    @UseInterceptors(FileInterceptor('file'))
    @Post('upload')
    async uploadDocument(
        @UploadedFile(
            new ParseFilePipe({
                validators: [new DocumentValidator({})],
            }),
            DocumentSizeValidationPipe,
        )
        file: Express.Multer.File,
        @Req() req: Request,
        @Body() body: UploadDto,
    ) {
        const document = await this.documentService.createDocument(
            req.user.id,
            file,
            body.type,
        );
        return {
            message: responseMessage.document.upload,
            document,
        };
    }

    @ApiStartOcrDocument()
    @Post('start-ocr/:document_id')
    async startOCR(
        @Req() req: Request,
        @Param('document_id') documentId: string,
        @Body() ocrOptions: OcrDto,
    ) {
        await this.documentService.startOCR(
            documentId,
            req.user.id,
            ocrOptions,
        );
        return {
            message: responseMessage.document.startOcr,
        };
    }

    @Get()
    @ApiPaginatedResponse(Document)
    async getAll(@Req() req: Request, @Query() query: FindDocumentQuery) {
        return this.documentService.findAll(req.user.id, query);
    }

    @ApiGetOneDocument()
    @Get(':document_id')
    async getOne(
        @Req() req: Request,
        @Param('document_id') documentId: string,
    ) {
        const document = await this.documentService.findOneDocument(
            documentId,
            req.user.id,
        );
        if (!document) {
            throw new DocumentNotFoundException();
        }
        return {
            message: responseMessage.document.getOne,
            document,
        };
    }

    @ApiDownloadDocument()
    @Get('download-zip/:document_id')
    async download(
        @Req() req: Request,
        @Param('document_id') documentId: string,
        @Res() res: Response,
    ) {
        const document = await this.documentService.findOneDocument(
            documentId,
            req.user.id,
        );
        if (!document) {
            throw new DocumentNotFoundException();
        }
        const archive = archiver('zip');
        const directory = document.originalFileUri.split('/');
        directory.pop();
        archive.directory(
            path.resolve('storage', directory.join('/')),
            documentId,
        );
        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${documentId}.zip"`,
        });
        archive.pipe(res);
        archive.finalize();
    }

    @ApiDeleteDocument()
    @Delete(':document_id')
    async delete(
        @Req() req: Request,
        @Param('document_id') documentId: string,
    ) {
        await this.documentService.deleteDocument(documentId, req.user.id);
        return {
            message: responseMessage.document.delete,
        };
    }

    @ApiEditDocumentText()
    @Patch(':document_id')
    async editDocumentText(
        @Req() req: Request,
        @Param('document_id') documentId: string,
        @Body() body: UpdateDocumentTextDto,
    ) {
        await this.documentService.editDocumentText(
            documentId,
            req.user.id,
            body.text,
        );
        return {
            message: responseMessage.document.editDocumentText,
        };
    }
}
