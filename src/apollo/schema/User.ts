import { gql, IResolvers } from 'apollo-server-express';
import to from 'await-to-js';
import { getConnection } from 'typeorm';
import { User } from '../../db/entity/User';

export const resolvers: IResolvers = {
	Query: {
		getUser: async (parent, _, ctx) => {
			if (!ctx.user) throw new Error('로그인되지 않은 사용자 입니다.');

			const [err, user] = await to(
				getConnection().manager.findOne(User, { where: { id: ctx.user.id } }),
			);
			if (err) throw err;

			return user;
		},
	},
	Mutation: {
		createUser: async (parent, payload) => {
			const entity: User = Object.assign(new User(), payload);
			const [err, user] = await to(getConnection().manager.save(User, entity));
			if (err) throw err;

			return user;
		},
		loginUser: async (parent, payload, ctx) => {
			const [findUserErr, user] = await to(
				getConnection().manager.findOne(User, {
					where: { email: payload.email },
				}),
			);
			if (findUserErr) throw findUserErr;
			if (!user) throw new Error('유저 정보가 없습니다.');

			const [validPasswordErr, validPassword] = await to(user.comparePassword(payload.password));
			if (validPasswordErr) throw validPasswordErr;
			if (!validPassword) throw new Error('비밀번호가 틀렸습니다.');

			ctx.res.cookie('token', user.getJwt(), {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				maxAge: process.env.JWT_EXPIRATION,
				// sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
			});

			return user;
		},
		logoutUser: async (parent, _, ctx) => {
			if (!ctx.user) throw new Error('로그인되지 않은 사용자입니다.');
			ctx.res.clearCookie('token', { path: '/' });
			return true;
		},
	},

	User: {
		jwt: (user: User) => user.getJwt(),
	},
};

export const typeDefs = gql`
	type User {
		id: String
		email: String
		userType: String
		jwt: String
	}

	extend type Query {
		getUser: User
	}

	extend type Mutation {
		createUser(email: String!, password: String!, userType: String): User
		loginUser(email: String!, password: String!): User
		logoutUser: Boolean
	}
`;
