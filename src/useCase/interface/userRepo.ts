import User from "../../domain/users";


interface  UserRepo{
    findByEmail(email:string): Promise<User | null>;
}


export default UserRepo;