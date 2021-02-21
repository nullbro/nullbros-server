import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm';
import to from 'await-to-js';
import bcrypt from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';

@Entity('user')
export class User {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ unique: true, length: 40, nullable: false })
	email: string;

	@Column()
	password: string;

	@Column({ type: 'enum', enum: ['ADMIN', 'GUEST'], default: 'GUEST' })
	userType: 'ADMIN' | 'GUEST' = 'GUEST';

	jwt: string;

	@BeforeInsert()
	async hashPassword() {
		const [genSaltError, salt] = await to(bcrypt.genSalt(10));
		if (genSaltError) throw genSaltError;
		const [hashError, hash] = await to(bcrypt.hash(this.password, salt));
		if (hashError) throw hashError;
		this.password = hash;
	}

	async comparePassword(password: string) {
		const [err, res] = await to(bcrypt.compare(password, this.password));
		if (err) throw err;
		return res;
	}

	getJwt() {
		const token = jsonwebtoken.sign(
			{ id: this.id, email: this.email, userType: this.userType },
			process.env.JWT_ENCRYPTION,
			{
				expiresIn: +process.env.JWT_EXPIRATION,
			},
		);
		return token;
	}
}
