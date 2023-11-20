import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Wallet } from './wallet.entity';
import { Order } from '../../order/entity/order.entity';
import { Transform } from 'class-transformer';

export enum TransactionType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

@Entity({ name: 'transactions' })
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    type: TransactionType;

    @Column({
        type: 'bigint',
        transformer: {
            to(value) {
                return value;
            },
            from(value) {
                return +value;
            },
        },
    })
    amount: number;

    @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
    @JoinColumn({ name: 'wallet_id' })
    wallet: Wallet;

    @ManyToOne(() => Order, (order) => order.transactions)
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
