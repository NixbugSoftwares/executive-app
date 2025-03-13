import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../types/type";
import { RootState } from "../store/Store";
import commonApi from "../utils/commonApi";

// Define a type for the slice state
type status = "idle" | "loading";

interface AppState {
  splash: boolean;
  status: status| "idle" | "loading";
  loggedIn: boolean;
  loggedUser?: User;
  user: User | null;
  logincreds: {
    email: string;
    password: string;
  };
  accounts: any[];
  list: [],
  error: null,
  roles: any[]
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
  accounts: [],
  list: [],
  error: null,
  roles: []
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


//***************************************************************Executive Account APIS***********************************************************************
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


//Account list API
export const accountListApi = createAsyncThunk(
  "/executive/account",
  async (_, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "get",
        "/executive/account",
        {},
        true,
        "application/json"
      );
      console.log("Full API Response==================>", response);

      // Check if response is directly an array
      if (Array.isArray(response)) {
        return response;
      }

      // Check if response.data exists
      if (!response || !response.data) {
        throw new Error("Invalid response format");
      }

      return response.data; // Ensure correct return
    } catch (error: any) {
      console.log("Error fetching accounts=====================>", error);
      return rejectWithValue(error?.response?.data?.message || "Failed to fetch accounts");
    }
  }
);

// Account Update API
export const accountupdationApi = createAsyncThunk(
  "/executive/account",
  async ({  formData }: { accountId: number; formData: URLSearchParams }, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "patch",
        `/executive/account/`,
        formData,
        true,
        "application/x-www-form-urlencoded" // Use the correct content type
      );
      return response;
    } catch (error: any) {
      console.error("Backend Error Response:", error.response?.data); // Log the full error response
      return rejectWithValue(error?.response?.data?.message || "Account update failed");
    }
  }
);
//Account Delete API
export const accountDeleteApi = createAsyncThunk(
  "account/delete",
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "delete",
        "/executive/account/",
        data,
        true,
        "multipart/form-data"
      );

      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Account deletion failed");
    }
  }
);


//*************************************************************************** Executive Role APIS ******************************************************  
  //Role creation API
export const roleCreationApi = createAsyncThunk(
  "/executive/role",
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "post",
        "/executive/role",
        data,
        true,
        "application/www-form-urlencoded"
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Role creation failed");
    }
  }
);

//Role list Api
export const roleListApi = createAsyncThunk(
  "/executive/role",
  async (_, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "get",
        "/executive/role",
        {},
        true,
        "application/json"
      );
      console.log("Full API Response==================>", response);

      // Check if response is directly an array
      if (Array.isArray(response)) {
        return response;
      }

      // Check if response.data exists
      if (!response || !response.data) {
        throw new Error("Invalid response format");
      }

      return response.data; // Ensure correct return
    } catch (error: any) {
      console.log("Error fetching role=====================>", error);
      return rejectWithValue(error?.response?.data?.message || "Failed to fetch Role");
    }
  }
);


// role Update API
export const roleUpdationApi = createAsyncThunk(
  "/executive/role",
  async ({ formData }: { roleId: number; formData: URLSearchParams }, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "patch",
        `/executive/role/`,
        formData,
        true,
        "application/x-www-form-urlencoded" 
      );
      return response;
    } catch (error: any) {
      console.error("Backend Error Response:", error.response?.data); 
      return rejectWithValue(error?.response?.data?.message || "Role update failed");
    }
  }
);

//role delete API
export const roleDeleteApi = createAsyncThunk(
  "/executive/role/",
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "delete",
        "/executive/role/",
        data,
        true,
        "multipart/form-data"
      );

      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Account deletion failed");
    }
  }
);

