import request from 'supertest';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { MockProjectConfig, MockRegisteredUser } from '../../mocks';
import { getProjectConfig } from '../index';
import { ProjectConfigModel } from '../../schema';

jest.mock('../../schema', () => ({
	ProjectConfigModel: {
		query: jest.fn(() => ({
			eq: jest.fn(() => ({
				limit: jest.fn(() => ({
					exec: jest.fn()
				}))
			}))
		}))
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

	test('should fail with null value', async () => {
		const modelQuery = ProjectConfigModel.query as jest.Mock;
		modelQuery.mockImplementationOnce(() => ({
			eq: () => ({
				limit: () => ({
					exec: null
				})
			})
		}));
		const response = await request(app).get(`/projectConfig?ticker=${MockProjectConfig.ticker}`);
		expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
		expect(response.body.status).toBe('error');
		expect(response.body.message).toBe('Error getting project configuration.');
	});

	test('should return project configuration for valid ticker', async () => {
		const modelQuery = ProjectConfigModel.query as jest.Mock;
		modelQuery.mockImplementationOnce(() => ({
			eq: () => ({
				limit: () => ({
					exec: jest.fn().mockResolvedValueOnce([MockProjectConfig])
				})
			})
		}));
		const response = await request(app).get(`/projectConfig?ticker=${MockProjectConfig.ticker}`);
		expect(response.status).toBe(StatusCodes.OK);
		expect(response.body.status).toBe('success');
		expect(response.body.data).toEqual(MockProjectConfig);
	});
});
