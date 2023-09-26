import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStoreInput, CreateStoreOutput } from './dtos/create-store.dto';
import { Store } from './entities/store.entity';
import { User } from 'src/users/entities/user.entity';
import { Category } from './entities/category.entity';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly stores: Repository<Store>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  async createStore(
    creator: User,
    createStoreInput: CreateStoreInput,
  ): Promise<CreateStoreOutput> {
    try {
      const newStore = this.stores.create(createStoreInput);
      newStore.creator = creator;
      const categoryName = createStoreInput.categoryName.trim().toLowerCase();
      const categorySlug = categoryName.replace(/ /g, '-');
      let category = await this.categories.findOne({
        where: { slug: categorySlug },
      });
      if (!category) {
        category = await this.categories.save(
          this.categories.create({ slug: categorySlug, name: categoryName }),
        );
      }
      newStore.category = category;

      await this.stores.save(newStore);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create store',
      };
    }
  }
}
