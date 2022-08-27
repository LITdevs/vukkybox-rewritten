import "express-session";
declare module "express-session" {

	interface SessionData {
		/**
		 * The vukkybox object is used to store data on the session.
		 */
		vukkybox: {
			/**
			 * The validated property is used to determine if the user has validated 2-Factor Authentication, if it is enabled.
			 */
			validated?: boolean; // Has the user validated 2FA?
		};
	}
}