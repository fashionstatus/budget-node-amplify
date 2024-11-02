import { Id } from '../../../models/types';
import { Category } from '../../../models/category';

export interface CategoriesRepository {

  getCategory(id: Id): Promise<Category>;

  getCategories(accountId: Id): Promise<Category[]>;

  createDefaultCategories(accountId: Id): Promise<void>;

}