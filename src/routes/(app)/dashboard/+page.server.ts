export const load = async ({ locals }: { locals: App.Locals }) => {
	// The user data is already available from the layout
	return {
		user: locals.user
	};
};