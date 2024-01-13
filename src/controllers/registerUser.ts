import { Request, Response } from 'express';
import { PutCommand, PutCommandInput } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from '../utils';

const createUserRow = async (
  senderAddress: string,
  recipientAddress: string
) => {
  const tableName = process.env.GIFTS_TABLE_NAME;
  const params: PutCommandInput = {
    TableName: tableName,
    Item: {
      recipientAddress,
      senderAddress,
      giftStatus: 'gifted'
    }
  };
  const results = await ddbDocClient.send(new PutCommand(params));
  return results;
};

const registerUser = async (req: Request, res: Response) => {
  const { twitter_access_token, ticker, signature } = req.query;

  if (!ticker) {
    return res.status(200).json({
      status: 'fail',
      message: 'Validation: You must pass a ticker!'
    });
  }
  if (!twitter_access_token) {
    return res.status(200).json({
      status: 'fail',
      message: 'Validation: You must pass a twitter access token!'
    });
  }
  if (!signature) {
    return res.status(200).json({
      status: 'fail',
      message: 'Validation: You must pass a signature!'
    });
  }

  try {
    // Get twitter_id from twitter access token

    // Query db for user
    // Might need to scan the db for this

    // If user exists, return

    // Create user row
    // await createUserRow(senderAddress, recipientAddress);

    return res.status(200).send({
      status: 'success',
      data: {
        // Return data here
      }
    });
  } catch (error) {
    res.status(200).send({ verified: false, error: 'Error registering user!' });
  }
};

export default registerUser;
