import prisma from "../database/prisma/prisma";
import { User, UserModel } from "../interfaces";
import { GenerateToken } from "../utils/GeneratorToken";
import { ValidationService } from "./ValidationService";



export class UserService{
    private readonly _validationService: ValidationService;
    private readonly _generateToken: GenerateToken;
    constructor(){
        this._validationService = new ValidationService();
        this._generateToken = new GenerateToken();
    } 
    
    public async createAccountUser(name: string, email: string, password: string){
        try{
            const newUser = await prisma.users.create({
                data:{
                    Name: name,
                    Email: email,
                    Password: password,
                    Token: GenerateToken.generateToken()
                }
                    
            });

            const user = {
                name: newUser.Name,
                email: newUser.Email,
                token: newUser.Token,
                confirmed: newUser.Confirmed,
            }
            if(!user) throw new Error('Error al actualizar el usuario');
            
            return user;
        }catch(ex:any){
            throw new Error(ex.message);
        }
    }    

    public async confirmAccountNewUser(token: string): Promise<any> {
        try {
            if (!token) {
                throw new Error("El token no puede estar vacío o ser nulo.");
            }
    
            const user = await prisma.users.findFirst({
                where: { Token: token }
            });
    
            if (!user) {
                throw new Error("Token no válido o usuario no encontrado.");
            }
    
            // Actualizar el usuario
            const updatedUser = await prisma.users.update({
                where: { Id: user.Id },
                data: {
                    Confirmed: true,
                    Token: null,  // Invalidar el token después de confirmarlo
                }
            });
    
            return updatedUser;
        } catch (error: any) {
            throw new Error(error.message || "Error al confirmar la cuenta"); // Se lanza el error en lugar de devolver un objeto vacío
        }
    }
    
    public async updateAccount(user: UserModel,  name: string, email: string):Promise<any>{
        try{

            const userExists = await prisma.users.findUnique({
                where: {
                    Id: user.Id,
                },
            })
        
            if(!userExists){
                throw new Error('El usuario no existe');
            }

            //Encontrar si el email es unico
            const emailExists = await prisma.users.findUnique({
                where: {        
                    Email: email
                }
            });
            
            if (emailExists && emailExists.Id !== userExists.Id) {
                throw new Error("El correo ya está en uso, intenta con otro...");
            }


            const updateUser = await prisma.users.update({
                where: {Id: user.Id},
                data: {
                    Email: email,
                    Name: name,
                }    
            });

            return updateUser;
        }catch(ex:any){
            throw new Error(ex.message);
        }
    }

    public async login(email: string, password: string):Promise<any>{
        try {
            const userExists = await prisma.users.findUnique({
                where: {Email: email}
            });

            if(!userExists){
                throw new Error('El usuario no ha sido encontrado');
            }

            if(!userExists.Confirmed){
                throw new Error('La cuenta no ha sido confirmada');
            }
            const isMatchPassword = await this._validationService.verifyPassword(password, userExists.Password);
            
            if(!isMatchPassword){
                throw new Error('Password incorrecto, intentalo de nuevo');
            }
            const jwt = this._generateToken.generateJWT((userExists.Id).toString());
            return jwt; 
        } catch (error) {
            throw new Error(error.message);
        }
    }

    public async forgetEmail(email:string):Promise<any>{
        try {
            const user = await prisma.users.findUnique({
                where: {Email: email}
            });
            if(!user){
                throw new Error('El usuario no ha sido encontrado');
            }

            //Generar un nuevo token y guardarlo en la base de datos
            const updatedUser = await prisma.users.update({
                where: { Id: user.Id },
                data: {
                    Token: GenerateToken.generateToken(),  
                }
            });

            return updatedUser;
        } catch (ex: any) {
            throw new Error(ex.message);            
        }
    }

    public async validateToken(token: string): Promise<any>{
        try {
            if (!token) {
                throw new Error("El token no puede estar vacío o ser nulo.");
            }
    
            const user = await prisma.users.findFirst({
                where: { Token: token }
            });
    

            if (!user || user === null) {
                throw new Error("Token no válido o usuario no encontrado.");
            }

            return `Token valido, asigna un nuevo password.`;
        } catch (ex: any) {
            throw new Error(ex.message);
        }
    }

    public async resetPasswordWithToken(password: string, token: string):Promise<any>{
        try {
            const user = await prisma.users.findFirst({
                where: { Token: token }
            });
            if (!user || user === null) {
                throw new Error("Token no válido o usuario no encontrado.");
            }
            console.log(user);
            //Asignar el nuevo password
           const hashPassword = await this._validationService.hashPassword(password, 10);
           // Actualizar el usuario
            await prisma.users.update({
            where: { Id: user.Id },
            data: {
                Password: hashPassword,
                Token: null,  // Invalidar el token después de confirmarlo
            }
        });            
            return `El password se modifico correctamente`;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    public async updatePasswordByUserAuhtenticated(user: UserModel, currentPassword: string,  password: string):Promise<any>{
        try {
            // validamos si el password actual es el correcto
            const userExists = await prisma.users.findUnique({
                where: {
                    Id: user.Id,
                },
            })
        
            if(!userExists){
                throw new Error('El usuario no existe');
            }

            const isMatch = await this._validationService.verifyPassword(currentPassword, userExists.Password);
            if(!isMatch){
                throw new Error('El password no es correcto, intenta de nuevo');
            }

            const hashPassword = await this._validationService.hashPassword(password, 10);
            const updatedUser = await prisma.users.update({
                where: { Id: user.Id},
                data: { Password: hashPassword}
            });

            if(!updatedUser){
                throw new Error('Hubo un error al actualizar el password');
            }
            return `Se ha reestablecido la contraseña`;
        } catch (ex:any) {
            throw new Error(ex.message);
        }
    }

    public async checkPassword(user: UserModel, password: string):Promise<any>{
        try {
            const existsUser = await prisma.users.findUnique({
                where: { Id: user.Id}
            });

            if(!existsUser){
                throw new Error('El usuario no existe');
            }

            const isMatch = await this._validationService.verifyPassword(password, existsUser.Password);

            if(!isMatch){
                throw new Error('El password es incorrecto, intenta de nuevo');
            }

            return 'Password correcto';

        } catch (ex:any) {
            throw new Error(ex.message);
        }
    }

}