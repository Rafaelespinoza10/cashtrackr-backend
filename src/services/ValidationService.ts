import prisma from "../database/prisma/prisma";
import bcrypt from 'bcrypt';

export class ValidationService{
    
    public  async validateField(field: string | number):Promise<any>{
            if(field === null || !field){
                throw new Error(`El campo es obligatorio`);
            }
    }

        public async validateLengthToken(token: string): Promise<void> {
            if (!token || token.length < 6) {
                throw new Error('Token no válido');
            }
        }
        

    public async validateAmount(amount: number): Promise<any>{
        if(amount < 0 ){
            throw new Error(`El monto no puede ser negativo`);
        }
    }

    public async validationEmail(email:string){
        const emailExists = await prisma.users.findUnique({
            where: { Email: email },
        }); 
        if(emailExists){
            throw new Error('El usuario ya existe, intente de nuevo');
        }
        await this.validateFormatEmail(email);
    }

    public async validateFormatEmail(email:string){
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            throw new Error('El correo no tiene un formato valido');
        }
    }

    public async  hashPassword(password: string, saltRounds: number): Promise<string>{
        return bcrypt.hash(password, saltRounds);
    }

    public async verifyPassword(password: string, storedPassword: string): Promise<boolean>{
        return await bcrypt.compare(password, storedPassword);
    }


    public async validationPassword(password:string){
        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        if(!passwordRegex.test(password)){
            throw new Error('El password debe de contener al menos de 6 caracteres, una letra mayuscula, una minuscula, un numero y un caracter especial');
        }
    }
}