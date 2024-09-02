// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: User | null;
			session: Session | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}
interface User {
	username: string;
	id: string;
}
interface Session {
	id: string;
	userId: string;
	fresh: boolean;
	expiresAt: string;
}

export {User,Session};
