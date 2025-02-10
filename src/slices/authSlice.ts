import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
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
  "auth/login",
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
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("access_token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(LoginApi.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(LoginApi.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(LoginApi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { logout } = authSlice.actions;

// Export selector
export const selectAuth = (state: RootState) => state.auth;

export default authSlice.reducer;
