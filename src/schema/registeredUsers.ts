import dynamoose from 'dynamoose';

export const REGISTERED_USERS_TABLE_NAME = 'engagemint-registered_users_table';

export const RegisteredUserTickerKey = 'ticker';
export const RegisteredUserTwitterIdKey = 'twitter_id';
export const RegisteredUserSeiWalletAddressKey = 'sei_wallet_address';

export const RegisteredUsersModel = dynamoose.model(
	REGISTERED_USERS_TABLE_NAME,
	{
		[RegisteredUserTickerKey]: { type: String, hashKey: true },
		[RegisteredUserTwitterIdKey]: { type: String, rangeKey: true },
		[RegisteredUserSeiWalletAddressKey]: String
	},
	{ create: false }
);
