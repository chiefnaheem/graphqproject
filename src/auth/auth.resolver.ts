import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResponse } from './types/auth.type';
import { SignupInput } from './dto/signup.input';
import { LoginInput } from './dto/login.input';
import { User } from '../users/user.entity';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Resolver()
export class AuthResolver {
    constructor(private authService: AuthService) { }

    @Mutation(() => AuthResponse)
    async signup(@Args('signupInput') signupInput: SignupInput) {
        return this.authService.signup(signupInput);
    }

    @Mutation(() => AuthResponse)
    async login(@Args('loginInput') loginInput: LoginInput) {
        return this.authService.login(loginInput);
    }

    @Query(() => User)
    @UseGuards(GqlAuthGuard)
    async me(@CurrentUser() user: User) {
        return user;
    }
}
