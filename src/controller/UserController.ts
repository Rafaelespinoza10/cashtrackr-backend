import type  { Request, Response } from 'express';
import { CreateUserAccount, Login, MessageType, UserModel } from '../interfaces';
import { ValidationService } from '../services/ValidationService';
import { UserService } from '../services/UserService';
import { EmailService } from '../services/EmailService';


export class UserController{

    private readonly _validationService: ValidationService;
    private readonly _userService: UserService;
    private readonly _emailService: EmailService;

    constructor(validationService: ValidationService, userService: UserService, emailService: EmailService){
         this._validationService = validationService;
         this._userService = userService;
         this._emailService = emailService;

         this.createAccount = this.createAccount.bind(this);
         this.confirmAccount = this.confirmAccount.bind(this);
         this.login = this.login.bind(this);
         this.forgetPassword = this.forgetPassword.bind(this);
         this.validateToken = this.validateToken.bind(this);
         this.resetPasswordWithToken = this.resetPasswordWithToken.bind(this);
         this.user = this.user.bind(this);
         this.updatedPasswordUserAuthenticated = this.updatedPasswordUserAuthenticated.bind(this);
         this.checkPassword = this.checkPassword.bind(this);
         this.updateAccount = this.updateAccount.bind(this);
    }

    public async createAccount(request: Request, response: Response):Promise<any>{

        try{
            const { name, email, password } = request.body as CreateUserAccount;
            //validaciones de name
            await this._validationService.validateField(name);
            await this._validationService.validateField(email);
            await this._validationService.validateField(password);
            await this._validationService.validationEmail(email);
            await this._validationService.validationPassword(password);
            const hashPassword = await this._validationService.hashPassword(password, 10);
            const user = await this._userService.createAccountUser(name, email, hashPassword);
            
            // enviar email de confirmacion al usuario
            await this._emailService.sendEmail(user.name, user.email, 'Confirmacion de cuenta', user.token, MessageType.CreateAccount);

            response.status(201).json({ 
                message: 'La cuenta ha sido creada exitosamente',             
                user 
            })

        }catch(ex:any){
            response.status(500).json({error: ex.message});
        }   
    }

    public async updateAccount(request: Request, response: Response): Promise<any>{
       try{
           const user = request.user;
            const { email, name } = request.body;

           console.log(email);
           await this._validationService.validateField(name);
           await this._validationService.validateField(email)
           await this._validationService.validationEmail(email);
           const updateUser =  await this._userService.updateAccount(user, name, email);
            const userDto ={
                name: updateUser.Name, 
                email: updateUser.Email, 
                token: updateUser.Token
            };
           
           response.status(200).json({message: 'Usuario actualizado exitosamente', user: userDto })
       }catch(ex:any){
            response.status(500).json({error: ex.message});
       }
    }

    public async confirmAccount(request: Request, response: Response): Promise<any>{
        try{
            const { token } = request.body;
            await this._validationService.validateLengthToken(token);

            const user = await this._userService.confirmAccountNewUser(token);
            const userDTO =  {
                name: user.Name, 
                email: user.Email,
                confimed: user.Confirmed,
            }

            response.status(200).json('Se ha confirmado la cuenta del usuario')
        }catch(ex:any){
            response.status(500).json({
                error: ex.message
            })
        }
    }


    public async login(request:Request, response: Response):Promise<any>{
        try {
            const { email, password } = request.body as Login;
            await this._validationService.validateField(email);
            await this._validationService.validateField(password);
            await this._validationService.validateFormatEmail(email);
            await this._validationService.validationPassword(password);
            const token = await this._userService.login(email, password);
            response.status(200).json({token});
        } catch (ex:any) {
            response.status(500).json({
                error: ex.message
            })
            console.log(ex);
        }
    }


    public async forgetPassword(request:Request, response:Response):Promise<any>{
        try {
            const { email } = request.body;
            await this._validationService.validateField(email);
            await this._validationService.validateFormatEmail(email);
            const user = await this._userService.forgetEmail(email);
            // enviar email de confirmacion al usuario
            if (!user.Token) {  // Verifica si el token existe antes de enviarlo
                throw new Error("No se pudo generar un token de recuperación.");
            }
              await this._emailService.sendEmail(user.Name, user.Email, 'Reestablecer Contraseña' , user.Token, MessageType.ResetPassword);
             response.status(200).json('Revisa tu Email para seguir las instrucciones');
        } catch (ex) {
            response.status(500).json({error: ex.message});
        }
    }

    public async validateToken(request: Request, response:Response):Promise<any>{
        try {
            const { token } = request.body;
            await this._validationService.validateLengthToken(token);
            const message = await  this._userService.validateToken(token);
            response.status(200).json(message);
        } catch (ex: any) {
            response.status(500).json({error: ex.message});
        }
    }

    public async resetPasswordWithToken(request:Request, response:Response):Promise<any>{
        try {
            const {token} = request.params;
            const { password } = request.body;
            // validar campo y longitud de token
            await this._validationService.validateLengthToken(token);
            await this._validationService.validateField(password);
            await this._validationService.validationPassword(password);

            const message = await this._userService.resetPasswordWithToken(password, token);
            response.status(201).json(message);
        } catch (ex:any) {
            response.status(500).json({
                error: ex.message
            })
        }
    }

    public async user(request: Request, response: Response): Promise<any> {
        try {
            const  user  = request.user as UserModel;
            const userDTO = {
                id:  user.Id,
                name: user.Name, 
                email: user.Email, 
            }
            response.status(200).json({user: userDTO})
        }catch(ex:any){
            response.status(500).json({
                message: ex.message,
            })
        }
    }

    public async updatedPasswordUserAuthenticated(request:Request, response: Response):Promise<any>{
        try {
            const user = request.user;
            const { currentPassword, password } = request.body;
            
            await this._validationService.validateField(password);
            await this._validationService.validateField(currentPassword);

            await this._validationService.validationPassword(password);
            

            const message = await this._userService.updatePasswordByUserAuhtenticated(user, currentPassword,  password);
            response.status(200).json({message});
        } catch (ex:any) {
            response.status(500).json({ error: ex.message});
        }
    }

    public async checkPassword(request: Request, response:Response):Promise<any>{
        try {
            const user = request.user; 
            const { password } = request.body;
            await this._validationService.validateField(password);
            await this._validationService.validationPassword(password);
            const message = await this._userService.checkPassword(user, password);
            response.status(200).json({message});
        } catch (ex:any) {
            response.status(500).json({ message: ex.message});
        }
    }
}