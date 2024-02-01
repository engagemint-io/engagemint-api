import request from 'supertest';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import csvParser from 'csv-parser';

import { MockLeaderboardRows, MockProjectConfig } from '../../mocks';
import { getLeaderboardCsv } from '../index';
import {
	LeaderboardFavoritePointsKey, LeaderboardLastUpdatedAtKey, LeaderboardQuotePointsKey, LeaderboardRetweetPointsKey,
	LeaderboardTickerEpochCompositeKey,
	LeaderboardTotalPointsKey,
	LeaderboardUserAccountIdKey, LeaderboardVideoViewPointsKey, LeaderboardViewPointsKey
} from '../../schema';

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

jest.mock('../../schema/project', () => ({
	...jest.requireActual('../../schema/project'),
	ProjectConfigModel: {
		...jest.requireActual('../../schema/project').ProjectConfigModel,
		query: () => ({
			eq: () => ({
				limit: () => ({
					exec: jest.fn().mockResolvedValue(MockProjectConfig)
				})
			})
		})
	}
}));

// Set up an express router with the /leaderboard route
const app = express();
const router = express.Router();
router.get('/leaderboardCsv', getLeaderboardCsv);
app.use('/', router);

describe('PARAMETER_VALIDATION: /leaderboardCsv', () => {
	test('GET /leaderboardCsv with no query params returns 400', async () => {
		const response = await request(app).get('/leaderboardCsv');

		expect(response.status).toBe(StatusCodes.BAD_REQUEST);
	});

	test('GET /leaderboardCsv with just ticker should fail', async () => {
		const response = await request(app).get('/leaderboardCsv?ticker=CLIFF');

		expect(response.status).toBe(StatusCodes.BAD_REQUEST);
	});

	test('GET /leaderboardCsv with just epoch should fail', async () => {
		const response = await request(app).get('/leaderboardCsv?epoch=2');

		expect(response.status).toBe(StatusCodes.BAD_REQUEST);
	});

	test('GET /leaderboardCsv with just signature should fail', async () => {
		const response = await request(app).get('/leaderboardCsv?signature=1234');

		expect(response.status).toBe(StatusCodes.BAD_REQUEST);
	});
});

describe('LOGIC_VALIDATION: /leaderboardCsv', () => {
	test('GET /leaderboardCsv with valid request returns CSV', async () => {
		const signature ='{\n' +
			'    "pub_key": {\n' +
			'        "type": "tendermint/PubKeySecp256k1",\n' +
			'        "value": "A9OBlQaR2NfGfaHkL/fHi59kl0lUm3grF3KF8UOjltOz"\n' +
			'    },\n' +
			'    "signature": "B/RaaP030PPgePo0W7nELPt3XQGZjfQHF5Pfl1O9CqNGboFzv+HtaxKsMECX9ZQsh8XibomgpoL5g4HEUIOt0g=="\n' +
			'}'
		const base64encodedSignature = Buffer.from(signature).toString('base64');
		const response = await request(app).get('/leaderboardCsv?ticker=CLIFF&epoch=2&message=Requesting%20leaderboard%20download%20for%20epoch%20X&signature=' + base64encodedSignature);

		expect(response.status).toBe(StatusCodes.OK);
		expect(response.type).toBe('text/csv');
		expect(response.header['content-disposition']).toBe('attachment; filename="leaderboard.csv"');

		// Convert the CSV content to a stream
		const csvStream = require('stream').Readable.from(response.text);

		// Parse the CSV
		const rows: any[] = [];
		csvStream.pipe(csvParser()).on('data', (row: any) => {
			rows.push(row);
		}).on('end', () => {
			// Check the headers
			const headers = Object.keys(rows[0]);
			expect(headers).toEqual([
				LeaderboardTickerEpochCompositeKey,
				LeaderboardTotalPointsKey,
				LeaderboardUserAccountIdKey,
				LeaderboardLastUpdatedAtKey,
				LeaderboardViewPointsKey,
				LeaderboardVideoViewPointsKey,
				LeaderboardFavoritePointsKey,
				LeaderboardRetweetPointsKey,
				LeaderboardQuotePointsKey
			]);

			// Check the first row
			const firstRow = rows[0];
			expect(firstRow[LeaderboardTickerEpochCompositeKey]).toEqual(MockLeaderboardRows[0][LeaderboardTickerEpochCompositeKey]);
			expect(Number(firstRow[LeaderboardTotalPointsKey])).toEqual(MockLeaderboardRows[0][LeaderboardTotalPointsKey]);
			expect(firstRow[LeaderboardLastUpdatedAtKey]).toEqual(MockLeaderboardRows[0][LeaderboardLastUpdatedAtKey]);
			expect(firstRow[LeaderboardUserAccountIdKey]).toEqual(MockLeaderboardRows[0][LeaderboardUserAccountIdKey]);
			expect(Number(firstRow[LeaderboardViewPointsKey])).toEqual(MockLeaderboardRows[0][LeaderboardViewPointsKey]);
			expect(Number(firstRow[LeaderboardVideoViewPointsKey])).toEqual(MockLeaderboardRows[0][LeaderboardVideoViewPointsKey]);
			expect(Number(firstRow[LeaderboardFavoritePointsKey])).toEqual(MockLeaderboardRows[0][LeaderboardFavoritePointsKey]);
			expect(Number(firstRow[LeaderboardRetweetPointsKey])).toEqual(MockLeaderboardRows[0][LeaderboardRetweetPointsKey]);
			expect(Number(firstRow[LeaderboardQuotePointsKey])).toEqual(MockLeaderboardRows[0][LeaderboardQuotePointsKey]);

			// Check the number of rows
			expect(rows.length).toBe(MockLeaderboardRows.length);

		});
	});
});
