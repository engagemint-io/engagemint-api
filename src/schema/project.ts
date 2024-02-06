import dynamoose from 'dynamoose';

export const PROJECT_CONFIG_TABLE_NAME = 'engagemint-project_configuration_table';

export const ProjectConfigTickerKey = 'ticker';
export const AdminWalletAddressKey = 'admin_wallet_address';

const EpochLengthDays = 'epoch_length_days';
const EpochStartDateUTC = 'epoch_start_date_utc';
const LikeMultiplier = 'like_multiplier';
const QuoteMultiplier = 'quote_multiplier';
const ReplyMultiplier = 'reply_multiplier';
const RetweetMultiplier = 'retweet_multiplier';
const VideoViewMultiplier = 'video_view_multiplier';
const ViewMultiplier = 'view_multiplier';
const AdminWalletAddress = 'admin_wallet_address';
const PreDefinedTweetText = 'pre_defined_tweet_text';

export const ProjectConfigModel = dynamoose.model(
	PROJECT_CONFIG_TABLE_NAME,
	{
		[ProjectConfigTickerKey]: {
			type: String,
			hashKey: true
		},
		[EpochLengthDays]: Number,
		[AdminWalletAddress]: String,
		[EpochStartDateUTC]: String,
		[LikeMultiplier]: Number,
		[QuoteMultiplier]: Number,
		[ReplyMultiplier]: Number,
		[RetweetMultiplier]: Number,
		[VideoViewMultiplier]: Number,
		[ViewMultiplier]: Number,
		[PreDefinedTweetText]: String
	},
	{ create: false }
);
