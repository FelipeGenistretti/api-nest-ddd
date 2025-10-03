import { Body, Controller, HttpCode, Post, UsePipes } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare, hash } from "bcryptjs";
import { env } from "node:process";
import { ZodValidationPipe } from "src/pipes/zod-validation-pipe";
import { PrismaService } from "src/prisma/prisma.service";
import z, { email, jwt } from "zod";

const bodySchema = z.object({
    email: z.string().email().trim(),
    password : z.string().min(6, {message:"A senha deve conter 6 caracteres"})
})

type AuthenticateBodySchema = z.infer<typeof bodySchema>

@Controller("/session")
export class AuthenticateController {
    constructor(
        private prisma:PrismaService,
        private jwt: JwtService
    ){
        console.log("AuthenticateController carregado!");
    }
    
    @Post()
    @UsePipes(new ZodValidationPipe(bodySchema))
    @HttpCode(200)
    async handle(@Body() body:AuthenticateBodySchema){
        
        const { email, password } = body
        
        const userExists = await this.prisma.user.findUnique({
            where:{
                email
            }
        })
        
        if(!userExists){
            throw new Error("nenhum usuario com este email encontrado! Registre-se")
        }
        if(!(await this.checkPassword(password, userExists.password))){
            throw new Error("Credenciais invalidas")
        }
        
        const { password: _, ...user } = userExists
        
        const token = this.jwt.sign({ sub:user.id })
        
        return {
            user,
            token
        }

    }

    private async checkPassword(password:string, userPassword:string){
        return await compare(password, userPassword)
    }

}