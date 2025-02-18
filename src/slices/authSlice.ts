import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store/Store";
import commonApi from "../utils/commonApi";

// Define the auth state type
interface AuthState {
  user: any | null; // Store user data or token
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

// Async thunk for login
export const LoginApi = createAsyncThunk(
  "/executive/token",
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "post",
        "/executive/token",
        data,
        false,
        "multipart/form-data"
      );
      return response; // Ensure response contains `access_token`
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Login failed");
    }
  }
);

// Create auth slice
export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
});

// Export selector
export const selectAuth = (state: RootState) => state.auth;

export default authSlice.reducer;
