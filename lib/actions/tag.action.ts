'use server';

import User from '@/database/user.model';
import { connectToDatabase } from '../mongoose';
import {
	GetAllTagsParams,
	GetQuestionsByTagIdParams,
	GetTopInteractedTagsParams,
} from './shared.teypes';
import Tag, { ITag } from '@/database/tag.model';
import Question from '@/database/question.model';
import { FilterQuery } from 'mongoose';

export async function getTopInteractedTags(params: GetTopInteractedTagsParams) {
	try {
		connectToDatabase();

		const { userId } = params;
		const user = await User.findById(userId);

		if (!user) throw new Error('User not found');

		// Find interactions for the user and group by tags...

		return [
			{ _id: '1', name: 'tag1' },
			{ _id: '2', name: 'tag2' },
			{ _id: '3', name: 'tag3' },
		];
	} catch (error) {
		console.log(error);
		throw error;
	}
}

export async function getAllTags(params: GetAllTagsParams) {
	try {
		connectToDatabase();

		const { searchQuery } = params;

		const query: FilterQuery<typeof Tag> = searchQuery
			? { name: { $regex: new RegExp(searchQuery, 'i') } }
			: {};

		const tags = await Tag.find(query);

		return { tags };
	} catch (error) {
		console.log(error);
		throw new Error('No tag founded!');
	}
}

export async function getQuestionsByTagId(params: GetQuestionsByTagIdParams) {
	try {
		connectToDatabase();

		const { tagId, searchQuery, page = 1, pageSize = 10 } = params;

		const tagFilter: FilterQuery<ITag> = { _id: tagId };

		const tag = await Tag.findOne(tagFilter).populate({
			path: 'questions',
			model: Question,
			match: searchQuery
				? { title: { $regex: searchQuery, $options: 'i' } }
				: {},
			options: {
				sort: { createdAt: -1 },
			},
			populate: [
				{ path: 'tags', model: Tag, select: '_id name' },
				{ path: 'author', model: User, select: '_id clerkId name picture' },
			],
		});
		// populate อันนี้จะเป็นการดึงข้อมูลจาก path question ไม่ใช่จาก tag โดยตรง
		if (!tag) {
			console.log('Tag not found');
		}

		const questions = tag.questions;

		// console.log(tag.questions);

		return { tagTitle: tag.name, questions };
	} catch (error) {
		console.log(error);
		throw error;
	}
}

export async function getTopPopularTags(params: GetAllTagsParams) {
	try {
		connectToDatabase();

		const popularTags = await Tag.aggregate([
			{ $project: { name: 1, numberOfQuestion: { $size: '$questions' } } },
			{ $sort: { numberOfQuestion: -1 } },
			{ $limit: 5 },
		]);

		return popularTags;
	} catch (error) {
		console.log(error);
		throw error;
	}
}
