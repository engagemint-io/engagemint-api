import request from 'supertest';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import XAuthUrl from '../xAuthUrl';
import { MockTwitterKeys } from '../../mocks/xTwitter';
import { RegisteredUsersModel } from '../../schema';
import { MockRegisteredUser } from '../../mocks';
import { getSecrets } from '../../utils';

jest.mock('twitter-api-v2', () => ({
	TwitterApi: jest.fn().mockImplementation(() => ({
		generateOAuth2AuthLink: jest.fn().mockReturnValue({
			url: MockTwitterKeys.redirectUri,
			codeVerifier: MockTwitterKeys.codeVerifier
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
app.get('/x-auth-url', XAuthUrl);

describe('XAuthUrl Route', () => {
	test('GET /x-auth-url without redirectUrl returns 400', async () => {
		const response = await request(app).get('/x-auth-url');

		expect(response.status).toBe(StatusCodes.BAD_REQUEST);
		expect(response.body.message).toBe('Validation: You must pass a redirect URL!');
	});

	test('GET /x-auth-url with invalid redirectUrl returns 400', async () => {
		const response = await request(app).get(`/x-auth-url?redirectUrl=${MockTwitterKeys.invalidRedirectUri}`);

		expect(response.status).toBe(StatusCodes.BAD_REQUEST);
		expect(response.body.message).toBe('Validation: You must pass a valid redirect URL!');
	});

	test('GET /x-auth-url with invalid AWS Secret Manager keys returns error', async () => {
		const secrets = getSecrets as jest.Mock;
		secrets.mockImplementationOnce(() => ({}));
		const response = await request(app).get(`/x-auth-url?redirectUrl=${MockTwitterKeys.redirectUri}`);

		expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
		expect(response.body.message).toBe('Processing: Error fetching x (Twitter) keys');
	});

	test('GET /x-auth-url should return internal service error if undefined value', async () => {
		const secrets = getSecrets as jest.Mock;
		secrets.mockImplementationOnce(() => null);
		const response = await request(app).get(`/x-auth-url?redirectUrl=${MockTwitterKeys.redirectUri}`);

		expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
		expect(response.body.message).toBe('Error generating twitter login url');
	});

	test('GET /x-auth-url with valid redirectUrl returns auth URL and code verifier', async () => {
		const response = await request(app).get(`/x-auth-url?redirectUrl=${MockTwitterKeys.redirectUri}`);

		expect(response.status).toBe(StatusCodes.OK);
		expect(response.body.data.xAuthUrl).toBe(MockTwitterKeys.redirectUri);
		expect(response.body.data.xCodeVerifier).toBe(MockTwitterKeys.codeVerifier);
		expect(response.body.data.xRedirectUrl).toBe(MockTwitterKeys.redirectUri);
	});
});
