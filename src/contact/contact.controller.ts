import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth-jwt.guard';
import { Request } from 'express';
import { CreateContactDto } from './dto/create-contact.dto';
import { responseMessage } from 'src/dictionaries/response-message';

@ApiSecurity('user-auth')
@ApiTags('contact')
@UseGuards(JwtAuthGuard)
@Controller('contact')
export class ContactController {
    constructor(private readonly contactService: ContactService) {}

    @Post()
    async submitContactRequest(
        @Req() req: Request,
        @Body() body: CreateContactDto,
    ) {
        await this.contactService.create(req.user.id, body);
        return {
            message: responseMessage.contact.submit,
        };
    }
}
