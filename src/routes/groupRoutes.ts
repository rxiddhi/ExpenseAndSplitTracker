import { Router } from 'express';
import { GroupController } from '../controllers/GroupController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const groupController = new GroupController();


router.use(authMiddleware);

router.post('/', groupController.createGroup);
router.get('/', groupController.getGroups);
router.get('/:id', groupController.getGroupById);
router.delete('/:id', groupController.deleteGroup);


router.post('/:id/members', groupController.addMember);
router.delete('/:id/members/:userId', groupController.removeMember);

export default router;
