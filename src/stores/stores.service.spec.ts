import { Test } from '@nestjs/testing';
import { StoresService } from './stores.service';
import { Store } from './entities/store.entity';
import { ILike, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Commission } from './entities/commission.entity';
import { Category } from './entities/category.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { CategoryRepository } from './repositories/category.repository';
import { PAGE_ITEMS } from 'src/common/common.constant';

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const Creator: User = {
  id: 1,
  username: 'USERNAME',
  email: 'EMAIL@EMAIL.com',
  password: 'PASSWORD',
  role: UserRole.Creator,
  verified: true,
  stores: [],
  payments: [],
  orders: [],
  isSponsor: false,
  hashPassword: jest.fn(),
  checkPassword: jest.fn(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const createStoreArgs = {
  name: 'name',
  coverImg: 'coverImg',
  address: 'address',
  categoryName: 'categoryName',
};

const editStoreArgs = {
  storeId: 1,
  categoryName: 'categoryName_2',
  name: 'name_2',
};

const category: Category = {
  id: 1,
  name: 'categoryName',
  slug: 'categorySlug',
  stores: [],
  coverImg: 'coverImg',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const editCommissionArgs = {
  commissionId: 1,
  options: [],
  name: 'Commission_2',
  price: 2,
  description: 'Description_2',
  storeId: 1,
};

const createCommissionArgs = {
  storeId: 1,
  options: [],
  name: 'Commission',
  price: 1,
  description: 'Description',
};

describe('StoresService', () => {
  let service: StoresService;
  let storesRepository: MockRepository<Store>;
  let commissionsRepository: MockRepository<Commission>;
  let categories: CategoryRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        StoresService,
        {
          provide: getRepositoryToken(Store),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Commission),
          useValue: mockRepository(),
        },
        {
          provide: CategoryRepository,
          useValue: {
            getOrCreate: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<StoresService>(StoresService);
    storesRepository = module.get(getRepositoryToken(Store));
    commissionsRepository = module.get(getRepositoryToken(Commission));
    categories = module.get(CategoryRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createStore', () => {
    it('should fail on exception', async () => {
      storesRepository.findOne.mockRejectedValue(new Error(':)'));

      const result = await service.createStore(null, createStoreArgs);

      expect(result).toEqual({
        ok: false,
        error: 'Could not create store',
      });
    });

    it('should create a new Store', async () => {
      storesRepository.create.mockReturnValue(createStoreArgs);
      storesRepository.save.mockResolvedValue(createStoreArgs);
      jest.spyOn(categories, 'getOrCreate').mockImplementation(async () => {
        return category;
      });

      const result = await service.createStore(Creator, createStoreArgs);
      expect(storesRepository.create).toHaveBeenCalledTimes(1);
      expect(storesRepository.create).toHaveBeenCalledWith(createStoreArgs);

      expect(categories.getOrCreate).toHaveBeenCalledTimes(1);

      expect(storesRepository.save).toHaveBeenCalledTimes(1);
      expect(storesRepository.save).toHaveBeenCalledWith(createStoreArgs);
      expect(result).toEqual({ ok: true });
    });
  });

  describe('editStore', () => {
    it('should fail if Store not found', async () => {
      storesRepository.findOne.mockResolvedValue(undefined);

      const result = await service.editStore(Creator, editStoreArgs);

      expect(result).toEqual({
        ok: false,
        error: 'Store not found',
      });
    });

    it('should fail it user is not Creator', async () => {
      storesRepository.findOne.mockResolvedValue({
        creatorId: 2,
      });

      const result = await service.editStore(Creator, editStoreArgs);

      expect(result).toEqual({
        ok: false,
        error: 'You can not edit a store that you do not own',
      });
    });

    it('should edit Store', async () => {
      storesRepository.findOne.mockResolvedValue({
        creatorId: 1,
      });
      storesRepository.save.mockResolvedValue({
        id: 1,
      });

      const result = await service.editStore(Creator, editStoreArgs);

      expect(storesRepository.save).toHaveBeenCalledTimes(1);
      expect(storesRepository.save).toHaveBeenCalledWith([
        {
          id: 1,
          ...editStoreArgs,
        },
      ]);

      expect(result).toEqual({
        ok: true,
      });
    });

    it('should get or create category', async () => {
      storesRepository.findOne.mockResolvedValue({
        creatorId: 1,
      });
      storesRepository.save.mockResolvedValue({
        id: 1,
      });

      jest.spyOn(categories, 'getOrCreate').mockImplementation(async () => {
        return category;
      });

      const result = await service.editStore(Creator, editStoreArgs);

      expect(storesRepository.save).toHaveBeenCalledTimes(1);
      expect(storesRepository.save).toHaveBeenCalledWith([
        {
          id: 1,
          ...editStoreArgs,
          category,
        },
      ]);

      expect(categories.getOrCreate).toHaveBeenCalledTimes(1);

      expect(result).toEqual({
        ok: true,
      });
    });

    it('should fail on exception', async () => {
      storesRepository.findOne.mockRejectedValue(new Error(':)'));

      const result = await service.editStore(Creator, editStoreArgs);

      expect(result).toEqual({
        ok: false,
        error: 'Could not edit store',
      });
    });
  });

  describe('deleteStore', () => {
    it('should fail if Store not found', async () => {
      storesRepository.findOne.mockResolvedValue(undefined);

      const result = await service.deleteStore(Creator, { storeId: 1 });

      expect(storesRepository.findOne).toHaveBeenCalledTimes(1);
      expect(storesRepository.delete).toHaveBeenCalledTimes(0);
      expect(result).toEqual({
        ok: false,
        error: 'Store not found',
      });
    });

    it('should fail if user is not Creator', async () => {
      storesRepository.findOne.mockResolvedValue({
        creatorId: 2,
      });

      const result = await service.deleteStore(Creator, { storeId: 1 });

      expect(storesRepository.findOne).toHaveBeenCalledTimes(1);
      expect(storesRepository.delete).toHaveBeenCalledTimes(0);
      expect(result).toEqual({
        ok: false,
        error: 'You can not delete a store that you do not own',
      });
    });

    it('should delete Store', async () => {
      storesRepository.findOne.mockResolvedValue({
        creatorId: 1,
      });

      storesRepository.delete.mockResolvedValue({
        id: 1,
      });

      const result = await service.deleteStore(Creator, { storeId: 1 });

      expect(storesRepository.findOne).toHaveBeenCalledTimes(1);
      expect(storesRepository.delete).toHaveBeenCalledTimes(1);
      expect(storesRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        ok: true,
      });
    });

    it('should fail on exception', async () => {
      storesRepository.findOne.mockRejectedValue(new Error(':)'));

      const result = await service.deleteStore(Creator, { storeId: 1 });

      expect(result).toEqual({
        ok: false,
        error: 'Could not delete store',
      });
    });
  });

  describe('allCategories', () => {
    it('should get all categories', async () => {
      jest.spyOn(categories, 'find').mockImplementation(async () => {
        return [category];
      });

      const result = await service.allCategories();

      expect(categories.find).toHaveBeenCalledTimes(1);

      expect(result).toEqual({
        ok: true,
        categories: [category],
      });
    });

    it('should fail on exception', async () => {
      jest.spyOn(categories, 'find').mockRejectedValue(new Error(':)'));

      const result = await service.allCategories();

      expect(result).toEqual({
        ok: false,
        error: 'Could not load categories',
      });
    });
  });

  describe('countStores', () => {
    it('should count Stores', async () => {
      storesRepository.count.mockResolvedValue(1);

      const result = await service.countStores(category);

      expect(storesRepository.count).toHaveBeenCalledTimes(1);
      expect(storesRepository.count).toHaveBeenCalledWith({
        where: {
          category: {
            id: category.id,
          },
        },
      });

      expect(result).toEqual(1);
    });
  });

  describe('findCategoryBySlug', () => {
    it('should fail if category not found', async () => {
      jest.spyOn(categories, 'findOne').mockImplementation(async () => {
        return undefined;
      });

      const result = await service.findCategoryBySlug({
        slug: 'slug',
        page: 1,
      });

      expect(categories.findOne).toHaveBeenCalledTimes(1);
      expect(categories.findOne).toHaveBeenCalledWith({
        where: {
          slug: 'slug',
        },
      });

      expect(result).toEqual({
        ok: false,
        error: 'Category not found',
      });
    });

    it('should find category by slug', async () => {
      jest.spyOn(categories, 'findOne').mockImplementation(async () => {
        return category;
      });
      storesRepository.find.mockResolvedValue([new Store()]);
      service.countStores = jest.fn().mockResolvedValue(1);

      const result = await service.findCategoryBySlug({
        slug: 'slug',
        page: 1,
      });

      expect(categories.findOne).toHaveBeenCalledTimes(1);
      expect(categories.findOne).toHaveBeenCalledWith({
        where: {
          slug: 'slug',
        },
      });

      expect(storesRepository.find).toHaveBeenCalledTimes(1);
      expect(storesRepository.find).toHaveBeenCalledWith({
        where: {
          category: {
            id: category.id,
          },
        },
        relations: ['category'],
        take: PAGE_ITEMS,
        skip: 0,
      });

      expect(service.countStores).toHaveBeenCalledTimes(1);

      expect(result).toEqual({
        ok: true,
        category,
        totalPages: 1,
        totalResults: 1,
        stores: [new Store()],
      });
    });

    it('should fail on exception', async () => {
      jest.spyOn(categories, 'findOne').mockRejectedValue(new Error(':)'));

      const result = await service.findCategoryBySlug({
        slug: 'slug',
        page: 1,
      });

      expect(result).toEqual({
        ok: false,
        error: 'Could not load category',
      });
    });
  });

  describe('allStores', () => {
    it('should find Stores', async () => {
      storesRepository.findAndCount.mockResolvedValue([[new Store()], 1]);

      const result = await service.allStores({ page: 1 });

      expect(storesRepository.findAndCount).toHaveBeenCalledTimes(1);
      expect(storesRepository.findAndCount).toHaveBeenCalledWith({
        relations: ['category'],
        take: PAGE_ITEMS,
        skip: 0,
      });
      expect(result).toEqual({
        ok: true,
        results: [new Store()],
        totalPages: 1,
        totalResults: 1,
      });
    });

    it('should fail on exception', async () => {
      storesRepository.findAndCount.mockRejectedValue(new Error(':)'));
      const result = await service.allStores({ page: 1 });

      expect(result).toEqual({
        ok: false,
        error: 'Could not load stores',
      });
    });
  });

  describe('findStoreById', () => {
    it('should fail if Store not found', async () => {
      storesRepository.findOne.mockResolvedValue(undefined);

      const result = await service.findStoreById({ storeId: 1 });

      expect(storesRepository.findOne).toHaveBeenCalledTimes(1);
      expect(storesRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['commissions', 'category'],
      });

      expect(result).toEqual({
        ok: false,
        error: 'Store not found',
      });
    });

    it('should find Store by id', async () => {
      storesRepository.findOne.mockResolvedValue(new Store());

      const result = await service.findStoreById({ storeId: 1 });

      expect(storesRepository.findOne).toHaveBeenCalledTimes(1);
      expect(storesRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['commissions', 'category'],
      });

      expect(result).toEqual({
        ok: true,
        store: new Store(),
      });
    });

    it('should fail on exception', async () => {
      storesRepository.findOne.mockRejectedValue(new Error(':)'));

      const result = await service.findStoreById({ storeId: 1 });

      expect(result).toEqual({
        ok: false,
        error: 'Could not load store',
      });
    });
  });

  describe('searchStoreByName', () => {
    it('should find Store by name', async () => {
      storesRepository.findAndCount.mockResolvedValue([[new Store()], 1]);

      const query = 'query';

      const result = await service.searchStoreByName({ query, page: 1 });

      expect(storesRepository.findAndCount).toHaveBeenCalledTimes(1);
      expect(storesRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          name: ILike(`%${query}%`),
        },
        relations: ['category'],
        take: PAGE_ITEMS,
        skip: 0,
      });

      expect(result).toEqual({
        ok: true,
        stores: [new Store()],
        totalResults: 1,
        totalPages: 1,
      });
    });

    it('should fail on exception', async () => {
      storesRepository.findAndCount.mockRejectedValue(new Error(':)'));

      const result = await service.searchStoreByName({
        query: '',
        page: 1,
      });

      expect(result).toEqual({
        ok: false,
        error: 'Could not search for stores',
      });
    });
  });

  describe('createCommission', () => {
    it('should fail if Store not found', async () => {
      storesRepository.findOne.mockResolvedValue(undefined);

      const result = await service.createCommission(
        Creator,
        createCommissionArgs,
      );

      expect(result).toEqual({
        ok: false,
        error: 'Store not found',
      });
    });

    it('should fail if user is not Creator', async () => {
      storesRepository.findOne.mockResolvedValue({
        creatorId: 2,
      });

      const result = await service.createCommission(
        Creator,
        createCommissionArgs,
      );

      expect(result).toEqual({
        ok: false,
        error:
          'You can not create a commission for a store that you do not own',
      });
    });

    it('should create Commission', async () => {
      storesRepository.findOne.mockResolvedValue({
        creatorId: 1,
      });
      commissionsRepository.create.mockReturnValue({
        id: 1,
      });

      commissionsRepository.save.mockResolvedValue({
        id: 1,
      });

      const result = await service.createCommission(
        Creator,
        createCommissionArgs,
      );

      expect(commissionsRepository.create).toHaveBeenCalledTimes(1);
      expect(commissionsRepository.create).toHaveBeenCalledWith({
        store: {
          creatorId: 1,
        },
        options: [],
        name: 'Commission',
        price: 1,
        description: 'Description',
        storeId: 1,
      });
      expect(commissionsRepository.save).toHaveBeenCalledTimes(1);
      expect(commissionsRepository.save).toHaveBeenCalledWith({
        id: 1,
      });
      expect(result).toEqual({
        ok: true,
      });
    });

    it('should fail on exception', async () => {
      storesRepository.findOne.mockRejectedValue(new Error(':)'));

      const result = await service.createCommission(
        Creator,
        createCommissionArgs,
      );

      expect(result).toEqual({
        ok: false,
        error: 'Could not create commission',
      });
    });
  });

  describe('editCommission', () => {
    it('should fail if Commission not found', async () => {
      commissionsRepository.findOne.mockResolvedValue(undefined);

      const result = await service.editCommission(Creator, editCommissionArgs);

      expect(result).toEqual({
        ok: false,
        error: 'Commission not found',
      });
    });

    it('should fail if user is not Creator', async () => {
      commissionsRepository.findOne.mockResolvedValue({
        store: {
          creatorId: 2,
        },
      });

      const result = await service.editCommission(Creator, editCommissionArgs);

      expect(result).toEqual({
        ok: false,
        error: 'You can not edit a commission for a store that you do not own',
      });
    });

    it('should edit Commission', async () => {
      commissionsRepository.findOne.mockResolvedValue({
        store: {
          creatorId: 1,
        },
      });
      commissionsRepository.save.mockResolvedValue({
        id: 1,
      });

      const result = await service.editCommission(Creator, editCommissionArgs);

      expect(commissionsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(commissionsRepository.save).toHaveBeenCalledTimes(1);
      expect(commissionsRepository.save).toHaveBeenCalledWith([
        {
          id: 1,
          ...editCommissionArgs,
        },
      ]);
      expect(result).toEqual({
        ok: true,
      });
    });

    it('should fail on exception', async () => {
      commissionsRepository.findOne.mockRejectedValue(new Error(':)'));

      const result = await service.editCommission(Creator, editCommissionArgs);

      expect(result).toEqual({
        ok: false,
        error: 'Could not edit commission',
      });
    });
  });

  describe('deleteCommission', () => {
    it('should fail if Commission not found', async () => {
      commissionsRepository.findOne.mockResolvedValue(undefined);

      const result = await service.deleteCommission(Creator, {
        commissionId: 1,
      });

      expect(result).toEqual({
        ok: false,
        error: 'Commission not found',
      });
    });

    it('should fail if user is not Creator', async () => {
      commissionsRepository.findOne.mockResolvedValue({
        store: {
          creatorId: 2,
        },
      });

      const result = await service.deleteCommission(Creator, {
        commissionId: 1,
      });

      expect(result).toEqual({
        ok: false,
        error:
          'You can not delete a commission for a store that you do not own',
      });
    });

    it('should delete Commission', async () => {
      commissionsRepository.findOne.mockResolvedValue({
        store: {
          creatorId: 1,
        },
      });
      commissionsRepository.delete.mockResolvedValue({
        id: 1,
      });

      const result = await service.deleteCommission(Creator, {
        commissionId: 1,
      });

      expect(commissionsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(commissionsRepository.delete).toHaveBeenCalledTimes(1);
      expect(commissionsRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        ok: true,
      });
    });

    it('should fail on exception', async () => {
      commissionsRepository.findOne.mockRejectedValue(new Error(':)'));

      const result = await service.deleteCommission(Creator, {
        commissionId: 1,
      });

      expect(result).toEqual({
        ok: false,
        error: 'Could not delete commission',
      });
    });
  });
});
