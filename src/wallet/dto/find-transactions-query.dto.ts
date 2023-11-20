import { PageOptionsDto } from 'src/pagination/dto/page-options.dto';
import { TransactionType } from '../entity/transaction.entity';
import { IsIn } from 'class-validator';

export class FindTransactionsQuery extends PageOptionsDto {
    @IsIn([TransactionType.DEPOSIT, TransactionType.WITHDRAW, 'all'])
    type: TransactionType.DEPOSIT | TransactionType.WITHDRAW | 'all';
}
