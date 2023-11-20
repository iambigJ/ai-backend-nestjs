import { User } from '../../user/entity/user.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Transaction } from './transaction.entity';
import { WalletPackage } from './wallet-package.entity';
import { Transform } from 'class-transformer';

@Entity({ name: 'wallets' })
export class Wallet {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'bigint',
        default: 0,
        transformer: {
            to(value) {
                return value;
            },
            from(value) {
                return +value;
            },
        },
    })
    credit: number;

    @Column({
        name: 'gift_credit',
        type: 'bigint',
        default: 0,
        transformer: {
            to(value) {
                return value;
            },
            from(value) {
                return +value;
            },
        },
    })
    giftCredit: number;

    @Column({
        name: 'credit_used',
        default: 0,
        transformer: {
            to(value) {
                return value;
            },
            from(value) {
                return +value;
            },
        },
    })
    creditUsed: number;

    @OneToOne(() => User, (user) => user.wallet, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => Transaction, (transaction) => transaction.wallet)
    transactions: Transaction[];

    @OneToMany(() => WalletPackage, (walletPackage) => walletPackage.wallet)
    packages: WalletPackage[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
