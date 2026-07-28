import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500;
    let message = 'Database error';
    let error = 'Internal Server Error';

    switch (exception.code) {
      case 'P2000':
        status = 400;
        message = 'Value too long for type';
        error = 'Bad Request';
        break;
      case 'P2001':
        status = 404;
        message = 'Record not found';
        error = 'Not Found';
        break;
      case 'P2002':
        status = 409;
        message = 'Unique constraint violation';
        error = 'Conflict';
        break;
      case 'P2003':
        status = 400;
        message = 'Foreign key constraint violation';
        error = 'Bad Request';
        break;
      case 'P2010':
        status = 500;
        message = 'Raw query execution failed';
        error = 'Database Query Error';
        break;
      case 'P2025':
        status = 404;
        message = 'Record not found';
        error = 'Not Found';
        break;
      case 'P2034':
        status = 409;
        message = 'Transaction conflict';
        error = 'Conflict';
        break;
      default:
        status = 500;
        message = 'Database error';
        error = 'Internal Server Error';
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
