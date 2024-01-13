import { GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { SECRET_ID } from '../constants';
import { secretsManagerClient } from './secretsManagerClient';

export const getSecrets = async () => {
  const command = new GetSecretValueCommand({
    SecretId: SECRET_ID
  });
  const secrets = await secretsManagerClient.send(command);
  if (!secrets.SecretString) {
    return {};
  }
  return JSON.parse(secrets.SecretString);
};
