import { useAppDispatch } from "../../store/Hooks";
import { logoutApi } from "../../slices/appSlice";
import { useNavigate } from "react-router-dom";
import localStorageHelper from "../../utils/localStorageHelper";
import commonHelper from "../../utils/commonHelper";

const Logout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await dispatch(logoutApi({})).unwrap();

      localStorageHelper.clearStorage();
      commonHelper
      navigate("/login"); 
    } catch (error) {
      console.error("Logout Error:", error);
      navigate("/home"); 
    }
  };
  

  return <button onClick={handleLogout}>Logout</button>;
};

export default { Logout }
