'use client';
import { sidebarLinks } from '@/constants';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { usePathname } from 'next/navigation';
import { SignedOut, useAuth } from '@clerk/nextjs';
import { Button } from '../ui/button';

const LeftSidebar = () => {
	const { userId } = useAuth();
	const pathName = usePathname();
	return (
		<section className="background-light900_dark200 light-border custom-scrollbar sticky left-0 top-0 flex h-screen flex-col justify-between overflow-y-auto border-r p-6 pt-36 shadow-light-300 dark:shadow-none max-sm:hidden lg:w-[266px]">
			<div className="flex flex-1 flex-col gap-6">
				{sidebarLinks.map((link) => {
					const isActive =
						(pathName.includes(link.route) && link.route.length > 1) ||
						pathName === link.route;

					if (link.route === '/profile') {
						if (userId) {
							link.route = `${link.route}/${userId}`;
						} else {
							return null;
						}
					}
					return (
						<Link
							key={link.label}
							href={link.route}
							className={`${isActive ? 'primary-gradient rounded-lg text-light-900' : 'text-dark300_light900'} flex items-center justify-start gap-4 bg-transparent p-4`}
						>
							<Image
								src={link.imgURL}
								width={20}
								height={20}
								alt={`${link.label} link`}
								className={`${isActive ? '' : 'invert-colors'}`}
							/>
							<p
								className={`${isActive ? 'base-bold' : 'base-medium'} max-lg:hidden`}
							>
								{link.label}
							</p>
						</Link>
					);
				})}
			</div>
			<SignedOut>
				<div className="flex flex-col gap-3">
					<Link href="/sign-in">
						<Button className="small-medium btn-secondary min-h-[41px] w-full rounded-lg px-4 py-3 shadow-none">
							<Image
								src="/assets/icons/account.svg"
								alt="login"
								width={20}
								height={20}
								className="invert-colors lg:hidden"
							/>
							<span className="primary-text-gradient max-lg:hidden">
								Log In
							</span>
						</Button>
					</Link>

					<Link href="/sign-up">
						<Button className="small-medium btn-secondary min-h-[41px] w-full rounded-lg px-4 py-3 shadow-none">
							<Image
								src="/assets/icons/sign-up.svg"
								width={20}
								height={20}
								alt="sign-up"
								className="invert-colors lg:hidden"
							/>
							<span className="max-lg:hidden">Sign up</span>
						</Button>
					</Link>
				</div>
			</SignedOut>
		</section>
	);
};

export default LeftSidebar;
