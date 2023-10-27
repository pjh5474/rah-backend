import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsArray, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Commission } from 'src/stores/entities/commission.entity';
import { Column, Entity, OneToOne, RelationId } from 'typeorm';

@InputType('PostInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Post extends CoreEntity {
  @Field((type) => String)
  @Column()
  @IsString()
  title: string;

  @Field((type) => String)
  @Column()
  @IsString()
  content: string;

  @Field((type) => [String], { nullable: true })
  @Column('text', { array: true, nullable: true, default: [] })
  @IsArray()
  images?: string[];

  @OneToOne((type) => Commission, (commission) => commission.post, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @Field((type) => Commission)
  commission: Commission;

  @RelationId((post: Post) => post.commission)
  commissionId: number;
}
