import { Lucia, type Adapter, type DatabaseSession, type DatabaseUser } from 'lucia';
import type { DatabaseReader, DatabaseWriter } from '../_generated/server';
import { Id } from '../_generated/dataModel';

declare module 'lucia' {
	interface Register {
		DatabaseUserAttributes: DatabaseUserAttributes;
		UserId: Id<'users'>;
	}
}

interface DatabaseUserAttributes {
	username: string;
}

export function getAuth(db: DatabaseWriter | DatabaseReader) {
	const lucia = new Lucia(new ConvexAdapter(db as DatabaseWriter), {
		getUserAttributes: (attributes) => {
			return {
				username: attributes.username
			};
		}
	});
	return lucia;
}

export class ConvexAdapter implements Adapter {
	constructor(private readonly db: DatabaseWriter) {}

	async getSessionAndUser(
		sessionId: Id<'sessions'>
	): Promise<[DatabaseSession | null, DatabaseUser | null]> {
		const dbsession = await this.db
			.query('sessions')
			.withIndex('byId', (q) => q.eq('id', sessionId))
			.first();

		if (dbsession === null) return [null, null];

		const session = {
			id: dbsession.id,
			userId: dbsession.user_id,
			expiresAt: new Date(dbsession.expires_at),
			attributes: {}
		} as DatabaseSession;

		if (session === null) return [null, null];
		const dbuser = await this.db.get(session.userId);

		if (dbuser === null) return [null, null];
		const user = {
			id: dbuser._id,
			attributes: {
				username: dbuser.username
			}
		} as DatabaseUser;

		return [session, user];
	}

	async getUserSessions(userId: Id<'users'>): Promise<DatabaseSession[]> {
		const sessions = await this.db
			.query('sessions')
			.withIndex('byUserId', (q) => q.eq('user_id', userId))
			.collect();

		console.log(`got a total of ${sessions.length} sessions`);

		return sessions.map((session) => ({
			id: session._id,
			userId: session.user_id,
			expiresAt: new Date(session.expires_at),
			attributes: {}
		}));
	}

	async setSession(session: DatabaseSession): Promise<void> {
		await this.db.insert('sessions', {
			id: session.id,
			user_id: session.userId,
			expires_at: session.expiresAt.getTime()
		});
	}

	async updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<void> {
		const session = await this.db
			.query('sessions')
			.withIndex('byId', (q) => q.eq('id', sessionId))
			.first();
		if (session === null) return;
		await this.db.patch(session._id, { expires_at: expiresAt.getTime() });
	}

	async deleteSession(sessionId: string): Promise<void> {
		const session = await this.db
			.query('sessions')
			.withIndex('byId', (q) => q.eq('id', sessionId))
			.first();
		if (session === null) return;
		await this.db.delete(session._id);
	}

	async deleteUserSessions(userId: string): Promise<void> {
		const sessions = await this.db
			.query('sessions')
			.filter((q) => q.eq(q.field('user_id'), userId))
			.collect();
		await Promise.all(sessions.map((session) => this.db.delete(session._id)));
	}

	async deleteExpiredSessions(): Promise<void> {
		const sessions = await this.db.query('sessions').collect();
		const expiredSessions = sessions.filter((session) => session.expires_at < Date.now());
		await Promise.all(expiredSessions.map((session) => this.db.delete(session._id)));
	}
}

export type Auth = ReturnType<typeof getAuth>;
