'use client';
import { Input } from '@/components/ui/input';
import { formUrlQuery, removeKeysFromQuery } from '@/lib/utils';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface CustomInputProps {
	route: string;
	iconPosition: string;
	imgSrc: string;
	placeholder: string;
	otherClasses?: string;
}

const LocalSearchbar = ({
	route,
	iconPosition,
	imgSrc,
	placeholder,
	otherClasses,
}: CustomInputProps) => {
	const searchParams = useSearchParams();
	const query = searchParams.get('q');
	const [search, setSearch] = useState(query || '');
	const router = useRouter();
	const pathname = usePathname();
	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			if (search) {
				const newUrl = formUrlQuery({
					params: searchParams.toString(),
					key: 'q',
					value: search,
				});
				router.push(newUrl, { scroll: false });
			} else {
				if (pathname === route) {
					const newUrl = removeKeysFromQuery({
						params: searchParams.toString(),
						keysToRemove: ['q'],
					});
					router.push(newUrl, { scroll: false });
				}
			}
		}, 300);
		return () => clearTimeout(delayDebounceFn);
	}, [search, route, pathname, router, searchParams, query]);

	return (
		<div
			className={`background-light800_darkgradient relative flex min-h-[56px] grow items-center gap-1 rounded-xl px-4 ${otherClasses}`}
		>
			{iconPosition === 'left' && (
				<Image
					src="/assets/icons/search.svg"
					alt="search"
					width={24}
					height={24}
					className="cursor-pointer"
				/>
			)}

			<Input
				type="text"
				placeholder={placeholder}
				className="placeholder paragraph-regular no-focus text-dark400_light700 border-none bg-transparent shadow-none outline-none"
				value={search}
				onChange={(e) => setSearch(e.target.value)}
			/>

			{iconPosition === 'right' && (
				<Image
					src="/assets/icons/search.svg"
					alt="search"
					width={24}
					height={24}
					className="cursor-pointer"
				/>
			)}
		</div>
	);
};

export default LocalSearchbar;
