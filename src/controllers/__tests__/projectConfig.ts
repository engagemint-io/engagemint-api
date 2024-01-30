import request from 'supertest';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { MockProjectConfig } from '../../mocks';
import { getProjectConfig } from '../index';

// Mock ProjectConfigModel.query().eq().limit().exec()
jest.mock('../../schema', () => ({
	ProjectConfigModel: {
		query: () => ({
			eq: () => ({
				limit: () => ({
					exec: jest.fn().mockResolvedValue(MockProjectConfig)
				})
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

	test('should fail with no ticker', async () => {
		const response = await request(app).get(`/projectConfig`);
		expect(response.status).toBe(StatusCodes.BAD_REQUEST);
		expect(response.body.status).toBe('fail');
		expect(response.body.message).toBe('Validation: You must pass a ticker!');
	});

	test('should return project configuration for valid ticker', async () => {
		const response = await request(app).get(`/projectConfig?ticker=${MockProjectConfig.ticker}`);
		expect(response.status).toBe(StatusCodes.OK);
		expect(response.body.status).toBe('success');
		expect(response.body.data).toEqual(MockProjectConfig);
	});
});
