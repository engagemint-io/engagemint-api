import dynamoose from 'dynamoose';

export const PROJECT_CONFIG_TABLE_NAME = 'engagemint-project_configuration_table';

export const ProjectConfigTickerKey = 'ticker';
const EpochLengthDays = 'epoch_length_days';
const EpochStartDateUTC = 'epoch_start_date_utc';
const LikeMultiplier = 'like_multiplier';
const QuoteMultiplier = 'quote_multiplier';
const RetweetMultiplier = 'retweet_multiplier';
const VideoViewMultiplier = 'video_view_multiplier';
const ViewMultiplier = 'view_multiplier';

export const ProjectConfigModel = dynamoose.model(PROJECT_CONFIG_TABLE_NAME, {
	[ProjectConfigTickerKey]: {
		type: String,
		hashKey: true
	},
	[EpochLengthDays]: Number,
	[EpochStartDateUTC]: String,
	[LikeMultiplier]: Number,
	[QuoteMultiplier]: Number,
	[RetweetMultiplier]: Number,
	[VideoViewMultiplier]: Number,
	[ViewMultiplier]: Number
});
