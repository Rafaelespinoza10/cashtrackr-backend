import prisma from "../database/prisma/prisma";
import { UserModel } from "../interfaces";
import { GenerateToken } from "../utils/GeneratorToken";
import { NextFunction, Request, Response } from "express";


declare global{
    namespace Express{
        interface Request{
            user?: UserModel;
        }
    }
}

export class Authorization{
    private readonly _generateToken: GenerateToken;
    constructor(){
        this._generateToken = new GenerateToken();
        this.userAuthorization = this.userAuthorization.bind(this);
    }

    public async userAuthorization(request: Request, response: Response, next: NextFunction):Promise<any>{
        try {

            const bearer = request.headers.authorization;
    
            if (!bearer || !bearer.startsWith("Bearer ")) {
                return response.status(401).json({
                    message: "No autorizado"
                });
            }
            const token = bearer.split(" ")[1];
            if (!token) {
                return response.status(401).json({
                    message: "Token no válido"
                });
            }
            const payload = this._generateToken.verifyJWT(token);
            if (typeof payload !== 'object' || !payload.id) {
                return response.status(401).json({ message: "Token inválido" });
            }
            request.user = await prisma.users.findUnique({
                where: { Id: Number(payload.id) }  
            });

            next();
        } catch (ex: any) {
            console.error("Error en user:", ex.message);
            return response.status(401).json({ message: "No autenticado" });
        }
    }
}