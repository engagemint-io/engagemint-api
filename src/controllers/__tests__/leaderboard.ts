import request from 'supertest';
import express from 'express';
import { getLeaderboard } from '../index';
import { StatusCodes } from 'http-status-codes';
import {
	LeaderboardFavoritePointsKey,
	LeaderboardQuotePointsKey,
	LeaderboardRetweetPointsKey,
	LeaderboardTickerEpochCompositeKey,
	LeaderboardTotalPointsKey,
	LeaderboardUserAccountIdKey,
	LeaderboardVideoViewPointsKey,
	LeaderboardViewPointsKey
} from '../../schema';
import { MockLeaderboardRows } from '../../mocks';

// Mock the LeaderboardModel.query() function to return a mock response instead of actually querying the database
jest.mock('../../schema/leaderboard', () => ({
	...jest.requireActual('../../schema/leaderboard'),
	LeaderboardModel: {
		...jest.requireActual('../../schema/leaderboard').LeaderboardModel,
		query: () => ({
			eq: () => ({
				limit: () => ({
					exec: jest.fn().mockResolvedValue(MockLeaderboardRows)
				})
			})
		})
	}
}));

// Set up an express router with the /leaderboard route
const app = express();
const router = express.Router();
router.get('/leaderboard', getLeaderboard);
app.use('/', router);

describe('PARAMETER_VALIDATION: /leaderboard', () => {
	test('GET /leaderboard with no query params returns 400', async () => {
		const response = await request(app).get('/leaderboard');

		expect(response.status).toBe(StatusCodes.BAD_REQUEST);
	});

	test('GET /leaderboard with just ticker should fail', async () => {
		const response = await request(app).get('/leaderboard?ticker=CLIFF');

		expect(response.status).toBe(StatusCodes.BAD_REQUEST);
	});

	test('GET /leaderboard with too high limit should fail', async () => {
		const response = await request(app).get('/leaderboard?ticker=CLIFF&epoch=1&limit=201');

		expect(response.status).toBe(StatusCodes.BAD_REQUEST);
	});
});

describe('LOGIC_VALIDATION: /leaderboard', () => {
	test('GET /leaderboard with valid request returns items', async () => {
		const response = await request(app).get('/leaderboard?ticker=CLIFF&epoch=2');

		expect(response.status).toBe(StatusCodes.OK);

		const { status, data } = response.body;

		expect(status).toBe('success');
		expect(data).toBeDefined();

		// Full test on first item in array
		const firstItem = data[0];

		expect(firstItem).toBeDefined();

		expect(firstItem[LeaderboardTickerEpochCompositeKey]).toBeDefined();
		expect(firstItem[LeaderboardTickerEpochCompositeKey]).toBe(MockLeaderboardRows[0][LeaderboardTickerEpochCompositeKey]);

		expect(firstItem[LeaderboardTotalPointsKey]).toBeDefined();
		expect(firstItem[LeaderboardTotalPointsKey]).toBe(MockLeaderboardRows[0][LeaderboardTotalPointsKey]);

		expect(firstItem[LeaderboardUserAccountIdKey]).toBeDefined();
		expect(firstItem[LeaderboardUserAccountIdKey]).toBe(MockLeaderboardRows[0][LeaderboardUserAccountIdKey]);

		expect(firstItem[LeaderboardViewPointsKey]).toBeDefined();
		expect(firstItem[LeaderboardViewPointsKey]).toBe(MockLeaderboardRows[0][LeaderboardViewPointsKey]);

		expect(firstItem[LeaderboardVideoViewPointsKey]).toBeDefined();
		expect(firstItem[LeaderboardVideoViewPointsKey]).toBe(MockLeaderboardRows[0][LeaderboardVideoViewPointsKey]);

		expect(firstItem[LeaderboardFavoritePointsKey]).toBeDefined();
		expect(firstItem[LeaderboardFavoritePointsKey]).toBe(MockLeaderboardRows[0][LeaderboardFavoritePointsKey]);

		expect(firstItem[LeaderboardRetweetPointsKey]).toBeDefined();
		expect(firstItem[LeaderboardRetweetPointsKey]).toBe(MockLeaderboardRows[0][LeaderboardRetweetPointsKey]);

		expect(firstItem[LeaderboardQuotePointsKey]).toBeDefined();
		expect(firstItem[LeaderboardQuotePointsKey]).toBe(MockLeaderboardRows[0][LeaderboardQuotePointsKey]);

		expect(data.length).toBe(MockLeaderboardRows.length);

		// Fuzzy check the last item in the array
		const lastItem = data[data.length - 1];
		expect(lastItem).toBeDefined();
		expect(lastItem[LeaderboardTickerEpochCompositeKey]).toBeDefined();
		expect(lastItem[LeaderboardTickerEpochCompositeKey]).toBe(MockLeaderboardRows[MockLeaderboardRows.length - 1][LeaderboardTickerEpochCompositeKey]);
	});
});
