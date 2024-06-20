// import { Schema, models, model, Document } from 'mongoose';

// export interface IQuestion extends Document {
// 	title: string;
// 	content: string;
// 	tags: Schema.Types.ObjectId[]; // Connect to another model in our database
// 	views: number;
// 	upvoted: Schema.Types.ObjectId[]; // It's going to be an arrya of Object IDs to specific people that have viewed or upvoted that post
// 	downVoted: Schema.Types.ObjectId[];
// 	author: Schema.Types.ObjectId; // A single one because there acan only be one author that created that post
// 	answers: Schema.Types.ObjectId[]; // Meaning people how answer again idS of the answer
// 	createAt: Date;
// }

// const QuestionSchema = new Schema({
// 	title: { type: String, required: true },
// 	constent: { type: String, required: true },
// 	tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }], //* To contain each of tagId into array and a reference to a tag model
// 	views: { type: Number, default: 0 },
// 	upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }], //* An array of Ids of users that upvoted this question
// 	downvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }], //* An array of IDs of users that downvote this question
// 	author: { type: Schema.Types.ObjectId, ref: 'User' },
// 	answers: [{ type: Schema.Types.ObjectId, ref: 'Answer' }], //* An array of object IDs of answers
// 	createdAt: { type: Date, default: Date.now },
// });

// const Question = models.Question || model('Question', QuestionSchema); //* Once we have Question Schema, we can turn it into a model to models.Question if not we can created by saying modal, hold question is going to be based on the question schema

// export default Question;

import { Schema, models, model, Document } from 'mongoose';

export interface IQuestion extends Document {
	title: string;
	content: string;
	tags: Schema.Types.ObjectId[];
	views: number;
	upvotes: Schema.Types.ObjectId[];
	downvotes: Schema.Types.ObjectId[];
	author: Schema.Types.ObjectId;
	answers: Schema.Types.ObjectId[];
	createdAt: Date;
}

const QuestionSchema = new Schema({
	title: { type: String, required: true },
	content: { type: String, required: true },
	tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
	views: { type: Number, default: 0 },
	upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	downvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	author: { type: Schema.Types.ObjectId, ref: 'User' },
	answers: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
	createdAt: { type: Date, default: Date.now },
});

const Question = models.Question || model('Question', QuestionSchema);

export default Question;
