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
import { Package } from '../../package/entity/package.entity';
import { Transform } from 'class-transformer';

@Entity({ name: 'wallet_has_packages' })
export class WalletPackage {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @ManyToOne(() => Wallet, (wallet) => wallet.packages)
    @JoinColumn({ name: 'wallet_id' })
    wallet: Wallet;

    @ManyToOne(() => Package, (en) => en.walletPackages)
    @JoinColumn({ name: 'package_id' })
    data: Package;

    @Column({
        type: 'bigint',
        default: 0,
        name: 'credit_left',
        transformer: {
            to(value) {
                return value;
            },
            from(value) {
                return +value;
            },
        },
    })
    creditLeft: number;

    @Column({
        type: 'bigint',
        nullable: true,
        default: null,
        name: 'max_image_upload_size',
        transformer: {
            to(value) {
                return value;
            },
            from(value) {
                return +value;
            },
        },
    })
    maxImageUploadSize: number | null;

    @Column({
        type: 'bigint',
        nullable: true,
        default: null,
        name: 'max_pdf_upload_size',
        transformer: {
            to(value) {
                return value;
            },
            from(value) {
                return +value;
            },
        },
    })
    maxPdfUploadSize: number | null;

    @Column({ name: 'expire_at', nullable: true })
    expireAt: Date | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
