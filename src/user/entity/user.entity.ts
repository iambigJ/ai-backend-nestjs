import { Contact } from '../../contact/entity/contact.entity';
import { Document } from '../../document/entity/document.entity';
import { Order } from '../../order/entity/order.entity';
import { Wallet } from '../../wallet/entity/wallet.entity';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    OneToMany,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'first_name', nullable: true, default: null })
    firstName: string;

    @Column({ name: 'last_name', nullable: true, default: null })
    lastName: string;

    @Column({ unique: true })
    phone: string;

    @Column({ select: false })
    password: string;

    @OneToOne(() => Wallet, (wallet) => wallet.user)
    wallet: Wallet;

    @OneToMany(() => Order, (order) => order.user)
    orders: Order[];

    @OneToMany(() => Document, (document) => document.owner)
    documents: Document[];

    @OneToMany(() => Contact, (contact) => contact.user)
    contactRequests: Contact[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
