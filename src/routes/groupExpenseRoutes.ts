import { Router } from 'express';
import { GroupExpenseController } from '../controllers/GroupExpenseController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const groupExpenseController = new GroupExpenseController();

// Protect all routes
router.use(authMiddleware);

router.post('/', groupExpenseController.createGroupExpense);
router.get('/group/:groupId', groupExpenseController.getGroupExpenses);

// Settlement & Summaries
router.patch('/settle/:splitId', groupExpenseController.settleSplit);
router.get('/balances/who-owes-me', groupExpenseController.getMyReceivables);
router.get('/balances/whom-i-owe', groupExpenseController.getMyDebts);

export default router;
