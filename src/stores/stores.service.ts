import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
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
import { StoreInput, StoreOutput } from './dtos/store.dto';
import { SearchStoreInput, SearchStoreOutput } from './dtos/search-store.dto';
import { Commission } from './entities/commission.entity';
import {
  CreateCommissionInput,
  CreateCommissionOutput,
} from './dtos/create-commission.dto';
import {
  EditCommissionInput,
  EditCommissionOutput,
} from './dtos/edit-commission.dto';
import {
  DeleteCommissionInput,
  DeleteCommissionOutput,
} from './dtos/delete-commission.dto';
import { PAGE_ITEMS } from 'src/common/common.constant';
import { MyStoresOutput } from './dtos/myStores.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly stores: Repository<Store>,

    @InjectRepository(Commission)
    private readonly commissions: Repository<Commission>,

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

  async myStores(creator: User): Promise<MyStoresOutput> {
    try {
      const stores = await this.stores.find({
        where: {
          creator: {
            id: creator.id,
          },
        },
        relations: ['category'],
      });
      return {
        stores,
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find Stores.',
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
      }

      await this.stores.save([
        {
          id: editStoreInput.storeId,
          ...editStoreInput,
          ...(category && { category }), // if category exists, add it to the object
        },
      ]);

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
        relations: ['category'],
        take: PAGE_ITEMS,
        skip: (page - 1) * PAGE_ITEMS,
      });

      const totalResults = await this.countStores(category);

      return {
        ok: true,
        category,
        stores,
        totalPages: Math.ceil(totalResults / PAGE_ITEMS),
        totalResults,
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
        take: PAGE_ITEMS,
        skip: (page - 1) * PAGE_ITEMS,
        relations: ['category'],
      });

      return {
        ok: true,
        results: stores,
        totalPages: Math.ceil(totalResults / PAGE_ITEMS),
        totalResults,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load stores',
      };
    }
  }

  async findStoreById({ storeId }: StoreInput): Promise<StoreOutput> {
    try {
      const store = await this.stores.findOne({
        where: {
          id: storeId,
        },
        relations: ['commissions', 'category'],
      });

      if (!store) {
        return {
          ok: false,
          error: 'Store not found',
        };
      }

      return {
        ok: true,
        store,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load store',
      };
    }
  }

  async searchStoreByName({
    query,
    page,
  }: SearchStoreInput): Promise<SearchStoreOutput> {
    try {
      const [stores, totalResults] = await this.stores.findAndCount({
        where: {
          name: ILike(`%${query}%`),
        },
        relations: ['category'],
        take: PAGE_ITEMS,
        skip: (page - 1) * PAGE_ITEMS,
      });

      return {
        ok: true,
        stores,
        totalPages: Math.ceil(totalResults / PAGE_ITEMS),
        totalResults,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not search for stores',
      };
    }
  }

  async createCommission(
    creator: User,
    createCommissionInput: CreateCommissionInput,
  ): Promise<CreateCommissionOutput> {
    try {
      const store = await this.stores.findOne({
        where: {
          id: createCommissionInput.storeId,
        },
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
          error:
            'You can not create a commission for a store that you do not own',
        };
      }

      await this.commissions.save(
        this.commissions.create({
          ...createCommissionInput,
          store,
        }),
      );

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create commission',
      };
    }
  }

  async deleteCommission(
    creator: User,
    { commissionId }: DeleteCommissionInput,
  ): Promise<DeleteCommissionOutput> {
    try {
      const commission = await this.commissions.findOne({
        where: {
          id: commissionId,
        },
        relations: ['store'],
      });

      if (!commission) {
        return {
          ok: false,
          error: 'Commission not found',
        };
      }

      if (creator.id !== commission.store.creatorId) {
        return {
          ok: false,
          error:
            'You can not delete a commission for a store that you do not own',
        };
      }

      await this.commissions.delete(commissionId);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not delete commission',
      };
    }
  }

  async editCommission(
    creator: User,
    editCommissionInput: EditCommissionInput,
  ): Promise<EditCommissionOutput> {
    try {
      const commission = await this.commissions.findOne({
        where: {
          id: editCommissionInput.commissionId,
        },
        relations: ['store'],
      });

      if (!commission) {
        return {
          ok: false,
          error: 'Commission not found',
        };
      }

      if (creator.id !== commission.store.creatorId) {
        return {
          ok: false,
          error:
            'You can not edit a commission for a store that you do not own',
        };
      }

      await this.commissions.save([
        {
          id: editCommissionInput.commissionId,
          ...editCommissionInput,
        },
      ]);

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not edit commission',
      };
    }
  }
}
