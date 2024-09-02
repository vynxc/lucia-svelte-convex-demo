<script>
	import { setupConvex } from 'convex-svelte';
	import '../app.css';
	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import { page } from '$app/stores';
	let { children, data } = $props();
	setupConvex(PUBLIC_CONVEX_URL);
	console.log(data);
</script>

<div class="flex h-screen items-center justify-center bg-gray-100 flex-col">
	{#if data.user}
		<p>hello {data.user.username}</p>
	{/if}
	{#if $page.url.pathname == '/' && !data.user}
		unauthorized
	{:else}
		{@render children()}
	{/if}
</div>
