'use client';
import { Button } from '@/components/ui/button';
import { GlobalSearchFilters } from '@/constants/filter';
import { formUrlQuery } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

const GlobalFilter = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const typeParams = searchParams.get('type');
	const [active, setActive] = useState(typeParams || '');

	const handleTypeClick = (item: string) => {
		if (active === item) {
			setActive('');
			const newUrl = formUrlQuery({
				params: searchParams.toString(),
				key: 'type',
				value: null,
			});
			router.push(newUrl, { scroll: false });
		} else {
			setActive(item);
			const newUrl = formUrlQuery({
				params: searchParams.toString(),
				key: 'type',
				value: item.toLowerCase(),
			});
			router.push(newUrl, { scroll: false });
		}
	};
	return (
		<div className="flex items-center gap-5 px-5">
			<p className="text-dark400_light900 body-medium">Type:</p>
			{GlobalSearchFilters.map((item) => (
				<Button
					className={`light-border-2 small-medium rounded-2xl bg-light-700 px-5 py-2 capitalize text-dark-400 hover:text-primary-500 dark:bg-dark-500 dark:text-light-800 dark:hover:text-primary-500 ${active === item.value ? 'bg-primary-500 text-light-900 hover:text-light-800 dark:bg-primary-500 dark:hover:text-light-800' : ''}`}
					key={item.name}
					value={item.value}
					onClick={() => handleTypeClick(item.value)}
				>
					{item.name}
				</Button>
			))}
		</div>
	);
};

export default GlobalFilter;
