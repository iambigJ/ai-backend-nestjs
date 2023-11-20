import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity({ name: 'discount_codes' })
export class DiscountCode {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, nullable: false })
    code: string;

    @Column({ type: 'int' })
    percent: number;

    @Column({ name: 'max_price', type: 'bigint' })
    maxPrice: number;

    @Column({ name: 'max_usage' })
    maxUsage: number;

    @OneToMany(() => Order, (order) => order.discountCode)
    orders: Order[];

    @Column({ name: 'expire_at', type: 'timestamp' })
    expireAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
