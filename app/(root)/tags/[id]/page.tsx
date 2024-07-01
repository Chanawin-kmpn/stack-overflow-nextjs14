import QuestionCard from '@/components/cards/QuestionCard';
import NoResult from '@/components/shared/NoResult';
import Pagination from '@/components/shared/Pagination';
import LocalSearchbar from '@/components/shared/search/LocalSearchbar';
import { getQuestionsByTagId } from '@/lib/actions/tag.action';
import { URLProps } from '@/types';
import { Metadata, ResolvingMetadata } from 'next';

export async function generateMetadata(
	{ params, searchParams }: URLProps,
	parent: ResolvingMetadata
): Promise<Metadata> {
	const id = params.id;

	const result = await getQuestionsByTagId({
		tagId: id,
	});

	return {
		title: `${result.tagTitle} Tags | Devflows`,
	};
}

export default async function page({ params, searchParams }: URLProps) {
	const result = await getQuestionsByTagId({
		tagId: params.id,
		page: 1,
		searchQuery: searchParams.q,
	});

	// console.log(result);

	return (
		<>
			<h1 className="h1-bold text-dark100_light900">{result.tagTitle}</h1>

			<div className="mt-11 w-full">
				<LocalSearchbar
					route={`/tags/${params.id}`}
					iconPosition="left"
					imgSrc="/assets/icons/search.svg"
					placeholder="Search tag question"
					otherClasses="flex-1"
				/>
			</div>

			<div className="mt-10 flex w-full flex-col gap-6">
				{result?.questions.length > 0 ? (
					result?.questions.map((question: any) => (
						<QuestionCard
							key={question._id}
							_id={question._id}
							title={question.title}
							tags={question.tags}
							author={question.author}
							upvotes={question.upvotes}
							answers={question.answers}
							views={question.views}
							createdAt={question.createdAt}
						/>
					))
				) : (
					<NoResult
						title="There's no tag saved to show"
						description="Be the first to break the silence! 🚀 Ask a Question and kickstart the
				discussion. our query could be the next big thing others learn from. Get
				involved! 💡"
						link="/ask-question"
						linkTitle="Ask a Question"
					/>
				)}
			</div>
			<div className="mt-10">
				<Pagination
					pageNumber={searchParams?.page ? +searchParams.page : 1}
					isNext={result.isNext}
				/>
			</div>
		</>
	);
}
