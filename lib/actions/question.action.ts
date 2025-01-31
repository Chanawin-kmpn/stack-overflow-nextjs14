'use server';

import Question from '@/database/question.model';
import { connectToDatabase } from '../mongoose';
import Tag from '@/database/tag.model';
import {
	CreateQuestionParams,
	DeleteQuestionParams,
	EditQuestionParams,
	GetQuestionByIdParams,
	GetQuestionsParams,
	QuestionVoteParams,
	RecommendedParams,
} from './shared.teypes';
import User from '@/database/user.model';
import { revalidatePath } from 'next/cache';
import Answer from '@/database/answer.model';
import Interaction from '@/database/interaction.model';
import { FilterQuery } from 'mongoose';

export async function getQuestions(params: GetQuestionsParams) {
	try {
		connectToDatabase();

		const { searchQuery, page = 1, pageSize = 10, filter } = params;

		const query: FilterQuery<typeof Question> = {};

		const skipAmount = (page - 1) * pageSize;

		let sortOptions = {};

		switch (filter) {
			case 'newest':
				sortOptions = { createdAt: -1 };
				break;
			case 'frequent':
				sortOptions = { views: -1 };
				break;
			case 'unanswered':
				query.answers = { $size: 0 };
				break;
			default:
				break;
		}

		if (searchQuery) {
			query.$or = [
				{ title: { $regex: new RegExp(searchQuery, 'i') } },
				{ content: { $regex: new RegExp(searchQuery, 'i') } },
			];
		}

		const questions = await Question.find(query)
			.populate({
				path: 'tags',
				model: Tag,
			})
			.populate({ path: 'author', model: User })
			.skip(skipAmount)
			.limit(pageSize)
			.sort(sortOptions);

		const totalQuestion = await Question.countDocuments(query);

		const isNext = totalQuestion > skipAmount + questions.length;

		return { questions, isNext };
	} catch (error) {
		console.log(error);
		throw error;
	}
}

export async function createQuestion(params: CreateQuestionParams) {
	// eslint-disable-next-line no-empty
	try {
		// connect to db
		connectToDatabase();

		const { title, content, tags, author, path } = params;

		// Create the question
		const question = await Question.create({
			title,
			content,
			author,
		});

		const tagDocuments = [];

		// Create the tags or get them if they already exist

		for (const tag of tags) {
			const existingTag = await Tag.findOneAndUpdate(
				{ name: { $regex: new RegExp(`^${tag}$`, 'i') } }, // find the tag regardless of uppercase or lowercase
				{ $setOnInsert: { name: tag }, $push: { questions: question._id } }, // * $setOnInsert: { name: tag } If a new document is created (i.e., the tag does not already exist), this sets the name field of the new tag to tag. //  $push: { questions: question._id } This adds question._id to the questions array field of the tag, associating the question with the tag.
				{ upsert: true, new: true } //* upsert: true: This option ensures that if the tag doesn't exist, a new tag document will be created. // *new: true: This returns the modified document rather than the original document.
			);

			tagDocuments.push(existingTag._id);
		}

		await Question.findByIdAndUpdate(question._id, {
			$push: { tags: { $each: tagDocuments } },
		});

		// Create an interaction record for the user's ask_question action
		await Interaction.create({
			user: author,
			action: 'ask_question',
			question: question._id,
			tags: tagDocuments,
		});

		await User.findByIdAndUpdate(author, { $inc: { reputation: 5 } });

		revalidatePath(path);
	} catch (error) {
		console.log(error);
	}
}

export async function getQuestionById(params: GetQuestionByIdParams) {
	try {
		connectToDatabase();

		const { questionId } = params;

		const question = await Question.findById(questionId)
			.populate({
				path: 'tags',
				model: Tag,
				select: '_id name',
			}) //* populate คือการดึงข้อมูลมาจาก document จาก collection อื่นที่ปัจจุบันมีแค่ Object(id) โดยที่ path ก็คือ field ที่ต้องการเลือกและอ้างอิง model จากนั้นก็เลือก field จาก document ของ collection model ที่เลือก
			.populate({
				path: 'author',
				model: User,
				select: '_id clerkId name picture',
			});

		return question;
	} catch (error) {
		console.log(error);
		throw error;
	}
}

