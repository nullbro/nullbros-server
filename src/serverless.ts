import to from 'await-to-js';
import serverlessHttp from 'serverless-http';
import app from './app';
import { Database } from './db';

const serverless = serverlessHttp(app);

export const handler = async (event, context) => {
	context.callbackWaitsForEmptyEventLoop = true;
	const database = new Database();
	const [error, connection] = await to(database.getConnection());
	if (error) throw error;
	const response = await serverless(event, context);

	try {
		await Promise.all([connection.close()]);
	} catch (e) {
		console.log(e);
	}

	return response;
};
