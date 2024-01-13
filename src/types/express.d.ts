import { APIGatewayEvent, Context } from 'aws-lambda';

declare global {
  namespace Express {
    export interface Request {
      event?: APIGatewayEvent;
      context?: Context;
    }
  }
}
