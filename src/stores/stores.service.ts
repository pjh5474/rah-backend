import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStoreInput, CreateStoreOutput } from './dtos/create-store.dto';
import { Store } from './entities/store.entity';
import { User } from 'src/users/entities/user.entity';
import { Category } from './entities/category.entity';
import { CategoryRepository } from './repositories/category.repository';
import { EditStoreInput, EditStoreOutput } from './dtos/edit-store.dto';
import { DeleteStoreInput, DeleteStoreOutput } from './dtos/delete-store.dto';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { StoresInput, StoresOutput } from './dtos/stores.dto';

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

  async deleteStore(
    creator: User,
    { storeId }: DeleteStoreInput,
  ): Promise<DeleteStoreOutput> {
    try {
      const store = await this.stores.findOne({
        where: { id: storeId },
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
          error: 'You can not delete a store that you do not own',
        };
      }

      await this.stores.delete(storeId);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not delete store',
      };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      return {
        ok: true,
        categories,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load categories',
      };
    }
  }

  countStores(category: Category) {
    return this.stores.count({
      where: {
        category: {
          id: category.id,
        },
      },
    });
  }

  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne({
        where: { slug },
        relations: ['stores'],
      });
      if (!category) {
        return {
          ok: false,
          error: 'Category not found',
        };
      }

      const stores = await this.stores.find({
        where: {
          category: {
            id: category.id,
          },
        },
        take: 25,
        skip: (page - 1) * 25,
      });

      const totalResults = await this.countStores(category);

      return {
        ok: true,
        category,
        stores,
        totalPages: Math.ceil(totalResults / 25),
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load category',
      };
    }
  }

  async allStores({ page }: StoresInput): Promise<StoresOutput> {
    try {
      const [stores, totalResults] = await this.stores.findAndCount({
        take: 25,
        skip: (page - 1) * 25,
      });

      return {
        ok: true,
        stores,
        totalPages: Math.ceil(totalResults / 25),
        totalResults,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load stores',
      };
    }
  }
}
