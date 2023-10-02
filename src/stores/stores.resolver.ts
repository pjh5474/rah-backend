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
