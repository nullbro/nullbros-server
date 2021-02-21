import { Connection, ConnectionManager, createConnection, getConnectionManager } from 'typeorm';
import entities from './entity';

export const mysql = import('mysql2').then((module) => module);

export class Database {
	connectionManager: ConnectionManager;

	constructor() {
		this.connectionManager = getConnectionManager();
	}
	async connect() {
		return createConnection({
			type: 'mysql',
			host: process.env.DB_HOST,
			database: process.env.DB_NAME,
			username: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			port: +process.env.DB_PORT,
			entities,
			// migrations: [__dirname + '/migration/*.ts'],
			synchronize: false,
		});
	}

	async getConnection(): Promise<Connection> {
		const CONNECTION_NAME = `default`;
		if (this.connectionManager.has(CONNECTION_NAME)) {
			const connection = this.connectionManager.get(CONNECTION_NAME);
			try {
				if (connection.isConnected) {
					await connection.close();
				}
			} catch (e) {
				console.log(e);
			}
			return connection.connect();
		}

		return this.connect();
	}
}
