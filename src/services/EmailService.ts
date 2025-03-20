import * as SibApiV3Sdk from 'sib-api-v3-sdk';
import { MessageType } from '../interfaces';



export class EmailService {
    private readonly _apikey: string;
    private readonly _emailAccount: string;
    private readonly baseClientUrl: string = process.env.CLIENT_URL;

    constructor() {
        this._apikey = process.env.BREVO_API as string;
        this._emailAccount = process.env.EMAIL_REGISTER as string;

        if (!this._apikey || !this._emailAccount) {
            throw new Error("Las variables de entorno BREVO_API o EMAIL_REGISTER no están definidas.");
        }

        const defaultClient = SibApiV3Sdk.ApiClient.instance;
        const apiKey = defaultClient.authentications['api-key'];
        apiKey.apiKey = this._apikey;
    }

    /**
     * Configura el correo a enviar
     */
    private configurateEmail(
        name: string, 
        email: string, 
        subject: string, 
        token: string, 
        action: MessageType
    ): SibApiV3Sdk.SendSmtpEmail {
        return {
            to: [{ email, name }],
            sender: { email: this._emailAccount, name: 'CashTrack' },
            subject,
            htmlContent: this.message(action, name, token)
        } as SibApiV3Sdk.SendSmtpEmail; 
    }

    /**
     * Genera el mensaje HTML según la acción
     */
    private message(action: MessageType, name: string, token: string): string {
        if (action === MessageType.CreateAccount) {
            return `
                <html>
                    <body>
                        <h1>Hola ${name}, has creado una cuenta en CashTrack!</h1>
                        <p>Visita el siguiente enlace para confirmar tu cuenta:</p>
                        <a href="${this.baseClientUrl}/auth/confirm-account">Confirmar Cuenta</a>
                        <p>Ingresa el código: <b>${token}</b></p>
                    </body>
                </html>
            `;
        } else {
            return `
                <html>
                    <body>
                        <h1>Hola ${name}, reestablece tu contraseña de CashTrack!</h1>
                        <p>Visita el siguiente enlace para cambiar tu contraseña:</p>
                        <a href="${this.baseClientUrl}/auth/new-password">Restablecer Contraseña</a>
                        <p>Ingresa el código: <b>${token}</b></p>
                    </body>
                </html>
            `;
        }
    }

    /**
     * Envía el correo mediante Brevo
     */
    public async sendEmail(
        name: string, 
        email: string, 
        subject: string, 
        token: string, 
        action: MessageType
    ): Promise<any> {
        try {
            const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();
            const sendSmtpEmail = this.configurateEmail(name, email, subject, token, action);
            const response = await tranEmailApi.sendTransacEmail(sendSmtpEmail);

            console.log('Email enviado con éxito:', response);
            return response;
        } catch (error: any) {
            console.error("Error en sendEmail:", error.message);
            throw new Error(error.message || 'Error desconocido al enviar el email');
        }
    }

}