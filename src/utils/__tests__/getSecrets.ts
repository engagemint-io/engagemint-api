import { GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { secretsManagerClient } from '../secretsManagerClient';
import { getSecrets } from '../getSecrets';

// Mock the entire AWS SDK Secrets Manager client module
jest.mock('@aws-sdk/client-secrets-manager', () => ({
	SecretsManagerClient: jest.fn(),
	GetSecretValueCommand: jest.fn()
}));

describe('getSecrets', () => {
	// Before each test, reset all mocks to clear previous calls
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should return parsed secret when SecretString is available', async () => {
		// Mock the send method to return a successful response
		secretsManagerClient.send = jest.fn().mockResolvedValue({
			SecretString: JSON.stringify({ key: 'value' })
		});

		const result = await getSecrets();

		// Expect the send method to have been called with the GetSecretValueCommand
		expect(secretsManagerClient.send).toHaveBeenCalledWith(expect.any(GetSecretValueCommand));
		// Expect the result to match the parsed secret
		expect(result).toEqual({ key: 'value' });
	});

	it('should return an empty object when SecretString is not available', async () => {
		// Mock the send method to simulate a response without SecretString
		secretsManagerClient.send = jest.fn().mockResolvedValue({});

		const result = await getSecrets();

		expect(secretsManagerClient.send).toHaveBeenCalledWith(expect.any(GetSecretValueCommand));
		// Expect the result to be an empty object
		expect(result).toEqual({});
	});
});
