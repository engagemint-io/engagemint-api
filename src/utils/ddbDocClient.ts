import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Create an Amazon DynamoDB service client object.
const ddbClient = new DynamoDBClient({ region: 'us-west-2' });
// Create the DynamoDB document client.
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

export { ddbDocClient };
