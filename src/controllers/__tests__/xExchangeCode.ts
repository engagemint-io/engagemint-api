import request from 'supertest';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import XExchangeCode from '../xExchangeCode';
import { MockTwitterKeys, MockTwitterMeResponse } from '../../mocks';

jest.mock('twitter-api-v2', () => ({
	TwitterApi: jest.fn().mockImplementation(() => ({
		v2: {
			me: jest.fn().mockResolvedValue(MockTwitterMeResponse)
		},
		loginWithOAuth2: jest.fn().mockResolvedValue({
			accessToken: MockTwitterKeys.accessToken,
			expiresIn: 7200 // 2 hours in seconds which is the X (Twitter) access token expiration time
		})
	}))
}));

jest.mock('../../utils', () => ({
	getSecrets: jest.fn().mockResolvedValue({
		X_CLIENT_ID: 'mock_client_id',
		X_CLIENT_SECRET: 'mock_client_secret'
	})
}));

const app = express();
app.use(express.json());
app.post('/x-exchange-code', XExchangeCode);

describe('XExchangeCode Route', () => {
	test('POST /x-exchange-code with missing code parameter returns 400', async () => {
		const response = await request(app).post('/x-exchange-code').send({
			codeVerifier: MockTwitterKeys.codeVerifier,
			redirectUri: MockTwitterKeys.redirectUri
		});

		expect(response.status).toBe(StatusCodes.BAD_REQUEST);
		expect(response.body.message).toBe('Validation: You must pass a code!');
	});

	test('POST /x-exchange-code with missing code parameter returns 400', async () => {
		const response = await request(app).post('/x-exchange-code').send({
			code: MockTwitterKeys.code,
			redirectUri: MockTwitterKeys.redirectUri
		});

		expect(response.status).toBe(StatusCodes.BAD_REQUEST);
		expect(response.body.message).toBe('Validation: You must pass a code verifier!');
	});

	test('POST /x-exchange-code with missing code parameter returns 400', async () => {
		const response = await request(app).post('/x-exchange-code').send({
			code: MockTwitterKeys.code,
			codeVerifier: MockTwitterKeys.codeVerifier
		});

		expect(response.status).toBe(StatusCodes.BAD_REQUEST);
		expect(response.body.message).toBe('Validation: You must pass a redirect URI!');
	});

	test('POST /x-exchange-code with valid parameters returns access token', async () => {
		const response = await request(app).post('/x-exchange-code').send({
			code: MockTwitterKeys.code,
			codeVerifier: MockTwitterKeys.codeVerifier,
			redirectUri: MockTwitterKeys.redirectUri
		});

		expect(response.status).toBe(StatusCodes.OK);
		expect(response.body.data.xAccessToken).toBe('mock_access_token');
		expect(response.body.data.expiresIn).toBe(7200);
	});
});
