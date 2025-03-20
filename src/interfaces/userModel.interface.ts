export interface UserModel{
    Id: number;
    Name: string;
    Password: string; 
    CreatedAt: Date; 
    UpdatedAt: Date;
    Email:     string;
    Token:     string|null;
    Confirmed:  boolean;
}