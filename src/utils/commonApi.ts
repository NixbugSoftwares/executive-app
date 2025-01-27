import axios from 'axios';
import { toast } from "react-toastify";
import moment from 'moment';
import localStorageHelper from './localStorageHelper';



// export const API_BASE = DotEnvHelper.getApiUrl();
// export const STRIPE_KEY = DotEnvHelper.getStripePublishKey();
// console.log('Api===>',API_BASE);
// export const STRIPE_P_KEY= Config.STRIPE_KEY;

export const base_URL = ' http://192.168.0.251:8080'; //base URL

//******************************************************Token **************************************** */
const getAuthTocken = async () => {
 try {
 const token = JSON.parse(
 await localStorageHelper.getEncryptedData('@token'),
 );
//  const refreshToken = JSON.parse(
//  await localStorageHelper.getEncryptedData('@refresh_token'),
//  );

 const response = await axios.post(
 `${base_URL}auth/token`,
 {token}, //refresh_token: refreshToken
 {
 headers: {'Content-Type': 'application/json'},
 },
 );

 const {token: newToken, token_expiry: newTokenExpiry} =
 response?.data?.data;
 await localStorageHelper.setEncryptedData('@token', newToken);
 await localStorageHelper.setEncryptedData('@token_expiry', newTokenExpiry);

 return newToken;
 } catch (err) {
 console.error('Error in getAuthTocken', err);
 throw err;
 }
};


//****************************************************** prepare Headers **************************************** */
const prepareHeaders = async (tokenNeeded: any) => {
 let headers: any = {'Content-Type': 'application/json'};
 if (tokenNeeded) {
 let AuthToken = JSON.parse(
 await localStorageHelper.getEncryptedData('@token'),
 );
 const tokenExpiry = JSON.parse(
 await localStorageHelper.getEncryptedData('@token_expiry'),
 );
 const hourDifference = moment(tokenExpiry).diff(moment(), 'hours');

 if (!hourDifference || hourDifference <= 1) {
 AuthToken = await getAuthTocken();
 }

 headers['Authorization'] = `Bearer ${AuthToken}`;
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
 method: any,
 route: any,
 params = {},
 tokenNeeded = true,
 contentType = 'application/json',
) => {
 console.log('====================================');
 console.log(route);
 console.log('====================================');
 try {
 const headers = await prepareHeaders(tokenNeeded);
 headers['Content-Type'] = contentType;

 const config = {
 method,
 url: `${base_URL}${route}`,
 headers,
 data: method !== 'get' && method !== 'delete' ? params : undefined,
 params: method === 'get' || method === 'delete' ? params : undefined,
 };

 console.log("CONFIG ===> ", config);
 

 const response = await axios(config);
 return await handleResponse(response);
 } catch (err: any) {
 return handleErrorResponse(err?.response);
 }
};


export default {
 apiCall,
};