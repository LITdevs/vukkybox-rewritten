import {IUser} from '../src/util/constants/userModel'

declare global {
	namespace Express {
		interface User extends IUser {}
	}
}