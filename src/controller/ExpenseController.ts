import type  { Request, Response } from 'express';
import { CreateBudget } from '../interfaces/create-budget.interface';
import { ValidationService } from '../services/ValidationService';
import { BudgetService } from '../services/BudgetService';
import { UpdateBudget } from '../interfaces/update-budgate.interface';
import { ExpenseService } from '../services/ExpenseService';
import { Expense } from '../interfaces/create-expense.interface';
import { UpdateExpense } from '../interfaces/update-expense.interface';

export class ExpenseController {
    private readonly _validationService: ValidationService;
    private readonly _expenseService: ExpenseService;

    constructor(validationService: ValidationService, expenseService: ExpenseService ){
        this._validationService = validationService;
        this._expenseService = expenseService;
        
        this.createExpense = this.createExpense.bind(this);
        this.getExpenseByBudgetId = this.getExpenseByBudgetId.bind(this);
        this.getExpenseByIdAndBudgetId = this.getExpenseByIdAndBudgetId.bind(this);
        this.updateExpenseById = this.updateExpenseById.bind(this);
        this.deleteExpenseById = this.deleteExpenseById.bind(this);
    }

    public async getExpenseByIdAndBudgetId(request: Request, response: Response): Promise<any> {
        try {
          const { budgetId, expenseId } = request.params;
      
          if (!budgetId || isNaN(Number(budgetId)) || !expenseId || isNaN(Number(expenseId))) {
            return response.status(400).json({ error: 'Los parámetros budgetId e id son obligatorios y deben ser números válidos.' });
        }
        const expense = await this._expenseService.obtainExpenseByIdAndBudgetId(Number(budgetId), Number(expenseId));
          return response.status(200).json({  expense });
        } catch (error: any) {
          if (error.message.includes('No se encontro')) {
            return response.status(404).json({ error: error.message });
          }
          return response.status(500).json({ error: error.message });
        }
      }
      

    public  async createExpense(request: Request, response:Response): Promise<any>{

        try{
            const { budgetId } = request.params;
            const expense = request.body as Expense;
            if (!budgetId || isNaN(Number(budgetId))) {
                return response.status(400).json({ error: 'El parámetro id es obligatorio y debe ser un número válido.' });
            }

            await this._validationService.validateField(expense.name);
            await this._validationService.validateAmount(expense.amount);
            
            const newExpense = await this._expenseService.createExpense(Number(budgetId), expense);
            response.status(200).json({ expense: newExpense, message: 'El gasto se ha creado exitosamente'});
        }catch(ex: any){    
            response.status(500).json({ error: ex.message });
        }
    }

    public async getExpenseByBudgetId(request: Request, response:Response): Promise<any>{
        try {
            const { budgetId } = request.params;
            if (!budgetId || isNaN(Number(budgetId))) {
                return response.status(400).json({ error: 'El parámetro id es obligatorio y debe ser un número válido.' });
            }
            const expensesByBudgetId = await this._expenseService.obtainExpensesByBudgetId(Number(budgetId));

            response.status(200).json({ expenses: expensesByBudgetId});

        } catch (error : any) {
            if (error.message.includes('No se encontraron')) {
                return response.status(404).json({ message: error.message });
              }
              response.status(500).json({ message: error.message });
        }

    }

    public async updateExpenseById(request: Request, response: Response): Promise<any>{
        try{
            const { budgetId, expenseId } = request.params;
            const expenseUpdated = request.body as UpdateExpense;
            console.log(expenseUpdated);
            if (!budgetId || isNaN(Number(budgetId)) || !expenseId || isNaN(Number(expenseId))) {
                return response.status(400).json({ error: 'Los parámetros budgetId e id son obligatorios y deben ser números válidos.' });
            }
            await this._validationService.validateField(expenseUpdated.name);
            await this._validationService.validateAmount(expenseUpdated.amount);
            const expense = await this._expenseService.updateExpenseById(Number(budgetId), Number(expenseId),expenseUpdated);

            response.status(200).json({expense, message: 'Gasto se ha actualizado correctamente'});
    
        }catch(error: any){
            if (error.message.includes('No se encontro')) {
                return response.status(404).json({ error: error.message });
              }
              return response.status(500).json({ error: error.message });
            }
        }


    public async deleteExpenseById(request: Request, response: Response): Promise<any>{
        try{

            const { budgetId, expenseId } = request.params;
            if (!budgetId || isNaN(Number(budgetId)) || !expenseId || isNaN(Number(expenseId))) {
                return response.status(400).json({ error: 'Los parámetros budgetId e id son obligatorios y deben ser números válidos.' });
            }

            const message = await this._expenseService.deleteExpenseById(Number(expenseId), Number(budgetId));
            response.status(200).json({message});
        }catch(ex: any){
            response.status(500).json({error: ex.message});
        }
    }
}