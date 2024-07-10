
interface JWT{
    generateTocken(userId:string, role: string) : string
}

export default JWT