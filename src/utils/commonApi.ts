import axios from "axios";
import { toast } from "react-toastify";
import moment from "moment";
import localStorageHelper from "./localStorageHelper";

export const base_URL = "http://192.168.0.134:8080"; //base URL

//******************************************************Token **************************************** */
const getAuthToken = async () => {
  try {
    const token = await localStorageHelper.getItem("@token");

    const response = await axios.patch(
      `${base_URL}/executive/token`,
      { token },
      { headers: { Authorization: `bearer ${token}` } }
      // {
      //   headers: { "Content-Type": "application/json" },
      // }
    );

    console.log("getAuthtokenresponse=====>", response);

    await localStorageHelper.storeItem("@token", response?.data?.access_token);
    await localStorageHelper.storeItem(
      "@token_expires",
      response?.data?.expires_in
    );

    return response?.data?.access_token;
  } catch (err) {
    console.error("Error in getAuthToken", err);
    throw err;
  }
};

//****************************************************** prepare Headers **************************************** */
const prepareHeaders = async (tokenNeeded: any) => {
  let headers: any = { "Content-Type": "application/json" };
  if (tokenNeeded) {
    let AuthToken = await localStorageHelper.getItem("@token");
    const tokenExpiry = await localStorageHelper.getItem("@token_expiry");
    const hourDifference = moment(tokenExpiry).diff(moment(), "hours");
    if (!hourDifference || hourDifference <= 1) {
      AuthToken = await getAuthToken();
    }
    headers["Authorization"] = `bearer ${AuthToken}`;
  }

  return headers;
};

//****************************************************** response handler **************************************** */

const handleResponse = async (response: any) => {
  return response?.data; // Fix for response structure
};

//******************************************************  errorResponse handler  **************************************** */
const handleErrorResponse = (errorResponse: any) => {
  if (!errorResponse) {
    toast.error("Network error. Please try again.");
    return { error: "Network error" };
  }

  const { status, data } = errorResponse;
  const errorMessage = data?.message || "Api Failed";

  if (status === 400 && Array.isArray(data?.message)) {
    const validationErrors = data.message
      .map((err: any) => Object.values(err.constraints).join(", "))
      .join(" | ");
    toast.error(validationErrors);
    return { error: validationErrors };
  } else {
    if (status !== 500) {
      toast.error(errorMessage);
    }
    return { error: errorMessage }; // Return error message for better debugging
  }
};

//******************************************************  apiCall  ****************************************

const apiCall = async (
  method: "get" | "post" | "patch" | "delete",
  route: string,
  params: any = {},
  tokenNeeded: boolean = true,
  contentType: string = "application/json"
) => {
  console.log(route);
  console.log("method===========>", method);
  try {
    const headers = await prepareHeaders(tokenNeeded);

    headers["Content-Type"] = contentType;

    const config = {
      method,
      url: `${base_URL}${route}`,
      headers,
      data: method !== "get" && method !== "delete" ? params : undefined,
      params: method === "get" || method === "delete" ? params : undefined,
    };

    console.log("CONFIG ===> ", config);

    const response = await axios(config);
    return await handleResponse(response);
  } catch (err: any) {
    console.log("errorrr======>", err);
    return handleErrorResponse(err?.response);
  }
};

export default {
  apiCall,
};
