import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CreateStoreInput, CreateStoreOutput } from './dtos/create-store.dto';
import { Store } from './entities/store.entity';
import { StoresService } from './stores.service';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/auth/role.decorator';
import { EditStoreInput, EditStoreOutput } from './dtos/edit-store.dto';
import { DeleteStoreInput, DeleteStoreOutput } from './dtos/delete-store.dto';
import { Category } from './entities/category.entity';
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
import { MyStoresOutput } from './dtos/myStores.dto';
import { MyStoreInput, MyStoreOutput } from './dtos/myStore.dto';
import {
  GetCommissionInput,
  GetCommissionOutput,
} from './dtos/get-commission.dto';

@Resolver((of) => Store)
export class StoresResolver {
  constructor(private readonly storesService: StoresService) {}

  @Mutation((returns) => CreateStoreOutput)
  @Role(['Creator'])
  createStore(
    @AuthUser() authUser: User,
    @Args('input') createStoreInput: CreateStoreInput,
  ): Promise<CreateStoreOutput> {
    return this.storesService.createStore(authUser, createStoreInput);
  }

  @Query((returns) => MyStoreOutput)
  @Role(['Creator'])
  myStore(
    @AuthUser() creator: User,
    @Args('input') myStoreInput: MyStoreInput,
  ): Promise<MyStoreOutput> {
    return this.storesService.myStore(creator, myStoreInput);
  }

  @Query((returns) => MyStoresOutput)
  @Role(['Creator'])
  myStores(@AuthUser() authUser: User): Promise<MyStoresOutput> {
    return this.storesService.myStores(authUser);
  }

  @Mutation((returns) => EditStoreOutput)
  @Role(['Creator'])
  editStore(
    @AuthUser() authUser: User,
    @Args('input') editStoreInput: EditStoreInput,
  ): Promise<EditStoreOutput> {
    return this.storesService.editStore(authUser, editStoreInput);
  }

  @Mutation((returns) => DeleteStoreOutput)
  @Role(['Creator'])
  deleteStore(
    @AuthUser() authUser: User,
    @Args('input') deleteStoreInput: DeleteStoreInput,
  ): Promise<DeleteStoreOutput> {
    return this.storesService.deleteStore(authUser, deleteStoreInput);
  }
}

@Resolver((of) => Category)
export class CategoryResolver {
  constructor(private readonly storesService: StoresService) {}

  @ResolveField((type) => Int)
  storeCount(@Parent() category: Category): Promise<number> {
    return this.storesService.countStores(category);
  }

  @Query((returns) => AllCategoriesOutput)
  allCategories(): Promise<AllCategoriesOutput> {
    return this.storesService.allCategories();
  }

  @Query((returns) => CategoryOutput)
  category(
    @Args('input') categoryInput: CategoryInput,
  ): Promise<CategoryOutput> {
    return this.storesService.findCategoryBySlug(categoryInput);
  }

  @Query((returns) => StoresOutput)
  stores(@Args('input') storesInput: StoresInput): Promise<StoresOutput> {
    return this.storesService.allStores(storesInput);
  }

  @Query((returns) => StoreOutput)
  store(@Args('input') storeInput: StoreInput): Promise<StoreOutput> {
    return this.storesService.findStoreById(storeInput);
  }

  @Query((returns) => SearchStoreOutput)
  searchStore(
    @Args('input') searchStoreInput: SearchStoreInput,
  ): Promise<SearchStoreOutput> {
    return this.storesService.searchStoreByName(searchStoreInput);
  }
}

@Resolver(Commission)
export class CommissionResolver {
  constructor(private readonly storesService: StoresService) {}

  @Mutation((returns) => CreateCommissionOutput)
  @Role(['Creator'])
  createCommission(
    @AuthUser() authUser: User,
    @Args('input') createCommissionInput: CreateCommissionInput,
  ): Promise<CreateCommissionOutput> {
    return this.storesService.createCommission(authUser, createCommissionInput);
  }

  @Mutation((returns) => DeleteCommissionOutput)
  @Role(['Creator'])
  deleteCommission(
    @AuthUser() authUser: User,
    @Args('input') deleteCommissionInput: DeleteCommissionInput,
  ): Promise<DeleteCommissionOutput> {
    return this.storesService.deleteCommission(authUser, deleteCommissionInput);
  }

  @Mutation((returns) => EditCommissionOutput)
  @Role(['Creator'])
  editCommission(
    @AuthUser() authUser: User,
    @Args('input') editcommissionInput: EditCommissionInput,
  ): Promise<EditCommissionOutput> {
    return this.storesService.editCommission(authUser, editcommissionInput);
  }

  @Query((returns) => GetCommissionOutput)
  @Role(['Any'])
  getCommission(
    @Args('input') getCommissionInput: GetCommissionInput,
  ): Promise<GetCommissionOutput> {
    return this.storesService.getCommissionsById(getCommissionInput);
  }
}
