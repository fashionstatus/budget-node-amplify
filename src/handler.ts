import { APIGatewayEvent, Context, Callback } from 'aws-lambda';
import { APIGatewayProxyHandler } from 'aws-lambda';

import serverlessHttp from 'serverless-http';
import app from './app';

const handler = serverlessHttp(app);




export const server = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
  /*const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello, World!',
      input: event,
    }),
  };

  callback(null, response);*/

   return handler(event, context);
};
