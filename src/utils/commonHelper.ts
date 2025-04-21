import { setLoginCreds, userLoggedOut } from "../slices/appSlice";
import store from "../store/Store";
import localStorageHelper from "./localStorageHelper";
async function logout() {
  store.dispatch(userLoggedOut());
  store.dispatch(setLoginCreds({}));
  localStorageHelper.clearStorage();
}

export default {
  logout,
};
