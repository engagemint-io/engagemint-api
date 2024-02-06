import request from 'supertest';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import register from '../register';
import {
	MockArbitraryInvalidSignature,
	MockArbitraryInvalidSignatureInput,
	MockArbitrarySignature,
	MockProjectConfig,
	MockRegisteredUser,
	MockSeiWalletAddress,
	MockTwitterKeys
} from '../../mocks';
import { RegisteredUsersModel } from '../../schema';

jest.mock('twitter-api-v2', () => ({
	TwitterApi: jest.fn().mockImplementation(() => ({
		v2: {
			me: jest.fn().mockResolvedValue({ data: { id: '123' } }),
			search: jest.fn().mockResolvedValue({tweets: []})
		}
	}))
}));

jest.mock('../../utils/getSecrets', () => ({
	getSecrets: jest.fn().mockResolvedValue({ X_API_KEY: 'key', X_API_SECRET: 'secret' })
}));

jest.mock('../../schema', () => ({
	RegisteredUsersModel: {
		query: jest.fn(() => ({
			eq: jest.fn(() => ({
				where: jest.fn(() => ({
					eq: jest.fn(() => ({
						exec: jest.fn()
					}))
				}))
			}))
		}))
	},
	ProjectConfigModel: {
		query: jest.fn(() => ({
			eq: jest.fn(() => ({
				limit: jest.fn(() => ({
					exec: jest.fn().mockResolvedValue([MockProjectConfig])
				}))
			}))
		}))
	}
}));

// let mockProjectConfigModelQuery = jest.fn().mockResolvedValue(MockProjectConfig);

describe('register function', () => {
	const app = express();
	app.use(express.json());
	app.get('/register', register);

	test('should fail without ticker', async () => {
		const response = await request(app).get('/register');
		expect(response.status).toBe(StatusCodes.BAD_REQUEST);
		expect(response.body.message).toBe('Validation: You must pass a ticker!');
	});

	test('should fail without x_access_token', async () => {
		const response = await request(app).get(`/register?ticker=${MockProjectConfig.ticker}`);
		expect(response.status).toBe(StatusCodes.BAD_REQUEST);
		expect(response.body.message).toBe('Validation: You must pass an X (Twitter) access token!');
	});

	test('should fail without signature', async () => {
		const response = await request(app).get(`/register?ticker=${MockProjectConfig.ticker}&x_access_token=${MockTwitterKeys.accessToken}`);
		expect(response.status).toBe(StatusCodes.BAD_REQUEST);
		expect(response.body.message).toBe('Validation: You must pass a signature!');
	});

	test('should fail without sei_wallet_address', async () => {
		const response = await request(app).get(
			`/register?ticker=${MockProjectConfig.ticker}&x_access_token=${MockTwitterKeys.accessToken}&signature=${MockArbitrarySignature}`
		);
		expect(response.status).toBe(StatusCodes.BAD_REQUEST);
		expect(response.body.message).toBe('Validation: You must pass a Sei wallet address!');
	});

	test('should fail with invalid signature that is not a base64 encoded json', async () => {
		const response = await request(app).get(
			`/register?ticker=${MockProjectConfig.ticker}&x_access_token=${MockTwitterKeys.accessToken}&signature=${MockArbitraryInvalidSignatureInput}&sei_wallet_address=${MockSeiWalletAddress}`
		);
		expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
		expect(response.body.error).toBe('Error registering user!');
	});

	test('should fail with invalid signature that is a base64 encoded json, with the wrong signature', async () => {
		const response = await request(app).get(
			`/register?ticker=${MockProjectConfig.ticker}&x_access_token=${MockTwitterKeys.accessToken}&signature=${MockArbitraryInvalidSignature}&sei_wallet_address=${MockSeiWalletAddress}`
		);
		expect(response.status).toBe(StatusCodes.FORBIDDEN);
		expect(response.body.reason).toBe('Forbidden, invalid signature!');
	});

	test('should return error if user already exists', async () => {
		// Mock to simulate existing user
		const modelQuery = RegisteredUsersModel.query as jest.Mock;
		modelQuery.mockImplementationOnce(() => ({
			eq: () => ({
				where: () => ({
					eq: () => ({
						exec: jest.fn().mockResolvedValueOnce([MockRegisteredUser])
					})
				})
			})
		}));

		const response = await request(app).get(
			`/register?ticker=${MockProjectConfig.ticker}&x_access_token=${MockTwitterKeys.accessToken}&signature=${MockArbitrarySignature}&sei_wallet_address=${MockSeiWalletAddress}`
		);
		expect(response.status).toBe(StatusCodes.FORBIDDEN);
		expect(response.body.message).toBe('User already registered!');
	});

	// test to check  if user has tweeted the ticker required pre-defined tweet
	test('should return error if user has not tweeted the ticker required pre-defined tweet', async () => {
		const response = await request(app).get(
			`/register?ticker=${MockProjectConfig.ticker}&x_access_token=${MockTwitterKeys.accessToken}&signature=${MockArbitrarySignature}&sei_wallet_address=${MockSeiWalletAddress}`
		);
		expect(response.status).toBe(StatusCodes.FORBIDDEN);
		expect(response.body.message).toBe('User has not tweeted the required tweet!');
	});
});
