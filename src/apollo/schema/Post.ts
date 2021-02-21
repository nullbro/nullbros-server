import { gql, IResolvers } from 'apollo-server-express';
import to from 'await-to-js';
import { FindConditions, getConnection } from 'typeorm';
import { Category } from '../../db/entity/Category';
import { Post } from '../../db/entity/Post';

export const resolvers: IResolvers = {
	Query: {
		getPost: async (_, { title }) => {
			const [err, post] = await to(
				getConnection().manager.findOne(Post, {
					relations: ['tags'],
					where: { title, isPrivate: false },
				}),
			);
			if (err) throw err;

			return post;
		},
		getPosts: async (_, { category, isPrivate = false, offset = 0, limit = 12 }, ctx) => {
			if (isPrivate && !(ctx.user.userType === 'ADMIN')) throw new Error('권한이 없습니다.');

			const where: FindConditions<Post> = {};

			if (isPrivate === false) {
				where.isPrivate = isPrivate;
			}

			const [findCategoryErr, _category] = await to(
				getConnection().manager.findOne(Category, { where: { category } }),
			);
			if (findCategoryErr) throw findCategoryErr;
			if (_category) {
				where.category = _category;
			}

			const [err, posts] = await to(
				getConnection().manager.find(Post, {
					relations: ['category', 'tags'],
					where,
					skip: offset,
					take: limit,
					order: { createdAt: 'DESC' },
				}),
			);
			if (err) throw err;

			return posts;
		},
	},
	Mutation: {
		createPost: async (_, payload, ctx) => {
			if (!ctx.user) throw new Error('로그인 되지않았습니다.');
			if (!(ctx.user.userType === 'ADMIN')) throw new Error('권한이 없습니다.');
			const post = payload;

			const [findCategoryErr, category] = await to(
				getConnection().manager.findOne(Category, {
					where: { category: payload.category },
				}),
			);
			if (findCategoryErr) throw findCategoryErr;
			post.category = category;

			const entity: Post = Object.assign(new Post(), post);
			const [savePostErr, newPost] = await to(getConnection().manager.save(Post, entity));
			if (savePostErr) throw savePostErr;

			await newPost.syncTag(payload.tags);

			return newPost;
		},
		deletePost: async (_, { id }, ctx) => {
			if (!ctx.user) throw new Error('로그인 되지않았습니다.');
			if (!(ctx.user.userType === 'ADMIN')) throw new Error('권한이 없습니다.');

			const [deleteError] = await to(getConnection().manager.delete(Post, id));
			if (deleteError) throw deleteError;
			return true;
		},
		updatePost: async (_, payload, ctx) => {
			if (!ctx.user) throw new Error('로그인 되지않았습니다.');
			if (!(ctx.user.userType === 'ADMIN')) throw new Error('권한이 없습니다.');

			const post = payload;

			if (payload.category) {
				const [findCategoryErr, category] = await to(
					getConnection().manager.findOne(Category, {
						where: { category: payload.category },
					}),
				);
				if (findCategoryErr) throw findCategoryErr;
				post.category = category;
			}

			const entity: Post = Object.assign(new Post(), post);
			const [updatePostErr, updatePost] = await to(getConnection().manager.save(Post, entity));

			if (updatePostErr) throw updatePostErr;

			await updatePost.syncTag(payload.tags);

			return true;
		},
	},
	Post: {
		category: async (post: Post) => {
			return post.category.category;
		},
		tags: async (post: Post) => {
			return post.tags ? post.tags : [];
		},
	},
};

export const typeDefs = gql`
	type Post {
		id: String
		title: String
		content: String
		description: String
		thumbnail: String
		isPrivate: Boolean
		tags: [Tag]
		category: String
		createdAt: String
	}

	type Tag {
		id: String
		color: String
		tag: String
	}

	type Query {
		getPost(title: String!): Post
		getPosts(category: String, isPrivate: Boolean, offset: Int, limit: Int): [Post]
	}

	type Mutation {
		createPost(
			title: String!
			content: String!
			category: String!
			isPrivate: Boolean
			tags: [String]
		): Post
		updatePost(
			id: String!
			title: String
			content: String
			category: String
			isPrivate: Boolean
			tags: [String]
		): Boolean
		deletePost(id: String!): String
	}
`;
