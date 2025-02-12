import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../store/Store";
import commonApi from "../utils/commonApi";

// Define a type for the slice state
interface AuthState {}

// Define the initial state
const initialState: AuthState = {};

export const Loginapi: any = createAsyncThunk(
  "executive/token",
  async (data:any) => {
    const response = await commonApi.apiCall(
      "post",
      "/executive/token",
      data,
      false,
     "multipart/form-data"
    );
    return response;
  }
);

// Slice
export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
});

// Action creators are generated for each case reducer function
export const {} = authSlice.actions;

export default authSlice.reducer;
