import request from 'supertest';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import csvParser from 'csv-parser';

import { MockLeaderboardRows, MockProjectConfig, MockProjectConfigWithInvalidAdminWallet } from '../../mocks';
import { getLeaderboardCsv } from '../index';
import {
	LeaderboardFavoritePointsKey, LeaderboardLastUpdatedAtKey, LeaderboardQuotePointsKey, LeaderboardRetweetPointsKey,
	LeaderboardTickerEpochCompositeKey,
	LeaderboardTotalPointsKey,
	LeaderboardUserAccountIdKey, LeaderboardVideoViewPointsKey, LeaderboardViewPointsKey, ProjectConfigModel
} from '../../schema';
import { MockSignature } from '../../mocks/signature';

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
					exec: mockProjectConfigModelQuery
				})
			})
		})
	}
}));

let mockProjectConfigModelQuery = jest.fn().mockResolvedValue(MockProjectConfig);

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
		const message = JSON.parse(response.text).message;
		expect(message).toBe('Validation: You must pass an epoch!');
	});

	test('GET /leaderboardCsv with ticker and epoch should fail', async () => {
		const response = await request(app).get('/leaderboardCsv?ticker=CLIFF&epoch=2');

		expect(response.status).toBe(StatusCodes.BAD_REQUEST);
		const message = JSON.parse(response.text).message;
		expect(message).toBe('Validation: You must pass a message!');
	});

	test('GET /leaderboardCsv with ticker, epoch, and message should fail', async () => {
		const response = await request(app).get('/leaderboardCsv?ticker=CLIFF&epoch=2&message=Requesting%20leaderboard%20download%20for%20epoch%20X');

		expect(response.status).toBe(StatusCodes.BAD_REQUEST);
		const message = JSON.parse(response.text).message;
		expect(message).toBe('Validation: You must pass a signature!');
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

	// Reused query params
	const message = 'Requesting leaderboard download for epoch X';
	const urlEncodedMessage = encodeURIComponent(message);
	const base64encodedSignature = Buffer.from(JSON.stringify(MockSignature)).toString('base64');

	test('GET /leaderboardCsv with valid request returns CSV', async () => {
		const url = `/leaderboardCsv?ticker=CLIFF&epoch=2&message=${urlEncodedMessage}&signature=${base64encodedSignature}`;

		const response = await request(app).get(url);
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

	test('GET /leaderboardCsv with invalid signature should fail', async () => {
		const invalidSignature = { ...MockSignature, signature: 'invalid_signature' };
		const base64encodedInvalidSignature = Buffer.from(JSON.stringify(invalidSignature)).toString('base64');
		const url = `/leaderboardCsv?ticker=CLIFF&epoch=2&message=${urlEncodedMessage}&signature=${base64encodedInvalidSignature}`;

		const response = await request(app).get(url);

		expect(response.status).toBe(StatusCodes.FORBIDDEN);
		expect(response.body).toEqual({ linked: false, reason: 'Signature is invalid.' });
	});

	test('GET /leaderboardCsv with invalid message should fail', async () => {
		const invalidMessage = 'Invalid message';
		const urlEncodedInvalidMessage = encodeURIComponent(invalidMessage);
		const url = `/leaderboardCsv?ticker=CLIFF&epoch=2&message=${urlEncodedInvalidMessage}&signature=${base64encodedSignature}`;

		const response = await request(app).get(url);

		expect(response.status).toBe(StatusCodes.FORBIDDEN);
		expect(response.body).toEqual({ linked: false, reason: 'Signature is invalid.' });
	});

	test('GET /leaderboardCsv with invalid epoch should fail', async () => {
		const url = `/leaderboardCsv?ticker=CLIFF&epoch=invalid_epoch&message=${urlEncodedMessage}&signature=${base64encodedSignature}`;

		const response = await request(app).get(url);

		expect(response.status).toBe(StatusCodes.BAD_REQUEST);
		expect(response.body).toEqual({ status: 'fail', message: 'Validation: Epoch must be a number!' });
	});

	test('GET /leaderboardCsv with invalid wallet should fail', async () => {
		const url = `/leaderboardCsv?ticker=CLIFF&epoch=2&message=${urlEncodedMessage}&signature=${base64encodedSignature}`;
		mockProjectConfigModelQuery = jest.fn().mockResolvedValue(MockProjectConfigWithInvalidAdminWallet);

		const response = await request(app).get(url);

		expect(response.status).toBe(StatusCodes.FORBIDDEN);
		expect(response.body).toEqual({ linked: false, reason: 'Signature is invalid.' });
	});

	test('GET /leaderboardCsv with ticker that does not belong to user should fail', async () => {
		const url = `/leaderboardCsv?ticker=INVALID_TICKER&epoch=2&message=${urlEncodedMessage}&signature=${base64encodedSignature}`;
		mockProjectConfigModelQuery = jest.fn().mockResolvedValue(MockProjectConfig);

		const response = await request(app).get(url);

		expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
		expect(response.body).toEqual({ linked: false, reason: 'Unauthorized to access ticker.' });
	});

});
