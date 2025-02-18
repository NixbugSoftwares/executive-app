import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../types/type";
import { RootState } from "../store/Store";
import commonApi from "../utils/commonApi";

// Define a type for the slice state
type status = "idle" | "loading";

interface AppState {
  splash: boolean;
  status: status;
  loggedIn: boolean;
  loggedUser?: User;
  user: User | null;
  logincreds: {
    email: string;
    password: string;
  };
}

// Define the initial state
const initialState: AppState = {
  splash: true,
  status: "idle",
  loggedIn: false,
  user: null,
  logincreds: {
    email: "",
    password: "",
  },
};

//Logout API
export const logoutApi = createAsyncThunk(
  "/executive/token",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "delete",
        "/executive/token",
        data,
        true,
        "application/json"
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Logout failed");
    }
  }
);


//Account creation API
export const accountCreationApi = createAsyncThunk(
  "/executive/account",
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "post",
        "/executive/account",
        data,
        true,
        "multipart/form-data"
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Account creation failed");
    }
  }
);


// Slice
export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of action.payload
    splashCompleted: (state, action: PayloadAction<boolean>) => {
      state.splash = action.payload;
    },
    setLoader: (state, action: PayloadAction<status>) => {
      state.status = action.payload;
    },
    userLoggedIn: (state, action: PayloadAction<User>) => {
      state.loggedIn = true;
      state.loggedUser = action.payload;
    },
    userLoggedOut: (state) => {
      state.loggedIn = false;
      state.loggedUser = undefined;
    },
    setLoggedUser: (state, action) => {
      state.loggedUser = action.payload;
    },

    setLoginCreds: (state, action) => {
      state.logincreds = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  userLoggedIn,
  userLoggedOut,
  setLoader,
  setLoggedUser,
  splashCompleted,
  setLoginCreds,
} = appSlice.actions;
// Export actions

export default appSlice.reducer;

// Slice store data selector function
export const getSplash = (state: RootState) => state.app.splash;
export const getStatus = (state: RootState) => state.app.status;
export const getLoggedIn = (state: RootState) => state.app.loggedIn;
export const getLoggedUser = (state: RootState) => state.app.loggedUser;
export const getLoginCreds = (state: RootState) => state.app.logincreds;
