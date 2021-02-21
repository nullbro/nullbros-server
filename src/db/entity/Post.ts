import to from 'await-to-js';
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	getConnection,
	BeforeUpdate,
	BeforeInsert,
} from 'typeorm';
import { Category } from './Category';
import { Tag } from './Tag';

@Entity('post')
export class Post {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ length: 30, nullable: false, unique: true })
	title: string;

	@Column({ type: 'text' })
	content: string;

	@Column({ length: 120 })
	description: string;

	@Column({ length: 200 })
	thumbnail: string;

	@Column({ default: false })
	isPrivate: boolean;

	@CreateDateColumn()
	createdAt: string;

	@UpdateDateColumn()
	updatedAt: string;

	@ManyToMany(() => Tag, (tag) => tag.posts)
	@JoinTable()
	tags: Tag[];

	@ManyToOne(() => Category, (category) => category.posts)
	category: Category;

	@BeforeUpdate()
	@BeforeInsert()
	syncContent() {
		if (!this.content) return;
		const findThumbnail = this.content.match(/<img.*?src="(.*?)"[^\\>]+>/);
		this.thumbnail = findThumbnail ? findThumbnail[1] : '/api/image/placeholder.png';
		this.description = this.content
			.replace(/(<img.*>)|#{1,4}|\*|(```[a-z]*\n[\s\S]*?\n```)/g, '')
			.substr(0, 120);
	}

	async syncTag(tags?: string[]) {
		if (!tags) return;
		const promise = tags.map(async (tag: string) => {
			const findTag = await getConnection().manager.findOne(Tag, { where: { tag } });
			if (findTag) return findTag;
			const newTag = new Tag();
			newTag.tag = tag;
			newTag.color = '#000000';
			return await getConnection().manager.save(Tag, newTag);
		});
		const [saveTagsErr, _tags] = await to(Promise.all(promise));

		if (saveTagsErr) throw saveTagsErr;
		this.tags = _tags;
		await getConnection().manager.save(Post, this);
	}
}
