import serverlessHttp from 'serverless-http';
import { APIGatewayEvent, Context } from 'aws-lambda';
import { Request } from 'express';
import { app } from './app';

export const handler = serverlessHttp(app, {
  request: function (req: Request, event: APIGatewayEvent, context: Context) {
    console.info('received:', event);
    req.event = event;
    req.context = context;
  }
});
