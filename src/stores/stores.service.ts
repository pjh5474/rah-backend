import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStoreInput, CreateStoreOutput } from './dtos/create-store.dto';
import { Store } from './entities/store.entity';
import { User } from 'src/users/entities/user.entity';
import { Category } from './entities/category.entity';
import { CategoryRepository } from './repositories/category.repository';
import { EditStoreInput, EditStoreOutput } from './dtos/edit-store.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly stores: Repository<Store>,

    private readonly categories: CategoryRepository,
  ) {}

  async createStore(
    creator: User,
    createStoreInput: CreateStoreInput,
  ): Promise<CreateStoreOutput> {
    try {
      const newStore = this.stores.create(createStoreInput);
      newStore.creator = creator;
      const category = await this.categories.getOrCreate(
        createStoreInput.categoryName,
      );
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

  async editStore(
    creator: User,
    editStoreInput: EditStoreInput,
  ): Promise<EditStoreOutput> {
    try {
      const store = await this.stores.findOne({
        where: { id: editStoreInput.storeId },
      });
      if (!store) {
        return {
          ok: false,
          error: 'Store not found',
        };
      }

      if (creator.id !== store.creatorId) {
        return {
          ok: false,
          error: 'You can not edit a store that you do not own',
        };
      }

      let category: Category = null;
      if (editStoreInput.categoryName) {
        category = await this.categories.getOrCreate(
          editStoreInput.categoryName,
        );
        await this.stores.save([
          {
            id: editStoreInput.storeId,
            ...editStoreInput,
            ...(category && { category }), // if category exists, add it to the object
          },
        ]);
      }

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not edit store',
      };
    }
  }
}
