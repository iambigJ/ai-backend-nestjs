import { Order } from '../../order/entity/order.entity';
import { WalletPackage } from '../../wallet/entity/wallet-package.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'packages' })
export class Package {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    credit: number;

    @Column({ name: 'expiration_duration', nullable: true, default: null })
    expirationDuration: number | null;

    @Column({ name: 'max_image_upload_size', nullable: true, default: null })
    maxImageUploadSize: number | null;

    @Column({ name: 'max_pdf_upload_size', nullable: true, default: null })
    maxPdfUploadSize: number | null;

    @Column()
    price: number;

    @OneToMany(() => WalletPackage, (walletPackage) => walletPackage.data)
    walletPackages: WalletPackage[];

    @OneToMany(() => Order, (order) => order.package)
    orders: Order[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
