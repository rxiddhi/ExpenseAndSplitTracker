import { Router } from 'express';
import { ExpenseController } from '../controllers/ExpenseController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const expenseController = new ExpenseController();


router.use(authMiddleware);

router.post('/', expenseController.createExpense);
router.get('/', expenseController.getExpenses);
router.get('/summary', expenseController.getMonthlySummary);
router.get('/:id', expenseController.getExpenseById);
router.put('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

export default router;