export async function upvoteQuestion(params: QuestionVoteParams) {
	try {
		connectToDatabase();

		const { questionId, userId, hasupVoted, hasdownVoted, path } = params;
		let updateQuery = {};

		if (hasupVoted) {
			updateQuery = { $pull: { upvotes: userId } };
		} else if (hasdownVoted) {
			updateQuery = {
				$pull: { downvotes: userId },
				$push: { upvotes: userId },
			};
		} else {
			updateQuery = { $addToSet: { upvotes: userId } };
		}

		const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
			new: true,
		});

		if (!question) {
			throw new Error('Question not found');
		}

		// Increment author's reputation by +1/-1 for upvoting/revoking an upvote to the question
		// เพิ่มค่า reputation ของคน vote +1 ถ้ากด vote
		await User.findByIdAndUpdate(userId, {
			$inc: { reputation: hasupVoted ? -1 : 1 },
		});

		// Increment author's reputation by +10/-10 for recieving an upvote/downvote to the question
		// เพิ่มค่า reputation ของคนผู้เขียน question +10 ถ้ากด vote
		await User.findByIdAndUpdate(question.author, {
			$inc: { reputation: hasupVoted ? -10 : 10 },
		});

		revalidatePath(path);
	} catch (error) {
		console.log(error);
		throw error;
	}
}

export async function downvoteQuestion(params: QuestionVoteParams) {
	try {
		connectToDatabase();

		const { questionId, userId, hasupVoted, hasdownVoted, path } = params;

		let updateQuery = {};

		if (hasdownVoted) {
			updateQuery = {
				$pull: { downvotes: userId },
			}; //* if user click downvote button it undo to undownvote
		} else if (hasupVoted) {
			updateQuery = {
				$pull: { upvotes: userId },
				$push: { downvotes: userId },
			}; //* if user has already upvoted and click downvote it will unupvote and going to downvote
		} else {
			updateQuery = { $addToSet: { downvotes: userId } };
		} //* if user downvotes for the first time, it will add the downvote to the document

		const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
			new: true,
		});

		if (!question) {
			throw new Error('Question not found');
		}

		// Increment author's reputation
		await User.findByIdAndUpdate(userId, {
			$inc: { reputation: hasdownVoted ? -2 : 2 },
		});

		await User.findByIdAndUpdate(question.author, {
			$inc: { reputation: hasdownVoted ? -10 : 10 },
		});

		revalidatePath(path);
	} catch (error) {
		console.log(error);
		throw error;
	}
}

export async function deleteQuestion(params: DeleteQuestionParams) {
	try {
		connectToDatabase();

		const { questionId, path } = params;

		await Question.deleteOne({ _id: questionId });
		await Answer.deleteMany({ question: questionId });
		await Interaction.deleteMany({ question: questionId });
		await Tag.updateMany(
			{ question: questionId },
			{ $pull: { question: questionId } }
		);

		revalidatePath(path);
	} catch (error) {
		console.log(error);
		throw error;
	}
}

export async function editQuestion(params: EditQuestionParams) {
	try {
		connectToDatabase();

		const { questionId, title, content, path } = params;

		const question = await Question.findById(questionId).populate('tags');

		if (!question) {
			console.log('Question not found');
		}

		question.title = title;
		question.content = content;

		await question.save();

		revalidatePath(path);
	} catch (error) {
		console.log(error);
		throw error;
	}
}

export async function getHotQuestions(params: GetQuestionsParams) {
	try {
		connectToDatabase();

		const hotQuestion = await Question.find({})
			.sort({ views: -1, upvotes: -1 })
			.limit(5);

		return hotQuestion;
	} catch (error) {
		console.log(error);
		throw error;
	}
}

export async function getRecommendedQuestions(params: RecommendedParams) {
	try {
		connectToDatabase();

		const { userId, page = 1, pageSize = 10, searchQuery } = params;

		// Find user
		const user = await User.findOne({ clerkId: userId });

		if (!user) {
			throw new Error('User not found');
		}

		const skipAmount = (page - 1) * pageSize;

		// Find the user's interactions
		const userInteractions = await Interaction.find({ user: user._id })
			.populate('tags')
			.exec();

		// Extract tags from user's interactions

		const userTags = userInteractions.reduce((tags, interaction) => {
			if (interaction.tags) {
				tags = tags.concat(interaction.tags);
			}
			return tags;
		}, []);

		// Get distinct tag IDs from user's interactions
		const distinctUserTagIds = [
			// @ts-ignore
			...new Set(userTags.map((tag: any) => tag._id)),
		];

		const query: FilterQuery<typeof Question> = {
			$and: [
				{ tags: { $in: distinctUserTagIds } }, // Questions with user's tags
				{ author: { $ne: user._id } }, // Exclude user's own questions
			],
		};

		if (searchQuery) {
			query.$or = [
				{ title: { $regex: searchQuery, $options: 'i' } },
				{ content: { $regex: searchQuery, $options: 'i' } },
			];
		}

		const totalQuestions = await Question.countDocuments(query);

		const recommendedQuestions = await Question.find(query)
			.populate({
				path: 'tags',
				model: Tag,
			})
			.populate({
				path: 'author',
				model: User,
			})
			.skip(skipAmount)
			.limit(pageSize);

		const isNext = totalQuestions > skipAmount + recommendedQuestions.length;

		return { questions: recommendedQuestions, isNext };
	} catch (error) {
		console.error('Error getting recommended questions:', error);
		throw error;
	}
}