//*******************************************Executive role mapping APIS*************************************************************
//role assign API
export const roleAssignApi = createAsyncThunk(
  "/executive/account/role",
  async ({ executive_id, role_id }: { executive_id: number; role_id: number }, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "post",
        "/executive/account/role",
        { executive_id, role_id }, 
        true,
        "multipart/form-data"
      );
      console.log("slice Responseyyyyyy==================>", response);
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Role assign failed");
    }
  }
);


//  get RoleMappingApi
export const fetchRoleMappingApi = createAsyncThunk(
  "/executive/account/role",
  async (accountId: number, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "get",
        `/executive/account/role`, // Endpoint to fetch all role mappings
        {},
        true,
        "application/json"
      );

      // Ensure the response is an array
      if (!Array.isArray(response)) {
        throw new Error("Invalid response format: Expected an array");
      }

      // Find the role mapping for the specific executive (accountId)
      const roleMapping = response.find((mapping: any) => mapping.executive_id === accountId);

      if (!roleMapping) {
        throw new Error("No role mapping found for this executive");
      }

      return roleMapping; // Return the specific role mapping object
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Failed to fetch role mapping");
    }
  }
);
  


//role assign update API
export const roleAssignUpdateApi = createAsyncThunk(
  "/executive/account/role",
  async ({ id, role_id }: { id: number; role_id: number }, { rejectWithValue }) => {
    try {
      const formData = new URLSearchParams();
      formData.append("id", id.toString()); 
      formData.append("role_id", role_id.toString()); 

      const response = await commonApi.apiCall(
        "patch",
        "/executive/account/role",
        formData,
        true,
        "application/x-www-form-urlencoded" // Use the correct content type
      );
      console.log("Role Assignment Update Response:", response);
      return response;
    } catch (error: any) {
      console.error("Backend Error Response:", error.response?.data); // Log the full error response
      return rejectWithValue(error?.response?.data?.message || "Role assign failed");
    }
  }
);
  
//*************************************************** company APIS ********************************************************************* */

//company list API
export const companyListApi = createAsyncThunk(
  "/executive/company",
  async (_, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "get",
        "/executive/company",
        {},
        true,
        "application/json"
      );
      console.log("Full API Response==================>", response);

      // Check if response is directly an array
      if (Array.isArray(response)) {
        return response;
      }

      // Check if response.data exists
      if (!response || !response.data) {
        throw new Error("Invalid response format");
      }

      return response.data; // Ensure correct return
    } catch (error: any) {
      console.log("Error fetching role=====================>", error);
      return rejectWithValue(error?.response?.data?.message || "Failed to fetch accounts");
    }
  }
);


//company create api
export const companyCreationApi = createAsyncThunk(
  "/executive/company",
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "post",
        "/executive/company",
        data,
        true,
        "application/www-form-urlencoded"
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "company creation failed");
    }
  }
);

//company update api
export const companyUpdationApi = createAsyncThunk(
  "/executive/company",
  async ({ formData }: { companyId: number; formData: URLSearchParams }, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "patch",
        "/executive/company",
        formData,
        true,
        "application/x-www-form-urlencoded" 
      );
      return response;
    } catch (error: any) {
      console.error("Backend Error Response:", error.response?.data); 
      return rejectWithValue(error?.response?.data?.message || "Role update failed");
    }
  }
);

//company delete api
export const companyDeleteApi = createAsyncThunk(
  "/executive/company",
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "delete",
        "/executive/company",
        data,
        true,
        "multipart/form-data"
      );

      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Account deletion failed");
    }
  }
);



// ********************************************************* operator APIS ********************************************************************

//Operatoer list API
export const operatorListApi = createAsyncThunk(
  "/executive/company/operator",
  async (_, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "get",
        "/executive/company/operator",
        {},
        true,
        "application/json"
      );
      console.log("Full API Response==================>", response);

      // Check if response is directly an array
      if (Array.isArray(response)) {
        return response;
      }

      // Check if response.data exists
      if (!response || !response.data) {
        throw new Error("Invalid response format");
      }

      return response.data; // Ensure correct return
    } catch (error: any) {
      console.log("Error fetching operator=====================>", error);
      return rejectWithValue(error?.response?.data?.message || "Failed to fetch accounts");
    }
  }
);


