import multer from 'multer';
import multerS3 from 'multer-s3';
import awsSDK from 'aws-sdk';
import path from 'path';
import jsonwebtoken from 'jsonwebtoken';

export const s3 = new awsSDK.S3({
	region: 'ap-northeast-2',
	credentials: {
		accessKeyId: process.env.ACCESS_KEY_ID,
		secretAccessKey: process.env.SECRET_ACCESS_KEY,
	},
});

export const uploader = multer({
	storage: multerS3({
		s3,
		bucket: 'static.nullbros.com',
		key: (req, file, cb) => {
			cb(null, `${+new Date()}${path.basename(file.originalname)}`);
		},
	}),
	limits: { fileSize: 1024 * 1024 * 4 },
});

export const authorize = (req, res, next) => {
	let token, tokenResult;

	token =
		req.headers['nullbros-api-key'] === 'undefined' ? undefined : req.headers['nullbros-api-key'];
	if (!token && req.cookies.token) {
		token = req.cookies.token;
	}

	if (token) {
		tokenResult = jsonwebtoken.verify(token, process.env.JWT_ENCRYPTION) as TokenResult;

		if (tokenResult.userType === 'ADMIN') {
			return next();
		}
	}

	throw res.status(401).json({ message: '권한이 없습니다.' });
};
