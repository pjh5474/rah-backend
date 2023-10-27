import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Post } from './entities/post.entity';
import { PostsService } from './posts.service';
import { CreatePostInput, CreatePostOutput } from './dtos/create-post.dto';
import { Role } from 'src/auth/role.decorator';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { DeletePostInput, DeletePostOutput } from './dtos/delete-post.dto';
import { GetPostInput, GetPostOutput } from './dtos/get-post.dto';
import { EditPostInput, EditPostOutput } from './dtos/edit-post.dto';

@Resolver((of) => Post)
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @Mutation((returns) => CreatePostOutput)
  @Role(['Creator'])
  createPost(
    @AuthUser() authUser: User,
    @Args('input') createPostInput: CreatePostInput,
  ): Promise<CreatePostOutput> {
    return this.postsService.createPost(authUser, createPostInput);
  }

  @Query((returns) => GetPostOutput)
  @Role(['Any'])
  getPost(@Args('input') getPostInput: GetPostInput): Promise<GetPostOutput> {
    return this.postsService.getPost(getPostInput);
  }

  @Mutation((returns) => EditPostOutput)
  @Role(['Creator'])
  editPost(
    @AuthUser() authUser: User,
    @Args('input') editPostInput: EditPostInput,
  ): Promise<EditPostOutput> {
    return this.postsService.editPost(authUser, editPostInput);
  }

  @Mutation((returns) => DeletePostOutput)
  @Role(['Creator'])
  deletePost(
    @AuthUser() authUser: User,
    @Args('input') postId: DeletePostInput,
  ): Promise<DeletePostOutput> {
    return this.postsService.deletePost(authUser, postId);
  }
}
