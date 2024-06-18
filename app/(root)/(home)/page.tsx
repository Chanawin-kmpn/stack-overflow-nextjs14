import QuestionCard from '@/components/cards/QuestionCard';
import HomeFilters from '@/components/home/HomeFilters';
import Filter from '@/components/shared/Filter';
import NoResult from '@/components/shared/NoResult';
import LocalSearchbar from '@/components/shared/search/LocalSearchbar';
import { Button } from '@/components/ui/button';
import { HomePageFilters } from '@/constants/filter';
import Link from 'next/link';

const questions = [
	{
		_id: 1,
		title:
			'Best practices for data fetching in a Next.js application with Server-Side Rendering (SSR)?',
		tags: [
			{
				_id: '1',
				name: 'nextjs',
			},
		],
		author: {
			_id: '1',
			name: 'Sujata',
			picture: '', // Assuming picture URL, leave it empty if not available
		},
		upVotes: 71,
		answers: [], // Placeholder empty object, replace with actual answer objects
		views: 780000,
		createdAt: new Date('2021-09-01T12:00:00.000Z'), // Adjust to actual creation date
	},
	{
		_id: 2,
		title: 'How to center using flexbox?',
		tags: [
			{
				_id: '1',
				name: 'css',
			},
		],
		author: {
			_id: '2',
			name: 'chanawin',
			picture: '', // Assuming picture URL, leave it empty if not available
		},
		upVotes: 7,
		answers: [], // Placeholder empty object, replace with actual answer objects
		views: 78,
		createdAt: new Date('2023-09-01T12:00:00.000Z'), // Adjust to actual creation date
	},
];

export default function Home() {
	return (
		<>
			<div className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row">
				<h1 className="h1-bold text-dark100_light900">All Question</h1>
				<Link href="/ask-question" className="mx-sm:w-full flex justify-end">
					<Button className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900">
						Ask a Question
					</Button>
				</Link>
			</div>

			<div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
				<LocalSearchbar
					route="/"
					iconPosition="left"
					imgSrc="/assets/icons/search.svg"
					placeholder="Search question..."
					otherClasses="flex-1"
				/>
				<Filter
					filters={HomePageFilters}
					otherClasses="min-h-[56px] sm:min-w-[170px]"
					containerClasses="hidden max-md:flex"
				/>
			</div>

			<HomeFilters />

			<div className="mt-10 flex w-full flex-col gap-6">
				{questions.length > 0 ? (
					questions.map((question) => (
						<QuestionCard
							key={question._id}
							_id={question._id}
							title={question.title}
							tags={question.tags}
							author={question.author}
							upVotes={question.upVotes}
							answers={question.answers}
							views={question.views}
							createdAt={question.createdAt}
						/>
					))
				) : (
					<NoResult
						title="There's no result to show"
						description="Be the first to break the silence! 🚀 Ask a Question and kickstart the
				discussion. our query could be the next big thing others learn from. Get
				involved! 💡"
						link="/ask-question"
						linkTitle="Ask a Question"
					/>
				)}
			</div>
		</>
	);
}
