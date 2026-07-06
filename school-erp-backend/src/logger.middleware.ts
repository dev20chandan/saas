import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private morganInstance = morgan('dev');

  use(req: Request, res: Response, next: NextFunction) {
    this.morganInstance(req, res, next);
  }
}

