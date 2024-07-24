
interface JWT{
    generateToken(userId:string, role: string) : string
}

export default JWT