'use server';

import { FilterQuery } from 'mongoose';
import User from '@/database/user.model';
import { connectToDatabase } from '../mongoose';
import {
	CreateUserParams,
	DeleteUserParams,
	GetAllUsersParams,
	GetSavedQuestionsParams,
	GetUserByIdParams,
	GetUserStatsParams,
	ToggleSaveQuestionParams,
	UpdateUserParams,
} from './shared.teypes';
import { revalidatePath } from 'next/cache';
import Question from '@/database/question.model';
import Tag from '@/database/tag.model';
import Answer from '@/database/answer.model';

export async function getUserById(params: GetUserByIdParams) {
	try {
		connectToDatabase();

		const { userId } = params;

		const user = await User.findOne({ clerkId: userId });
		return user;
	} catch (error) {
		console.log(error);
		throw error;
	}
}

export async function createUser(userDate: CreateUserParams) {
	try {
		connectToDatabase();

		const newUser = await User.create(userDate);
		return newUser;
	} catch (error) {
		console.log(error);
		throw error;
	}
}

export async function deleteUser(params: DeleteUserParams) {
	try {
		connectToDatabase();

		const { clerkId } = params;

		const user = await User.findOneAndDelete({ clerkId });

		if (!user) {
			throw new Error('User not found');
		}

		// Delete user from database
		// and questions, answers, comments, etc

		// get user question ids

		// const userQuestionIds = await Question.find({ author: user._id }).distinct(
		// 	'_id'
		// );

		// Delete user question
		await Question.deleteMany({ author: user._id });

		const deletedUser = await User.findByIdAndDelete(user._id);

		return deletedUser;
	} catch (error) {
		console.log(error);
		throw error;
	}
}

export async function getAllUsers(params: GetAllUsersParams) {
	try {
		connectToDatabase();

		const { filter, page = 1, pageSize = 10, searchQuery } = params;

		const query: FilterQuery<typeof User> = {};

		const skipAmount = (page - 1) * pageSize;

		let sortOptions = {};

		switch (filter) {
			case 'new_users':
				sortOptions = { joinedAt: -1 };
				break;
			case 'old_users':
				sortOptions = { joinedAt: 1 };
				break;
			case 'top_contributors':
				sortOptions = { reputation: -1 };
				break;
			default:
				break;
		}

		if (searchQuery) {
			query.$or = [
				{ name: { $regex: new RegExp(searchQuery, 'i') } },
				{ username: { $regex: new RegExp(searchQuery, 'i') } },
			];
		}

		const users = await User.find(query)
			.skip(skipAmount)
			.limit(pageSize)
			.sort(sortOptions);

		const totalUser = await User.countDocuments(query);

		const isNext = totalUser > skipAmount + users.length;

		return { users, isNext };
	} catch (error) {
		console.log(error);
		throw error;
	}
}

export async function toggleSaveQuestion(params: ToggleSaveQuestionParams) {
	try {
		connectToDatabase();

		const { userId, questionId, path } = params;

		const user = await User.findById(userId);

		if (!user) {
			throw new Error('User not found');
		}

		const isQuestionSaved = user.saved.includes(questionId);

		if (isQuestionSaved) {
			await User.findByIdAndUpdate(
				userId,
				{ $pull: { saved: questionId } },
				{ new: true }
			);
		} else {
			await User.findByIdAndUpdate(
				userId,
				{ $push: { saved: questionId } },
				{ new: true }
			);
		}

		revalidatePath(path);
	} catch (error) {
		console.log(error);
		throw error;
	}
}

export async function getSavedQuestions(params: GetSavedQuestionsParams) {
	try {
		connectToDatabase();

		const { clerkId, searchQuery, page = 1, pageSize = 3, filter } = params;

		const query: FilterQuery<typeof Question> = searchQuery
			? { title: { $regex: new RegExp(searchQuery, 'i') } }
			: {};

		const skipAmount = (page - 1) * pageSize;

		let sortOptions = {};

		switch (filter) {
			case 'most_recent':
				sortOptions = { createdAt: -1 };
				break;
			case 'oldest':
				sortOptions = { createdAt: 1 };
				break;
			case 'most_voted':
				sortOptions = { upvotes: -1 };
				break;
			case 'most_viewd':
				sortOptions = { views: -1 };
				break;
			case 'most_answered':
				sortOptions = { answers: -1 };
				break;
			default:
				break;
		}
		const user = await User.findOne({ clerkId }).populate({
			path: 'saved',
			match: query,
			options: {
				sort: sortOptions,
				skip: skipAmount,
				limit: pageSize + 1,
			},
			populate: [
				{ path: 'tags', model: Tag, select: '_id name' },
				{ path: 'author', model: User, select: '_id clerkId name picture' },
			],
		});

		if (!user) {
			throw new Error('User not found');
		}

		const isNext = user.saved.length > pageSize;

		const savedQuestion = user.saved;

		return { questions: savedQuestion, isNext };
	} catch (error) {
		console.log(error);
		throw error;
	}
}

export async function getUserInfo(params: GetUserByIdParams) {
	try {
		connectToDatabase();

		const { userId } = params;

		const user = await User.findOne({ clerkId: userId });

		if (!user) {
			console.log('User not found!');
		}

		console.log(user);
		const totalQuestions = await Question.countDocuments({ author: user._id });
		const totalAnswers = await Answer.countDocuments({ author: user._id });

		return {
			user,
			totalQuestions,
			totalAnswers,
		};
	} catch (error) {
		console.log(error);
		throw error;
	}
}

export async function getUserQuestions(params: GetUserStatsParams) {
	try {
		connectToDatabase();

		const { userId, page = 1, pageSize = 10 } = params;

		const skipAmount = (page - 1) * pageSize;

		const totalQuestions = await Question.countDocuments({ author: userId });

		const userQuestion = await Question.find({ author: userId })
			.skip(skipAmount)
			.limit(pageSize)
			.sort({ views: -1, upvotes: -1 })
			.populate({ path: 'tags', model: Tag, select: '_id name' })
			.populate({ path: 'author', select: '_id clerkId name picture' });

		const isNext = totalQuestions > skipAmount + userQuestion.length;
		return { totalQuestions, questions: userQuestion, isNext };
	} catch (error) {
		console.log(error);
		throw error;
	}
}

export async function getUserAnswers(params: GetUserStatsParams) {
	try {
		connectToDatabase();

		const { userId, page = 1, pageSize = 10 } = params;

		const skipAmount = (page - 1) * pageSize;

		const totalAnswers = await Answer.countDocuments({ author: userId });

		const userAnswers = await Answer.find({ author: userId })
			.skip(skipAmount)
			.limit(pageSize)
			.sort({ upvotes: -1 })
			.populate({ path: 'question', select: '_id title' })
			.populate({ path: 'author', select: '_id clerkId name picture' });

		const isNext = totalAnswers > skipAmount + userAnswers.length;
		return { totalAnswers, answers: userAnswers, isNext };
	} catch (error) {
		console.log(error);
		throw error;
	}
}

export async function updateUser(params: UpdateUserParams) {
	try {
		connectToDatabase();

		const { clerkId, updateData, path } = params;

		await User.findOneAndUpdate({ clerkId }, updateData, { new: true });

		revalidatePath(path);
	} catch (error) {
		console.log(error);
		throw error;
	}
}

// export async function getAllUser(params: GetAllUsersParams) {
// 	try {
// 		connectToDatabase();

// 	} catch (error) {
// 		console.log(error);
// 		throw error;
// 	}
// }
