import { Router } from 'express';
import {
	getXAuthUrl,
	registerUser,
	getUserStats,
	getLeaderboard,
	getXExchangeCode,
	getProjectConfig,
	getLeaderboardCsv
} from '../controllers';

const apiRouter = Router();

// Get x (Twitter) login url
apiRouter.get('/x-auth-url', getXAuthUrl);

// Exchange code from x (Twitter) for access token
apiRouter.post('/x-exchange-code', getXExchangeCode);

// Return the leaderboard for a given ticker
apiRouter.get('/leaderboard', getLeaderboard);

// Return the leaderboard CSV for a given ticker
apiRouter.get('/leaderboardCsv', getLeaderboardCsv);

// Return the users position on the leaderboard
apiRouter.get('/user-stats', getUserStats);

// Return the users position on the leaderboard
apiRouter.get('/project-config', getProjectConfig);

// Register an x (Twitter) account with a ticker
apiRouter.post('/register', registerUser);

export default apiRouter;
