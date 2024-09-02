<script lang="ts">
	import { useConvexClient } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';
	import type { Session } from '../../app';
	import { ConvexError } from 'convex/values';
	import { goto, invalidateAll } from '$app/navigation';

	let username = $state('');
	let password = $state('');
	const convex = useConvexClient();
	async function auth(register: boolean) {
		try {
			const result = await convex.mutation(register ? api.users.register : api.users.login, {
				username,
				password
			});
			const session = JSON.parse(result) as Session;
			document.cookie = `session=${session.id}; path=/; expires=${new Date(session.expiresAt).toUTCString()};`;
			await invalidateAll();
			goto('/');
		} catch (e) {
			if (e instanceof ConvexError) {
				alert(e.data);
			}
			console.log(e);
		}
	}
</script>

<div class="w-full max-w-sm rounded-lg bg-white p-8 shadow-lg">
	<h2 class="mb-6 text-center text-2xl font-bold">Auth</h2>
	<form>
		<div class="mb-4">
			<label for="username" class="mb-2 block font-medium text-gray-700">Username</label>
			<input
				bind:value={username}
				type="username"
				id="username"
				class="w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring focus:ring-indigo-100"
			/>
		</div>
		<div class="mb-6">
			<label for="password" class="mb-2 block font-medium text-gray-700">Password</label>
			<input
				bind:value={password}
				type="password"
				id="password"
				autocomplete="current-password"
				class="w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring focus:ring-indigo-100"
			/>
		</div>
		<button
			onclick={() => {
				auth(false);
			}}
			type="submit"
			class="mb-2 w-full rounded bg-indigo-500 py-2 text-white transition hover:bg-indigo-600"
			>Login</button
		>
		<button
			onclick={() => {
				auth(true);
			}}
			class="w-full rounded bg-indigo-500 py-2 text-white transition hover:bg-indigo-600"
			>Register</button
		>
	</form>
</div>
