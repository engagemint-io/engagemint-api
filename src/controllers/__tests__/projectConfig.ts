import request from 'supertest';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { MockProjectConfig } from '../../mocks';
import { ProjectConfigModel } from '../../schema';
import { getProjectConfig } from '../index';

// Mock ProjectConfigModel.query()
jest.mock('../../schema', () => ({
	...jest.requireActual('../../schema'),
	ProjectConfigModel: {
		...jest.requireActual('../../schema').ProjectConfigModel,
		query: () => ({
			eq: jest.fn().mockReturnValue({
				limit: jest.fn().mockResolvedValue(MockProjectConfig)
			})
		})
	}
}));

const app = express();
app.use(express.json());
app.get('/projectConfig', getProjectConfig);

describe('GET /projectConfig', () => {
	test('should fail without ticker', async () => {
		const response = await request(app).get('/projectConfig');
		expect(response.status).toBe(StatusCodes.BAD_REQUEST);
		expect(response.body.status).toBe('fail');
		expect(response.body.message).toBe('Validation: You must pass a ticker!');
	});

	// test('should return project configuration for valid ticker', async () => {
	// 	const response = await request(app).get(`/projectConfig?ticker=${MockProjectConfig.ticker}`);
	// 	expect(response.status).toBe(StatusCodes.OK);
	// 	expect(response.body.status).toBe('success');
	// 	expect(response.body.data).toEqual(MockProjectConfig);
	// });
	//
	// test('should return internal server error on query failure', async () => {
	// 	// Mock failure scenario
	// 	ProjectConfigModel.query().eq.mockReturnValueOnce({
	// 		limit: () => Promise.reject(new Error('Database query failed'))
	// 	});
	//
	// 	const response = await request(app).get('/projectConfig?ticker=failingTicker');
	// 	expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
	// 	expect(response.body.status).toBe('error');
	// 	expect(response.body.message).toBe('Error getting project configuration.');
	// });
});
