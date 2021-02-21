import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Post } from './Post';

@Entity('tag')
export class Tag {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ length: 10 })
	tag: string;

	@Column()
	color: string;

	@ManyToMany(() => Post, (post) => post.tags)
	posts: Post[];
}
