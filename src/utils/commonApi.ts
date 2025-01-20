import axios, { AxiosResponse, AxiosRequestConfig } from "axios";

interface ApiConfig {
  baseURL: string;
  headers?: Record<string, string>;
}


const apiConfig: ApiConfig = {
  baseURL: "http://192.168.0.67:8080",
  headers: {
    Authorization: "",
  },
};


export const apiRequest = async <T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  url: string,
  data?: any,
  additionalHeaders?: Record<string, string>
): Promise<AxiosResponse<T>> => {
  try {
    const config: AxiosRequestConfig = {
      baseURL: apiConfig.baseURL,
      url,
      method,
      headers: { ...apiConfig.headers, ...additionalHeaders }, 
      ...(data && { data }),
    };

    const response = await axios(config);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error Response:", error.response?.data || error.message);
    } else {
      console.error("Unexpected Error:", error);
    }
    throw error;
  }
};

export const setAuthToken = (token: string) => {
  apiConfig.headers = {
    ...apiConfig.headers,
    Authorization: `Bearer ${token}`,
  };
};
