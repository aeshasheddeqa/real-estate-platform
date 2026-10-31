import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { validate, validateQuery } from '../middleware/validate';
import { createPropertySchema, updatePropertySchema, searchSchema, mineSchema } from '../schemas/property.schema';
import * as c from '../controllers/property.controller';

const router = Router();

router.get('/', validateQuery(searchSchema), c.search);
router.get('/mine', requireAuth, validateQuery(mineSchema), c.mine);router.get('/:id', c.getOne);
router.get('/:id/similar', c.similar);
router.post('/', requireAuth, upload.array('images', 5), validate(createPropertySchema), c.create);
router.put('/:id', requireAuth, upload.array('images', 5), validate(updatePropertySchema), c.update);
router.delete('/:id', requireAuth, c.remove);

export default router;
