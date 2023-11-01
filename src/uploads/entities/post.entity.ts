import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Commission } from 'src/stores/entities/commission.entity';
import { Column, Entity, JoinColumn, OneToOne, RelationId } from 'typeorm';

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

  @OneToOne((type) => Commission, (commission) => commission.post, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  @Field((type) => Commission)
  commission: Commission;

  @RelationId((post: Post) => post.commission)
  commissionId: number;
}
