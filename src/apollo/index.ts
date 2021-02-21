import { ApolloServer } from 'apollo-server-express';
import jsonwebtoken from 'jsonwebtoken';

import schema from './schema';

/* apollo-server configuration */
export const apollo = new ApolloServer({
	schema,
	context: ({ req, res }) => {
		let token, user;

		token =
			req.headers['nullbros-api-key'] === 'undefined' ? undefined : req.headers['nullbros-api-key'];

		if (!token && req.cookies.token) {
			token = req.cookies.token;
		}

		if (token) {
			user = jsonwebtoken.verify(token, process.env.JWT_ENCRYPTION) as TokenResult;
		}
		return { user, res };
	},
});
