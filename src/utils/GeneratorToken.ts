import jwt from 'jsonwebtoken';

export class GenerateToken{

    private readonly _jwtKey: string;

    constructor(){
        this._jwtKey = process.env.KEY_JWT as string;
        if (!this._jwtKey) {
            throw new Error("La clave JWT (KEY_JWT) no está definida en las variables de entorno.");
        }
    }
 
    public static generateToken(){
        return Math.floor(10000 + Math.random() * 900000 ).toString(); 
    }

    public generateJWT(id: string): string {
        try {
            return jwt.sign({ id }, this._jwtKey, { expiresIn: '30d' });
        } catch (error) {
            console.error("Error al generar el JWT:", error);
            throw new Error("No se pudo generar el token.");
        }
    }

    public verifyJWT(token:string){
        return jwt.verify(token, this._jwtKey);
    }
}