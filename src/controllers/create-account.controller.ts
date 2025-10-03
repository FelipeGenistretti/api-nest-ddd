import { ConflictException, UsePipes } from "@nestjs/common";
import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { hash } from "bcryptjs";
import { email, z } from "zod";
import { ZodValidationPipe } from "src/pipes/zod-validation-pipe";
import { JwtService } from "@nestjs/jwt";

const bodySchema = z.object({
    name: z.string().trim(),
    email: z.string().email(),
    password: z.string().min(6,{message:"A senha deve conter 6 caracteres"})
})

type CreateAccountBodySchema = z.infer<typeof bodySchema>

@Controller("/accounts")
export class CreateAccountController{
    constructor(
        private prisma : PrismaService,
        private jwt : JwtService
    ){}
    @Post()
    @HttpCode(201)
    @UsePipes(new ZodValidationPipe(bodySchema))
    async handle(@Body() body:CreateAccountBodySchema){
        const { name, email, password } = body

        const userWithSameEmail = await this.prisma.user.findUnique({
            where:{
                email
            }
        })

        if(userWithSameEmail){
            throw new ConflictException("user with same email already exists")
        }

        const hashedPassowrd = await this.hashPassword(password)

        const user = await this.prisma.user.create({
            data:{
                name, email, password: hashedPassowrd
            }
        })

        const { password:_, ...userWithoutPassword } = user


        const token = this.jwt.sign({sub:user.id})

        return {
            userWithoutPassword,
            token
        }
    }

    private async hashPassword(password:string){
        return await hash(password, 8);
    }
}