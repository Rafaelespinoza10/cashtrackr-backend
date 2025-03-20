import { BudgetController } from './../controller/BudgetController';
import { Router } from "express";
import { ValidationService } from "../services/ValidationService";
import { BudgetService } from '../services/BudgetService';
import { ExpenseController } from '../controller/ExpenseController';
import { ExpenseService } from '../services/ExpenseService';
import { ConfigurationRateLimit } from '../utils/ConfigurationRateLimit';
import { Authorization } from '../middleware/Authorization';



const router  = Router();


const validationService = new ValidationService();
const budgetService = new BudgetService();
const budgetController = new BudgetController(validationService, budgetService);
const expenseSerivice = new ExpenseService();
const expenseController = new ExpenseController(validationService,expenseSerivice);
const authorization = new Authorization();

router.use(authorization.userAuthorization);  //protegemos a todos las rutas para que solo se puedan usar con usuarios autenticados

router.get('/budget/all', budgetController.getAll);
router.post('/budget/create-budget', budgetController.createBudget);
router.get('/budget/:id', budgetController.getBudgetById);
router.put('/budget/updated-budget/:id', budgetController.editBudgetById);
router.delete('/budget/delete/:id', budgetController.deleteBudgetById);


router.get('/budget/:budgetId/expenses/all', expenseController.getExpenseByBudgetId );
router.post('/budget/:budgetId/expense/create-expense', expenseController.createExpense);
router.get('/budget/:budgetId/expense/:expenseId', expenseController.getExpenseByIdAndBudgetId);
router.put('/budget/:budgetId/expenses/updated-expense/:expenseId', expenseController.updateExpenseById);
router.delete('/budget/:budgetId/expense/delete/:expenseId', expenseController.deleteExpenseById);


export default router;