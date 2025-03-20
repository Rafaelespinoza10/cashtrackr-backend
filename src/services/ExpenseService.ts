import prisma from "../database/prisma/prisma";
import { Expense } from "../interfaces/create-expense.interface";
import { UpdateExpense } from "../interfaces/update-expense.interface";


export class ExpenseService{


    public async createExpense(budgetId: number, expense: Expense): Promise<any>{
        try{
            const existsBudget = await prisma.budgets.findUnique({
                where: { Id: budgetId}
            });

            if(!existsBudget) throw new Error('No existe budget asociado');
            console.log(existsBudget);
            console.log(budgetId);
            const createExpense = await prisma.expenses.create({
                data: { Name: expense.name, Amount: expense.amount, budgetId: budgetId}
            });


            return createExpense; 
            
        }catch(ex: any){
            throw new Error('Error al crear expense' + ex.message);
        }
    }

        public async updateExpenseById(budgetId: number, expenseId: number, expenseUpdated: UpdateExpense): Promise<any>{
            try{
                const existingExpense = await prisma.expenses.findUnique({
                    where: { Id: expenseId },
                  });
              
                  if (!existingExpense || existingExpense.budgetId !== budgetId) {
                    throw new Error('No se encontró gasto asociado al presupuesto.');
                  }
              
                  // Luego, actualizamos el gasto:
                  const expense = await prisma.expenses.update({
                    where: { Id: expenseId },
                    data: {
                      Name: expenseUpdated.name,
                      Amount: expenseUpdated.amount,
                    },
                  });
              
                  return expense;
            }catch(ex: any){
                throw new Error(ex.message);
            }
        }

    public async obtainExpensesByBudgetId(id: number): Promise<any>{
        try{
            const budget = await prisma.budgets.findUnique({
                where: { Id: id},
                include: { expenses: true}
            });

            if(!budget) throw new Error('No se encontraron gastos asociados al presupuesto');
            return budget;
        }catch(ex: any){
            throw new Error(ex.message);
        }
    }

    public async obtainExpenseByIdAndBudgetId(budgetId: number, expenseId: number): Promise<any> {
        try {

            const expense = await prisma.expenses.findFirst({
                where: {
                  Id: expenseId,
                  budgetId: budgetId,
                }
              });


            
          if (!expense) {
            throw new Error('No se encontro el gasto asociado al presupuesto.');
          }
          return expense;
        } catch (ex: any) {
          throw new Error(ex.message);
        }
      }
      
    public async deleteExpenseById(expenseId: number, budgetId: number) : Promise<any>{
        try{
            const existingExpense = await prisma.expenses.findUnique({
                where: { Id: expenseId , budgetId: budgetId},
              });

              if (!existingExpense || existingExpense.budgetId !== budgetId) {
                throw new Error('No se encontró gasto asociado al presupuesto.');
              }
          
              // Luego, eliminamos el gasto
              await prisma.expenses.delete({
                where: { Id: expenseId }
              });

              return `El gasto se ha eliminado correctamente del presupeusto asociado`;

        }catch(ex: any){
            throw new Error(`${ex.message}`);
        }
    }
}