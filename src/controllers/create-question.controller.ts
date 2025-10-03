import { Controller, Post, UseGuards, Req, Body } from "@nestjs/common";
import { CurrentUser } from "src/auth/current-user-decorator";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { TokenSchema } from "src/auth/jwt.strategy";
import { ZodValidationPipe } from "src/pipes/zod-validation-pipe";
import { PrismaService } from "src/prisma/prisma.service";
import z, { email } from "zod";

const createQuestionSchema = z.object({
    title: z.string(),
    content: z.string() 
})

type CreateQuestionBodySchema = z.infer<typeof createQuestionSchema>


@Controller("/questions")
@UseGuards(JwtAuthGuard)
export class CreateQuestionController {
    constructor(
        private prisma: PrismaService,
    ){}

    @Post()
    async handle(
        @Body(new ZodValidationPipe(createQuestionSchema)) body: CreateQuestionBodySchema,
        @CurrentUser() user:TokenSchema
    ){
        const { title, content } = body
        const slug = this.convertToSlug(title)


        const question = await this.prisma.question.create({
            data:{
                title, content, slug,
                author: {
                    connect: {
                        id:user.sub
                    }
                }
            }
        })

        
    }
    private convertToSlug(title: string): string {
            return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
        }
}