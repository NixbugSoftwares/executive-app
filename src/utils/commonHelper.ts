import { setLoginCreds, userLoggedOut } from "../slices/appSlice";
import store from "../store/Store";
import localStorageHelper from "./localStorageHelper";
import { navigate } from "./navigationHelper";
async function logout() {
  store.dispatch(userLoggedOut());
  store.dispatch(setLoginCreds({}));
  localStorageHelper.clearStorage();
  navigate("/login");
}

export default {
  logout,
};
