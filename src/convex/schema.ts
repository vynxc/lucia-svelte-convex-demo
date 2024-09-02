import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const users = defineTable({
	username: v.string(),
	password_hash: v.string()
}).index('byUsername', ['username']);

const sessions = defineTable({
    id: v.string(),
	user_id: v.id('users'),
	expires_at: v.float64()
}).index('byUserId', ['user_id']).index('byId', ['id']);
const schema = defineSchema({
	users,
	sessions
});

export default schema;
