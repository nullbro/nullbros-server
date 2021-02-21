import { makeExecutableSchema } from 'apollo-server-express';
import * as Category from './Category';
import * as User from './User';
import * as Post from './Post';

export default makeExecutableSchema({
	typeDefs: [Category.typeDefs, User.typeDefs, Post.typeDefs],
	resolvers: [Category.resolvers, User.resolvers, Post.resolvers],
});
