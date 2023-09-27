import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateStoreInput, CreateStoreOutput } from './dtos/create-store.dto';
import { Store } from './entities/store.entity';
import { StoresService } from './stores.service';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/auth/role.decorator';
import { EditStoreInput, EditStoreOutput } from './dtos/edit-store.dto';
import { DeleteStoreInput, DeleteStoreOutput } from './dtos/delete-store.dto';

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
