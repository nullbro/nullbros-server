import to from 'await-to-js';
import { getConnection } from 'typeorm';
import { Category } from '../../db/entity/Category';
import { gql, IResolvers } from 'apollo-server-express';

export const resolvers: IResolvers = {
	Query: {
		getCategories: async () => {
			const [err, res] = await to(getConnection().manager.find(Category));
			if (err) throw err;
			return res;
		},
	},
	Mutation: {
		createCategory: async (parent, { category }, ctx) => {
			if (!ctx.user) throw new Error('로그인 되지않았습니다.');
			if (!(ctx.user.userType === 'ADMIN')) throw new Error('권한이 없습니다.');

			const [err, res] = await to(getConnection().manager.save(Category, { category }));
			if (err) throw err;

			return res;
		},
	},
};

export const typeDefs = gql`
	type Category {
		id: String
		category: String
	}

	extend type Query {
		getCategories: [Category]
	}

	extend type Mutation {
		createCategory(category: String!): Category
	}
`;
