import request from 'supertest';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { MockLeaderboardRows, MockTwitterMeResponse } from '../../mocks';
import userStats from '../userStats';

jest.mock('twitter-api-v2', () => ({
	TwitterApi: jest.fn().mockImplementation(() => ({
		v2: {
			me: jest.fn().mockResolvedValue(MockTwitterMeResponse)
		}
	}))
}));

jest.mock('../../schema/leaderboard', () => ({
	LeaderboardModel: {
		query: () => ({
			eq: () => ({
				using: () => ({
					where: () => ({
						eq: () => ({
							exec: jest.fn().mockResolvedValue(MockLeaderboardRows)
						})
					})
				})
			})
		})
	}
}));

const app = express();
app.use(express.json());
app.get('/userStats', userStats);

describe('userStats Endpoint Tests', () => {
	test('Missing epoch parameter should return 400', async () => {
		const response = await request(app).get('/userStats?ticker=CLIFF&x_access_token=token');
		expect(response.status).toBe(StatusCodes.BAD_REQUEST);
		expect(response.body.status).toBe('fail');
		expect(response.body.message).toBe('Validation: You must pass in an epoch!');
	});

	test('Missing ticker parameter should return 400', async () => {
		const response = await request(app).get('/userStats?epoch=1&x_access_token=token');
		expect(response.status).toBe(StatusCodes.BAD_REQUEST);
		expect(response.body.status).toBe('fail');
		expect(response.body.message).toBe('Validation: You must pass in a ticker!');
	});

	test('Missing x_access_token parameter should return 400', async () => {
		const response = await request(app).get('/userStats?epoch=1&ticker=CLIFF');
		expect(response.status).toBe(StatusCodes.BAD_REQUEST);
		expect(response.body.status).toBe('fail');
		expect(response.body.message).toBe('Validation: You must pass in an X (Twitter) access token!');
	});

	test('Successful request returns user stats', async () => {
		const response = await request(app).get('/userStats?ticker=TICKER&epoch=1&x_access_token=token');
		expect(response.status).toBe(StatusCodes.OK);
		expect(response.body.status).toBe('success');
		expect(response.body.data.stats).toEqual(MockLeaderboardRows[0]);
	});
});
