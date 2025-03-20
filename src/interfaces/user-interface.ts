export interface User{
    name:    string;
    password:  string;
    email:     string; 
    token:     string; 
    confirmed:  boolean; 
    createdAt?:  Date;
    updatedAt?: Date;
}