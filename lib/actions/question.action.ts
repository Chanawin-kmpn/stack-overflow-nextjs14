'use server';

import Question from '@/database/question.model';
import { connectToDatabase } from '../mongoose';
import Tag from '@/database/tag.model';
import { CreateQuestionParams, GetQuestionsParams } from './shared.teypes';
import User from '@/database/user.model';
import { revalidatePath } from 'next/cache';

export async function getQuestions(params: GetQuestionsParams) {
	try {
		connectToDatabase();

		const questions = await Question.find({})
			.populate({
				path: 'tags',
				model: Tag,
			})
			.populate({ path: 'author', model: User })
			.sort({ createdAt: -1 });

		return { questions };
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

		revalidatePath(path);
	} catch (error) {
		console.log(error);
	}
}