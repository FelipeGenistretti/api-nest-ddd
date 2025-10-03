import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Env } from 'src/env';
import { JwtStrategy } from './jwt.strategy';
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      global: true,
      useFactory: async (config: ConfigService<Env, true>) => {
        const privateKeyBase64 = config.get('JWT_PRIVATE_KEY', { infer: true });
        const publicKeyBase64 = config.get('JWT_PUBLIC_KEY', { infer: true });
        return {
          privateKey: Buffer.from(privateKeyBase64, 'base64').toString('utf8'),
          publicKey: Buffer.from(publicKeyBase64, 'base64').toString('utf8'),
          signOptions: { algorithm: 'RS256', expiresIn: '1h' },
        };
      },
    }),
  ],
  providers:[JwtStrategy],
})
export class AuthModule {}
      