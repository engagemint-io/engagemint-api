import request from 'supertest';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { MockRegisteredUser, MockTwitterKeys, MockTwitterMeResponse } from '../../mocks';
import isUserRegistered from '../isUserRegistered';
import { RegisteredUsersModel } from '../../schema';

jest.mock('twitter-api-v2', () => ({
	TwitterApi: jest.fn().mockImplementation(() => ({
		v2: {
			me: jest.fn().mockResolvedValue(MockTwitterMeResponse)
		}
	}))
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
	}
}));

const app = express();
app.use(express.json());
app.get('/is-user-registered', isUserRegistered);

describe('is user registered Endpoint Tests', () => {
	test('Missing ticker parameter should return 400', async () => {
		const response = await request(app).get('/is-user-registered?x_access_token=token');
		expect(response.status).toBe(StatusCodes.BAD_REQUEST);
		expect(response.body.status).toBe('fail');
		expect(response.body.message).toBe('Validation: You must pass in a ticker!');
	});

	test('Missing x_access_token parameter should return 400', async () => {
		const response = await request(app).get('/is-user-registered?ticker=CLIFF');
		expect(response.status).toBe(StatusCodes.BAD_REQUEST);
		expect(response.body.status).toBe('fail');
		expect(response.body.message).toBe('Validation: You must pass in an X (Twitter) user id!');
	});

	test('Unsuccessful request returns true', async () => {
		const modelQuery = RegisteredUsersModel.query as jest.Mock;
		modelQuery.mockImplementationOnce(() => ({
			eq: () => ({
				where: () => ({
					eq: () => ({
						exec: jest.fn().mockResolvedValueOnce([])
					})
				})
			})
		}));

		const response = await request(app).get(`/is-user-registered?ticker=TICKER&x_user_id=${MockTwitterMeResponse.data.id}`);
		expect(response.status).toBe(StatusCodes.OK);
		expect(response.body.status).toBe('success');
		expect(response.body.data.isRegistered).toEqual(false);
	});

	test('Successful request returns true', async () => {
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
		const response = await request(app).get(`/is-user-registered?ticker=TICKER&x_user_id=${MockTwitterMeResponse.data.id}`);
		expect(response.status).toBe(StatusCodes.OK);
		expect(response.body.status).toBe('success');
		expect(response.body.data.isRegistered).toEqual(true);
	});
});
