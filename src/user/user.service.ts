import { Injectable } from '@nestjs/common';
import { User } from './entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletService } from 'src/wallet/wallet.service';
import { UpdateUserDto, UpdateUserPasswordDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { hashPassword } from 'src/utils/hash';
import { Transactional } from 'typeorm-transactional';
import { WrongPasswordException } from './exception/user.exception';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        private walletService: WalletService,
    ) {}

    findOne(phone: string) {
        return this.userRepository.findOne({
            where: { phone },
            select: { password: true, phone: true, id: true },
        });
    }

    async findUserInfo(id: string) {
        return this.userRepository.findOne({ where: { id } });
    }

    async updateUserInfo(id: string, data: UpdateUserDto) {
        return this.userRepository.update(id, data);
    }

    async updateUserPassword(
        id: string,
        { password, newPassword }: UpdateUserPasswordDto,
    ) {
        const user = await this.userRepository.findOne({
            where: { id },
            select: { password: true },
        });
        const isPasswordMath = await bcrypt.compare(password, user.password);
        if (!isPasswordMath) {
            throw new WrongPasswordException();
        }
        const hashedPassword = await hashPassword(newPassword);
        return this.userRepository.update(id, { password: hashedPassword });
    }

    @Transactional()
    async createOne(phone: string, hashedPassword: string) {
        const user = await this.userRepository.save({
            phone,
            password: hashedPassword,
        });
        await this.walletService.createOne(user.id);
        await this.walletService.deposit(user.id, 10, null, true);
        return user;
    }

    updatePassword(phone: string, hashedPassword: string) {
        return this.userRepository.update(
            { phone },
            { password: hashedPassword },
        );
    }
}
