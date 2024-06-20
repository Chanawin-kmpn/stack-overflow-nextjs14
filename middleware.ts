import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
	'/',
	'/ask-question(.*)',
	'/api/webhook',
	'question/:id',
	'/tags',
	'/tags/:id',
	'/profile/:id',
	'/community',
	'/jobs',
]);

export default clerkMiddleware((auth, req) => {
	if (isProtectedRoute(req)) auth().protect();
});

export const config = {
	matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
