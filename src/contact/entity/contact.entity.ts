import { User } from '../../user/entity/user.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum RequestType {
    ORGANIZATION_REQUEST = 'organization_request',
    API_REQUEST = 'api_request',
    PERSONAL_PACKAGE_REQUEST = 'personal_package_request',
}

@Entity({ name: 'contacts' })
export class Contact {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'text', name: 'request_type' })
    requestType: RequestType;

    @ManyToOne(() => User, (user) => user.contactRequests)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'extra_data', type: 'json', nullable: true, default: null })
    extraData: Record<string, any> | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
