import { ConvexError, convexToJson, v } from 'convex/values';
import { DatabaseWriter, mutation, query } from './_generated/server';
import { getAuth } from './auth/lucia';
import { Scrypt } from 'lucia';

export const register = mutation({
	args: {
		username: v.string(),
		password: v.string()
	},
	handler: async (ctx, args) => {

        if(args.username.length < 3) throw new ConvexError('Username must be at least 3 characters long');
        if(args.password.length < 8) throw new ConvexError('Password must be at least 8 characters long');

		const auth = getAuth(ctx.db);
		const existingUser = await ctx.db
			.query('users')
			.filter((q) => q.eq(q.field('username'), args.username))
			.first();
		if (existingUser) throw new ConvexError('User already exists');
		const password_hash = await new Scrypt().hash(args.password);

		const user = await ctx.db.insert('users', {
			username: args.username,
			password_hash
		});

		const session = await auth.createSession(user, {});

		return JSON.stringify(session);
	}
});

export const login = mutation({
	args: {
		username: v.string(),
		password: v.string()
	},
	handler: async (ctx, args) => {
		const invaildUserOrPassword = new ConvexError('Invalid username or password');
		const auth = getAuth(ctx.db);
		const existingUser = await ctx.db
			.query('users')
			.filter((q) => q.eq(q.field('username'), args.username))
			.first();
		if (!existingUser) throw invaildUserOrPassword;
		const passwordMatches = await new Scrypt().verify(existingUser.password_hash, args.password);
		if (!passwordMatches) throw invaildUserOrPassword;
		const session = await auth.createSession(existingUser._id, {});
		return JSON.stringify(session);
	}
});

export const getSession = query({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		const auth = getAuth(ctx.db as DatabaseWriter);
		const userSession = await auth.validateSession(args.sessionId);
		return JSON.stringify(userSession);
	}
});
