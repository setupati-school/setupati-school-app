import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodTypeAny, ZodError } from 'zod';

function formatZodError(err: ZodError) {
  const issues = err.errors.map((e) => ({
    path: e.path.join('.'),
    message: e.message
  }));

  const combinedMessage =
    issues.length === 1
      ? `${issues[0].path}: ${issues[0].message}`
      : issues.map((i) => `${i.path}: ${i.message}`).join('; ');

  return { issues, combinedMessage };
}

export function validateBody(schema: ZodTypeAny): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        const { issues, combinedMessage } = formatZodError(err);

        return res.status(400).json({
          error: combinedMessage, 
          issues
        });
      }
      return next(err);
    }
  };
}

export function validateParams(schema: ZodTypeAny): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.params);
      req.params = parsed;
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        const { issues, combinedMessage } = formatZodError(err);

        return res.status(400).json({
          error: combinedMessage,
          issues
        });
      }
      return next(err);
    }
  };
}
