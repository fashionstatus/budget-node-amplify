import { AccountRepository } from '../account.repository';
import { Account } from '../../../../models/account';
import { Id } from '../../../../models/types';

export class InMemoryAccountRepository implements AccountRepository {

  async  createAccount(account: Account): Promise<Id> {
        account.id = (ACCOUNTS.length + 1).toString();
        ACCOUNTS.push(account);
        return Promise.resolve(account.id);
    }

}

const ACCOUNTS: Account[] = [
    {
        id: '1'
    },
    {
        id: '2'
    }
]
