import Filter from '@/components/shared/Filter';
import LocalSearchbar from '@/components/shared/search/LocalSearchbar';
import { TagFilters } from '@/constants/filter';
import { getAllTags } from '@/lib/actions/tag.action';
import { SearchParamsProps } from '@/types';
import Link from 'next/link';
import React from 'react';

const page = async ({ searchParams }: SearchParamsProps) => {
	const result = await getAllTags({ searchQuery: searchParams.q });
	return (
		<>
			<div className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row">
				<h1 className="h1-bold text-dark100_light900">Tags</h1>
			</div>

			<div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
				<LocalSearchbar
					route="/tags"
					iconPosition="left"
					imgSrc="/assets/icons/search.svg"
					placeholder="Search by tag name..."
					otherClasses="flex-1"
				/>
				<Filter
					filters={TagFilters}
					otherClasses="min-h-[56px] sm:min-w-[170px]"
				/>
			</div>
			<section className="mt-12 flex flex-wrap gap-4">
				{result.tags.length > 0 ? (
					result.tags.map((tag) => (
						<Link key={tag._id} href={`/tags/${tag._id}`}>
							<article className="background-light900_dark200 light-border flex w-full flex-col rounded-2xl border px-8 py-10 sm:w-[260px]">
								<div className="background-light800_dark400 w-fit rounded-sm px-5 py-1.5">
									<p className="paragraph-semibold text-dark300_light900">
										{tag.name}
									</p>
								</div>

								<p className="small-medium text-dark400_light500 mt-3.5">
									<span className="body-semibold primary-text-gradient mr-2.5">
										{tag.questions.length}+
									</span>{' '}
									Questions
								</p>
							</article>
						</Link>
					))
				) : (
					<div>No tags result!</div>
				)}
			</section>
		</>
	);
};

export default page;
