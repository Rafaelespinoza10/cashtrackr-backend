import type  { Request, Response } from 'express';
import { CreateBudget } from '../interfaces/create-budget.interface';
import { ValidationService } from '../services/ValidationService';
import { BudgetService } from '../services/BudgetService';
import { UpdateBudget } from '../interfaces/update-budgate.interface';

export class BudgetController {
    private readonly _validationService: ValidationService;
    private readonly _budgetService: BudgetService;

    constructor(validationService: ValidationService, budgetService: BudgetService ){
        this._validationService = validationService;
        this._budgetService = budgetService;

        this.getAll = this.getAll.bind(this);
        this.createBudget = this.createBudget.bind(this);
        this.getBudgetById = this.getBudgetById.bind(this);
        this.editBudgetById = this.editBudgetById.bind(this);
        this.deleteBudgetById = this.deleteBudgetById.bind(this);
    }

    public async getAll(request: Request, response: Response): Promise<any>{
        try{
            const user = request.user;
            const budgets = await this._budgetService.obtainAllBudgets(user);
            console.log(budgets);
            response.status(200).json( budgets );
        }catch(ex: any){
            response.status(500).json({error: ex.message});
        }
    }

    public  async createBudget(request: Request, response:Response): Promise<any>{

        try{
            const {  name, amount } = request.body as CreateBudget;
            const user = request.user;
            
            if (!user) {
                return response.status(404).json({ error: 'El usuario no existe' });
              }

            await this._validationService.validateField(name);
            await this._validationService.validateField(amount);
            await this._validationService.validateAmount(amount);

            const budget = await this._budgetService.createBudget(user, name, amount);
            response.status(201).json({ message: 'Presupuesto creado correctamente',  budget});
        }catch(ex: any){
            response.status(500).json({ error: ex.message});
        }
    }

    public async getBudgetById(request: Request, response:Response): Promise<any>{
        try {
            const { id } = request.params;
            const user = request.user;

            if (!id || isNaN(Number(id))) {
                return response.status(400).json({ error: 'El parámetro id es obligatorio y debe ser un número válido.' });
              }
            const budget = await this._budgetService.obtainBudgetById(Number(id), user);
            console.log(budget);
            response.status(200).json( budget );
        } catch (error : any) {
            response.status(500).json({
                error: error.message
            })
        }

    }

    public async editBudgetById(request: Request, response: Response): Promise<any>{
        try{
            const user = request.user;
            const { id } = request.params;
            const updatedBudget = request.body as UpdateBudget;
            if (!id || isNaN(Number(id))) {
                return response.status(400).json({ error: 'El parámetro id es obligatorio y debe ser un número válido.' });
              }

            if(!updatedBudget){
                response.status(500).json({ error: 'Faltan campos por llenar'});
            }
            const budget = await this._budgetService.updateBudgetById(Number(id), updatedBudget, user);
            response.status(200).json({ budget, message: 'El presupuesto se ha actualizado correctamente'
            });
        }catch(ex: any){
            response.status(500).json({
                error: ex.message
            })
        }
    }

    public async deleteBudgetById(request: Request, response: Response): Promise<any>{
        try{
            const user = request.user;
            const { id } = request.params;
            if (!id || isNaN(Number(id))) {
                return response.status(400).json({ error: 'El parámetro id es obligatorio y debe ser un número válido.' });
              }
              const message = await this._budgetService.deleteBudgetById(Number(id), user);
               response.status(200).json({ message});
        }catch(ex: any){
            response.status(500).json({error: ex.message});
        }
    }
}