//operator creation API
export const operatorCreationApi = createAsyncThunk(
  "/executive/company/operator",
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "post",
        "/executive/company/operator",
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


//operator updation API
export const operatorupdationApi = createAsyncThunk(
  "/executive/company/operator",
  async ({  formData }: { operatorId: number; formData: URLSearchParams }, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "patch",
        `/executive/company/operator`,
        formData,
        true,
        "application/x-www-form-urlencoded" 
      );
      return response;
    } catch (error: any) {
      console.error("Backend Error Response:", error.response?.data); // Log the full error response
      return rejectWithValue(error?.response?.data?.message || "Account update failed");
    }
  }
);


//operator delete API
export const operatorDeleteApi = createAsyncThunk(
  "/executive/company/operator",
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "delete",
        "/executive/company/operator",
        data,
        true,
        "multipart/form-data"
      );

      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Account deletion failed");
    }
  }
);

//********************************************************************* operator Role APIS *****************************************************
//operatort role list api
 export const operatorRoleListApi = createAsyncThunk(
  "/executive/company/role",
  async (_, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "get",
        "/executive/company/role",
        {},
        true,
        "application/json"
      );
      console.log("Full API Response==================>", response);

      // Check if response is directly an array
      if (Array.isArray(response)) {
        return response;
      }

      // Check if response.data exists
      if (!response || !response.data) {
        throw new Error("Invalid response format");
      }

      return response.data; // Ensure correct return
    } catch (error: any) {
      console.log("Error fetching role=====================>", error);
      return rejectWithValue(error?.response?.data?.message || "Failed to fetch accounts");
    }
  }
);

//***************************************************************** operator role mapping ************************************************************************ 

//fetch operator roll 

export const fetchOperatorRoleMappingApi = createAsyncThunk(
  "/executive/company/operator/role",
  async (operatorId: number, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "get",
        "/executive/company/operator/role",
        {},
        true,
        "application/json"
      );

      // Ensure the response is an array
      if (!Array.isArray(response)) {
        throw new Error("Invalid response format: Expected an array");
      }

      // Find the role mapping for the specific executive (accountId)
      const roleMapping = response.find((mapping: any) => mapping.operator_id === operatorId);

      if (!roleMapping) {
        throw new Error("No role mapping found for this operator");
      }

      return roleMapping; // Return the specific role mapping object
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Failed to fetch role mapping");
    }
  }
);


//operatort role Assign api
export const operatorRoleAssignApi = createAsyncThunk(
  "/executive/company/operator/role",
  async ({ operator_id , role_id }: { operator_id : number; role_id: number }, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "post",
        "/executive/company/operator/role",
        { operator_id , role_id }, 
        true,
        "multipart/form-data"
      );
      console.log("slice Responseyyyyyy==================>", response);
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || "Role assign failed");
    }
  }
);


export const operatorRoleUpdateApi = createAsyncThunk(
  "/executive/company/operator/role",
  async ({ id, role_id }: { id: number; role_id: number }, { rejectWithValue }) => {
    try {
      const formData = new URLSearchParams();
      formData.append("id", id.toString()); // Include the role assignment ID
      formData.append("role_id", role_id.toString()); // Include the new role ID

      const response = await commonApi.apiCall(
        "patch",
        "/executive/company/operator/role",
        formData,
        true,
        "application/x-www-form-urlencoded" // Use the correct content type
      );
      console.log("Role Assignment Update Response:", response);
      return response;
    } catch (error: any) {
      console.error("Backend Error Response:", error.response?.data); // Log the full error response
      return rejectWithValue(error?.response?.data?.message || "Role assign failed");
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
    // setRole: (state, action) => {
    //   state.accounts = action.payload; 
    // },
    
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
