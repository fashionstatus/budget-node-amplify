import { Account } from '../../../models/account';
import { Id } from '../../../models/types';

export interface AccountRepository {

    createAccount(account: Account): Promise<Id>;

}