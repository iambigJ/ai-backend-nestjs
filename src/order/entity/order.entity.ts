import {
    Column,
    CreateDateColumn,
    Entity,
    Generated,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { DiscountCode } from './discount.entity';
import { User } from '../../user/entity/user.entity';
import { Package } from '../../package/entity/package.entity';
import { Transaction } from '../../wallet/entity/transaction.entity';

export enum OrderStatus {
    PENDING = 'pending',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
    PAID = 'paid',
    REVERSED = 'reversed',
}

@Entity({ name: 'orders' })
export class Order {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Generated('uuid')
    @Column({ type: 'uuid', select: false })
    callbackId: string;

    @Column({
        type: 'text',
        name: 'ref_id',
        default: null,
        nullable: true,
        select: false,
    })
    refId: string;

    @Column({ type: 'bigint', name: 'pay_amount' })
    payAmount: number;

    @Column({ type: 'text', default: OrderStatus.PENDING })
    status: OrderStatus;

    @Column({
        type: 'int',
        default: null,
        nullable: true,
        name: 'gateway_code',
    })
    gatewayCode: number;

    @Column({ name: 'package_price', type: 'bigint' })
    packagePrice: number;

    @Column({ name: 'discount_amount', type: 'bigint', default: 0 })
    discountAmount: number;

    @Column({ name: 'tax', type: 'bigint', default: 0 })
    tax: number;

    @Column({ name: 'extra_details', type: 'jsonb', default: {} })
    extraDetails: {
        message?: string;
        card_holder_pan?: string;
        sale_reference_id?: number;
    };

    @OneToMany(() => Transaction, (transaction) => transaction.order)
    transactions: Transaction[];

    @ManyToOne(() => Package, (en) => en.orders)
    @JoinColumn({ name: 'package_id' })
    package: Package;

    @ManyToOne(() => User, (user) => user.orders)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => DiscountCode, (discountCode) => discountCode.orders)
    @JoinColumn({ name: 'discount_code_id' })
    @Column({ nullable: true, type: 'varchar' })
    discountCode: DiscountCode | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
