'use server';

import Question from '@/database/question.model';
import { connectToDatabase } from '../mongoose';
import { ViewQuestionParams } from './shared.teypes';
import Interaction from '@/database/interaction.model';

export async function viewQuestion(params: ViewQuestionParams) {
	// สร้าง function เพื่อนำไปใช้กับส่วนต่างๆที่ทำให้เกิด view นั้นขึ้น
	try {
		await connectToDatabase();

		const { questionId, userId } = params;

		// Update view count for the question

		await Question.findByIdAndUpdate(questionId, { $inc: { views: 1 } });

		// Get the existing information by these criteria
		if (userId) {
			const existingInteraction = await Interaction.findOne({
				user: userId,
				action: 'view',
				question: questionId,
			});

			if (existingInteraction) return console.log('Usre has already viewd');

			await Interaction.create({
				user: userId,
				action: 'view',
				question: questionId,
			});
		}
	} catch (error) {
		console.log(error);
	}
}
