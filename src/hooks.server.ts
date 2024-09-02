import { client } from '$lib';
import type { Handle } from '@sveltejs/kit';
import { api } from './convex/_generated/api';
import type { Session, User } from './app';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionCookie = event.cookies.get('session');

	if (!sessionCookie) return await resolve(event);

	const sessionJson = await client.query(api.users.getSession, { sessionId: sessionCookie });

	const session = JSON.parse(sessionJson) as { user: User | null; session: Session | null };

	event.locals.user = session.user;
	event.locals.session = session.session;

	return await resolve(event);
};
