import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { Commission } from 'src/stores/entities/commission.entity';
import { User } from 'src/users/entities/user.entity';
import { CreatePostInput, CreatePostOutput } from './dtos/create-post.dto';
import { DeletePostInput, DeletePostOutput } from './dtos/delete-post.dto';
import { GetPostInput, GetPostOutput } from './dtos/get-post.dto';
import { EditPostInput, EditPostOutput } from './dtos/edit-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly posts: Repository<Post>,

    @InjectRepository(Commission)
    private readonly commissions: Repository<Commission>,
  ) {}

  async createPost(
    creator: User,
    { title, content, images, commissionId }: CreatePostInput,
  ): Promise<CreatePostOutput> {
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
      } else if (commission.store.creatorId !== creator.id) {
        return {
          ok: false,
          error: 'You are not authorized',
        };
      }

      const newPost = this.posts.create({
        title,
        content,
        images,
        commission,
      });

      await this.posts.save(newPost);

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create post',
      };
    }
  }

  async getPost({ id: postId }: GetPostInput): Promise<GetPostOutput> {
    try {
      const post = await this.posts.findOne({
        where: {
          id: postId,
        },
      });

      if (!post) {
        return {
          ok: false,
          error: 'Post not found',
        };
      }

      return {
        ok: true,
        post,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not get post',
      };
    }
  }

  async editPost(
    creator: User,
    editPostInput: EditPostInput,
  ): Promise<EditPostOutput> {
    try {
      const post = await this.posts.findOne({
        where: {
          id: editPostInput.postId,
        },
      });

      if (!post) {
        return {
          ok: false,
          error: 'Post not found',
        };
      }

      const commission = await this.commissions.findOne({
        where: {
          id: post.commissionId,
        },
        relations: ['store'],
      });

      if (!commission) {
        return {
          ok: false,
          error: 'Commission not found',
        };
      } else if (commission.store.creatorId !== creator.id) {
        return {
          ok: false,
          error: 'You are not authorized',
        };
      }

      await this.posts.save([
        {
          id: editPostInput.postId,
          ...editPostInput,
        },
      ]);

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not edit post',
      };
    }
  }

  async deletePost(
    creator: User,
    { postId }: DeletePostInput,
  ): Promise<DeletePostOutput> {
    try {
      const post = await this.posts.findOne({
        where: {
          id: postId,
        },
      });

      if (!post) {
        return {
          ok: false,
          error: 'Post not found',
        };
      }

      const commission = await this.commissions.findOne({
        where: {
          id: post.commissionId,
        },
        relations: ['store'],
      });

      if (!commission) {
        return {
          ok: false,
          error: 'Commission not found',
        };
      } else if (commission.store.creatorId !== creator.id) {
        return {
          ok: false,
          error: 'You are not authorized',
        };
      }

      commission.post = null;
      await this.commissions.save(commission);
      await this.posts.delete(postId);

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not delete post',
      };
    }
  }
}
