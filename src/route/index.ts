import { Router } from 'express';
import { authorize, uploader } from '../middleware';

const router = Router();

/**
 * @method POST /api/image
 */
router.post('/image', authorize, uploader.single('image'), (req, res) => {
	const filePath = (req.file as Express.MulterS3.File).location;

	return res.status(200).json(filePath.replace('s://s3.ap-northeast-2.amazonaws.com/', '://'));
});

export default router;
