import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './Post';

@Entity('category')
export class Category {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ length: 15, unique: true, nullable: false })
	category: string;

	@OneToMany(() => Post, (post) => post.category)
	posts: Post[];
}
