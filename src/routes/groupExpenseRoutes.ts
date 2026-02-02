import { Router } from 'express';
import { GroupExpenseController } from '../controllers/GroupExpenseController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const groupExpenseController = new GroupExpenseController();


router.use(authMiddleware);

router.post('/', groupExpenseController.createGroupExpense);
router.get('/group/:groupId', groupExpenseController.getGroupExpenses);


router.patch('/settle/:splitId', groupExpenseController.settleSplit);
router.get('/balances/who-owes-me', groupExpenseController.getMyReceivables);
router.get('/balances/whom-i-owe', groupExpenseController.getMyDebts);

export default router;
