import prisma from "../database/prisma/prisma";
import { UserModel } from "../interfaces";
import { CreateBudget } from "../interfaces/create-budget.interface";
import { UpdateBudget } from "../interfaces/update-budgate.interface";


export class BudgetService{


        public async createBudget(user: UserModel, name: string, amount: number): Promise<any>{
            try{
                
                const existsUser = await prisma.users.findUnique({
                    where: {Id: user.Id}
                });

                if(!existsUser){
                    throw new Error('No existe el usuario');
                }
                
                const budgets  = await prisma.budgets.create({
                    data: { 
                        Name: name, 
                        Amount: amount,
                        UserId : user.Id
                    }
                });


                const data = { 
                    id: budgets.Id, 
                    name: budgets.Name, 
                    amount: budgets.Amount,
                    createdAt: budgets.CreatedAt,
                    updatedAt: budgets.UpdatedAt
                }

                return data;
            }catch(ex: any){
                throw new Error('Error al crear el budget', ex);
            }
        }

    public async obtainAllBudgets(user: UserModel): Promise<any>{
        try{
            const budgets = await prisma.budgets.findMany({
                orderBy: {
                    CreatedAt:"desc"
                },
                where: {
                    UserId: user.Id,
                },
                include: {expenses: true}
                //!TODO: Filtrar por el usuario autenticado
            });
            return budgets;
        }catch(ex: any){
            throw new Error(`Error al obtener todos los registros`, ex);
        }
    }

    public async obtainBudgetById(id: number, user: UserModel): Promise<any>{
        try{
            const userExists = await prisma.users.findUnique({
                where: {
                    Id: user.Id
                },
            });

            if(!userExists){
                throw new Error('Usuario No existe');
            }
            const budget = await prisma.budgets.findUnique({
                where: { 
                    Id: id, 
                    UserId: user.Id
                },
                include: {expenses: true}

            })

            if(budget.UserId !== userExists.Id){
                throw new Error('Accion No Valida');
            }
            
            if(!budget){
                throw new Error('No existe el budget asociado al id');
            }

            return budget;
        }catch(ex: any){
            throw new Error(`Error al obtener el budget por Id`, ex);
        }
    }

    public async updateBudgetById(id: number, dataUpdated: UpdateBudget, user: UserModel) : Promise<any>{
        try{

            const userExists = await prisma.users.findUnique({
                where: {Id: user.Id}
            });

            if(!userExists){
                throw new Error('Usuario no existe');
            }

            const budget = await prisma.budgets.findUnique({
                where: { Id: id}
            });
            if(!budget){ 
                throw new Error('No existe el budget asociado al Id');
            }
        
            if(userExists.Id !== budget.UserId){
                throw new Error(' Accion No valida');
            }

            const updatedBudget = await prisma.budgets.update({
                where: { Id: id },
                data: { 
                    Name: dataUpdated.name,
                    Amount: dataUpdated.amount,
                    UserId: user.Id
                }
            });

            return updatedBudget;
        }catch(ex: any){
            throw new Error('Error al editar el budgte' + ex.message);
        }
    }


    public async deleteBudgetById(id: number, user: UserModel) : Promise<any>{
        try{
            const userExists = await prisma.users.findUnique({
                where: {Id: user.Id}
            });
            if(!userExists){
                throw new Error('Usuario No existe');
            }

            const budget = await prisma.budgets.findUnique({
                where: { Id: id}
            });
            if(!budget){ 
                throw new Error('No existe el budget asociado al Id');
            
            }

            if(userExists.Id !== budget.UserId){
                throw new Error(' Accion No Valida');
            }

            await prisma.budgets.delete({ 
                where: { 
                    Id: id,
                    UserId: user.Id
                }
            });

            return `El Presupuesto ha sido eliminado correctamente`;
        }catch(ex: any){
            throw new Error(`Error al borrar el budget ${ex.message}`);
        }
    }
}