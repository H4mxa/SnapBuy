import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const getCurrentUserId = createParamDecorator(
  (data: string, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest();

    console.log('TokeN asdd: ', request.token);
    return request.user['sub'];
  },
);
