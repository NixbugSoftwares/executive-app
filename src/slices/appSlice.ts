import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RoleDetails, User } from "../types/type";
import { RootState } from "../store/Store";
import commonApi from "../utils/commonApi";

// Define a type for the slice state
type status = "idle" | "loading";

interface AppState {
  splash: boolean;
  status: status | "idle" | "loading";
  loggedIn: boolean;
  loggedUser?: User;
  user: User | null;
  logincreds: {
    email: string;
    password: string;
  };
  accounts: any[];
  list: [];
  error: null;
  roleDetails: RoleDetails | null;
  permissions: any[];
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
  roleDetails: null,
  permissions: [],
};

interface exectiveListParams {
  limit: number;
  offset: number;
  id?: string;
  fullName?: string;
  email_id?: string;
  designation?: string;
  phoneNumber?: string;
  gender?: string;
}

interface ExecutiveRoleListParams {
  limit?: number;
  offset?: number;
  id?: string;
  name?: string;
}

interface LandmarkListParams {
  limit?: number;
  offset?: number;
  id?: string;
  name?: string;
  location?: string;
}

interface BusStopListParams {
  limit?: number;
  offset?: number;
  landmark_id?: number;
}



//Logout API
export const logoutApi = createAsyncThunk(
  "token",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "delete",
        "token",
        data,
        true,
        "application/json"
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.detail || "Logout failed");
    }
  }
);

export const loggedinUserRoleDetails = createAsyncThunk<any[], number | undefined>(
  "role",
  async (assignedRoleId, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "get",
        "role",
        {},
        true,
        "application/json"
      );

      if (!assignedRoleId) return response;

      const matchedRole = response.find(
        (role: { id: number }) => role.id === assignedRoleId
      );
      console.log("successfully fetched role details");
      
      console.log("Matched Role:", matchedRole);
      return matchedRole ? [matchedRole] : [];
    } catch (error: any) {
      return rejectWithValue(
        error?.detail?.response?.data?.message || "Failed to fetch Role"
      );
    }
  }
);
export const loggedinuserAPI = createAsyncThunk(
  "account",
  async (executive_id: number, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "get",
        "/account",
        { executive_id },
        true,
        "application/json"
      );
      console.log("Full API Response=====555555=============>", response);

      if (Array.isArray(response)) {
        return response;
      }
      if (!response || !response.data) {
        throw new Error("Invalid response format");
      }

      return response.data; 
    } catch (error: any) {
      console.log("Error fetching accounts=====================>", error);
      return rejectWithValue(error.detail || "Failed to fetch accounts");
    }
  }
);

//***************************************************************Executive Account APIS***********************************************************************
//Account creation API
export const accountCreationApi = createAsyncThunk(
  "/account",
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "post",
        "account",
        data,
        true,
        "application/x-www-form-urlencoded"
      );
      console.log("Account creation response==================>", response);
      return response;
      
    } catch (error: any) {
      return rejectWithValue(error.detail || error.message || error || "Account creation failed");
    }
  }
);

//Account list API
export const accountListApi = createAsyncThunk(
  "/Account",
  async (params: exectiveListParams, { rejectWithValue }) => {
    const {
      limit,
      offset,
      id,
      fullName,
      gender,
      email_id,
      phoneNumber,
      designation,
    } = params;

    const queryParams = {
      limit,
      offset,
      ...(id && { id }),
      ...(fullName && { full_name: fullName }),
      ...(gender && { gender }),
      ...(email_id && { email_id }),
      ...(phoneNumber && { phone_number: phoneNumber }),
      ...(designation && { designation }),
    };
    try {
      const response = await commonApi.apiCall(
        "get",
        "account",
        queryParams,
        true,
        "application/json"
      );
      if (!response) throw new Error("No response received");
      console.log("Full API Response==================>", response);
      return { data: response };
    } catch (error: any) {
      console.error("API Error:", error);
      return rejectWithValue(error.detail || error.message || error || "Failed to fetch executive list");
    }
  }
);

// Account Update API
export const accountupdationApi = createAsyncThunk(
  "/account",
  async (
    { formData }: { accountId: number; formData: FormData },
    { rejectWithValue }
  ) => {
    try {
      const response = await commonApi.apiCall(
        "patch",
        `account`,
        formData,
        true,
        "application/x-www-form-urlencoded" 
      );
      return response;
    } catch (error: any) {
      console.error("Backend Error Response:", error.response);
      return rejectWithValue(
        error.detail || error.message || error || error.response?.data || "Account update failed"
      );
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
        "/executive/account",
        data,
        true,
        "application/x-www-form-urlencoded"
      );

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.detail?.response?.data?.message || "Account deletion failed"
      );
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
        "role",
        data,
        true,
        "application/www-form-urlencoded"
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.detail || error.response?.data?.message || "Role creation failed"
      );
    }
  }
);

//Role list Api
export const roleListApi = createAsyncThunk(
  "/Role",
  async (params: ExecutiveRoleListParams, { rejectWithValue }) => {
    const { limit, offset, id, name } = params;
    console.log("operatorListApi called with:", params);

    const queryParams = {
      limit,
      offset,
      ...(id && { id }),
      ...(name && { name: name }),
    };
    try {
      const response = await commonApi.apiCall(
        "get",
        "role",
        queryParams,
        true,
        "application/json"
      );
      if (!response) throw new Error("No response received");

      return {
        data: response.data || response,
      };
    } catch (error: any) {
      console.error("API Error:", error);
      return rejectWithValue(
  error?.response?.data?.detail || "Failed to fetch role list"
);
    }
  }
);
// role Update API
export const roleUpdationApi = createAsyncThunk(
  "/executive/role",
  async (
    { formData }: { roleId: number; formData: URLSearchParams },
    { rejectWithValue }
  ) => {
    try {
      const response = await commonApi.apiCall(
        "patch",
        `role`,
        formData,
        true,
        "application/x-www-form-urlencoded"
      );
      return response;
    } catch (error: any) {
      console.error("Backend Error Response:", error.response?.data);
      return rejectWithValue(
        error?.response?.data?.message || "Role update failed"
      );
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
        "role",
        data,
        true,
        "application/x-www-form-urlencoded"
      );

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Account deletion failed"
      );
    }
  }
);

//*******************************************Executive role mapping APIS*************************************************************
//role assign API
export const roleAssignApi = createAsyncThunk(
  "account/role",
  async (
    { executive_id, role_id }: { executive_id: number; role_id: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await commonApi.apiCall(
        "post",
        "account/role",
        { executive_id, role_id },
        true,
        "application/x-www-form-urlencoded"
      );
      console.log("slice Responseyyyyyy==================>", response);

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Role assign failed"
      );
    }
  }
);

//  get RoleMappingApi
export const fetchRoleMappingApi = createAsyncThunk(
  "/account/role",
  async (executive_id: number, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "get",
        "account/role",
        { executive_id },
        true,
        "application/json"
      );

      // Handle case where response is an array (like your Postman example)
      if (Array.isArray(response) && response.length > 0) {
        return response[0]; // Return first mapping (assuming one operator has one role)
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch role mapping"
      );
    }
  }
);

//role assign update API
export const roleAssignUpdateApi = createAsyncThunk(
  "/executive/account/role",
  async (
    { id, role_id }: { id: number; role_id: number },
    { rejectWithValue }
  ) => {
    try {
      const formData = new URLSearchParams();
      formData.append("id", id.toString());
      formData.append("role_id", role_id.toString());

      const response = await commonApi.apiCall(
        "patch",
        "account/role",
        formData,
        true,
        "application/x-www-form-urlencoded" // Use the correct content type
      );
      console.log("Role Assignment Update Response:", response);
      return response;
    } catch (error: any) {
  console.error("Backend Error Response:", error.response?.data?.detail); 
  return rejectWithValue(
    error.response?.data?.detail || error || "Role assign failed"
  );
}
  }
);

//************************************************** landmark APIS ************************************************************

//landmark list API
export const landmarkListApi = createAsyncThunk(
  "/executive/landmark",
  async (params: LandmarkListParams, { rejectWithValue }) => {
    const {limit, offset, id, name, location} = params;
    const queryParams = {
      limit,
      offset ,
      ...(id && { id }),
      ...(name && { name }),
      ...(location && { location }) 
    };
    try{
      const response = await commonApi.apiCall(
        "get",
        "landmark",
        queryParams,
        true,
        "application/json"
      );
      console.log( "landmarkListApi called with:", params);
      
      return { data: response ||  response.data};
    } catch (error: any) {
      return rejectWithValue(
        error.detail || error.message || error || "Failed to fetch landmark list"
      );
    }
  }
);

//landmark create api
export const landmarkCreationApi = createAsyncThunk(
  "/executive/landmark",
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "post",
        "landmark",
        data,
        true,
        "application/www-form-urlencoded"
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.detail || error.message || error || "landmark creation failed"
      );
    }
  }
);

//landmark updation Api
export const landmarkUpdationApi = createAsyncThunk(
  "/executive/landmark",
  async (
    { formData }: { landmarkId: number; formData: FormData },
    { rejectWithValue }
  ) => {
    try {
      const response = await commonApi.apiCall(
        "patch",
        "landmark",
        formData,
        true,
        "application/x-www-form-urlencoded"
      );
      return response;
    } catch (error: any) {
      console.error("Backend Error Response:", error.response?.data);
      return rejectWithValue(
        error.detail || error.message || error  || "Landmark update failed please try again"
      );
    }
  }
);

//landmark delete Api
export const landmarkDeleteApi = createAsyncThunk(
  "/executive/landmark",
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "delete",
        "landmark",
        data,
        true,
        "application/x-www-form-urlencoded"
      );

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.detail || error.message || error || "Account deletion failed"
      );
    }
  }
);

//*************************************************** Bus Stop APIS ********************************************************************* */

//bus stop list API
export const busStopListApi = createAsyncThunk(
  "/executive/bus_stop",
  async (params: BusStopListParams, { rejectWithValue }) => {
    const { limit, offset, landmark_id } = params;
    const queryParams = {
      ...(limit && { limit }),
      ...(offset && { offset }),
      ...(landmark_id && { landmark_id }),
    };
    try {
      const response = await commonApi.apiCall(
        "get",
        "bus_stop",
        queryParams,
        true,
        "application/json"
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
       error.detail || error.message || error || "Failed to fetch bus stop list"
      );
    }
  }
);

//bus stop create api
export const busStopCreationApi = createAsyncThunk(
  "/executive/bus_stop",
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "post",
        "bus_stop",
        data,
        true,
        "application/www-form-urlencoded"
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Bus stop  creation failed"
      );
    }
  }
);

//bus stop updation Api
export const busStopUpdationApi = createAsyncThunk(
  "/executive/bus_stop",
  async (
    { formData }: { busStopId: number; formData: FormData },
    { rejectWithValue }
  ) => {
    try {
      const response = await commonApi.apiCall(
        "patch",
        "/executive/bus_stop",
        formData,
        true,
        "application/x-www-form-urlencoded"
      );
      return response;
    } catch (error: any) {
      console.error("Backend Error Response:", error.response?.data);
      return rejectWithValue(
        error?.response?.data?.message || "bus sto update failed"
      );
    }
  }
);

//delete bus stop API
export const busStopDeleteApi = createAsyncThunk(
  "/executive/bus_stop",
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "delete",
        "/executive/bus_stop",
        data,
        true,
        "application/x-www-form-urlencoded"
      );

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "bus stop deletion failed"
      );
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
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch accounts"
      );
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
      return rejectWithValue(
        error?.response?.data?.message || "company creation failed"
      );
    }
  }
);

//company update api
export const companyUpdationApi = createAsyncThunk(
  "/executive/company",
  async (
    { formData }: { companyId: number; formData: URLSearchParams },
    { rejectWithValue }
  ) => {
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
      return rejectWithValue(
        error?.response?.data?.message || "Role update failed"
      );
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
        "application/x-www-form-urlencoded"
      );

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Account deletion failed"
      );
    }
  }
);

// ********************************************************* operator APIS ********************************************************************

//Operatoer list API
export const operatorListApi = createAsyncThunk(
  "/executive/company/operator",
  async (companyId: number | null, { rejectWithValue }) => {
    try {
      const params = companyId ? { company_id: companyId } : {};
      const response = await commonApi.apiCall(
        "get",
        "/executive/company/operator",
        params,
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
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch accounts"
      );
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
        "application/x-www-form-urlencoded" // Use the correct content type for form data"
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Account creation failed"
      );
    }
  }
);

//operator updation API
export const operatorupdationApi = createAsyncThunk(
  "/executive/company/operator",
  async (
    { formData }: { operatorId: number; formData: URLSearchParams },
    { rejectWithValue }
  ) => {
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
      return rejectWithValue(
        error?.response?.data?.message || "Account update failed"
      );
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
      return rejectWithValue(
        error?.response?.data?.message || "Account deletion failed"
      );
    }
  }
);

//********************************************************************* operator Role APIS *****************************************************
//operatort Role creation API
export const operatorRoleCreationApi = createAsyncThunk(
  "/executive/company/role",
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "post",
        "/executive/company/role",
        data,
        true,
        "application/www-form-urlencoded"
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Role creation failed"
      );
    }
  }
);

//operatort role list api
export const operatorRoleListApi = createAsyncThunk(
  "/executive/company/role",
  async (companyId: number | null, { rejectWithValue }) => {
    try {
      const params = companyId ? { company_id: companyId } : {};
      const response = await commonApi.apiCall(
        "get",
        "/executive/company/role",
        params,
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
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch accounts"
      );
    }
  }
);

//operator role updation API
export const operatorRoleUpdationApi = createAsyncThunk(
  "/executive/company/role",
  async (
    { formData }: { roleId: number; formData: URLSearchParams },
    { rejectWithValue }
  ) => {
    try {
      const response = await commonApi.apiCall(
        "patch",
        `/executive/company/role`,
        formData,
        true,
        "application/x-www-form-urlencoded"
      );
      return response;
    } catch (error: any) {
      console.error("Backend Error Response:", error.response?.data);
      return rejectWithValue(
        error?.response?.data?.message || "Role update failed"
      );
    }
  }
);

//operator role delete
export const operatorRoleDeleteApi = createAsyncThunk(
  "/executive/company/role",
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "delete",
        "/executive/company/role",
        data,
        true,
        "application/x-www-form-urlencoded"
      );

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Account deletion failed"
      );
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
      const roleMapping = response.find(
        (mapping: any) => mapping.operator_id === operatorId
      );

      if (!roleMapping) {
        throw new Error("No role mapping found for this operator");
      }

      return roleMapping; // Return the specific role mapping object
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch role mapping"
      );
    }
  }
);

//operatort role Assign api
export const operatorRoleAssignApi = createAsyncThunk(
  "/executive/company/operator/role",
  async (
    { operator_id, role_id }: { operator_id: number; role_id: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await commonApi.apiCall(
        "post",
        "/executive/company/operator/role",
        { operator_id, role_id },
        true,
        "multipart/form-data"
      );
      console.log("slice Responseyyyyyy==================>", response);

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Role assign failed"
      );
    }
  }
);

//operatort role Assign update api
export const operatorRoleAssignUpdateApi = createAsyncThunk(
  "/executive/company/operator/role",
  async (
    { id, role_id }: { id: number; role_id: number },
    { rejectWithValue }
  ) => {
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
      return rejectWithValue(
        error?.response?.data?.message || "Role assign failed"
      );
    }
  }
);

//******************************************************************** company Bus  ************************************************************************

//bus  creation API
export const busCreationApi = createAsyncThunk(
  "/executive/company/bus",
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "post",
        "/executive/company/bus",
        data,
        true,
        "application/www-form-urlencoded"
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Role creation failed"
      );
    }
  }
);

//bus list Api
export const busListApi = createAsyncThunk(
  "/executive/company/bus",
  async (companyId: number | null, { rejectWithValue }) => {
    try {
      const params = companyId ? { company_id: companyId } : {};
      const response = await commonApi.apiCall(
        "get",
        "/executive/company/bus",
        params,
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
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch accounts"
      );
    }
  }
);

// bus update Api
export const busUpdationApi = createAsyncThunk(
  "/executive/company/bus",
  async (
    { formData }: { busId: number; formData: FormData },
    { rejectWithValue }
  ) => {
    try {
      const response = await commonApi.apiCall(
        "patch",
        "/executive/company/bus",
        formData,
        true,
        "application/x-www-form-urlencoded"
      );
      return response;
    } catch (error: any) {
      console.error("Backend Error Response:", error.response?.data); // Log the full error response
      return rejectWithValue(
        error?.response?.data?.message || "Bus update failed"
      );
    }
  }
);

//bus delete Api
export const busDeleteApi = createAsyncThunk(
  "/executive/company/bus",
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "delete",
        "/executive/company/bus",
        data,
        true,
        "application/x-www-form-urlencoded"
      );

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Account deletion failed"
      );
    }
  }
);

//****************************************************Bus route & Route landmark********************

//route creation API
export const routeCreationApi = createAsyncThunk(
  "/executive/company/route",
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "post",
        "/executive/company/route",
        data,
        true,
        "application/www-form-urlencoded"
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "route creation failed"
      );
    }
  }
);

//route-landmark creation API
export const routeLandmarkCreationApi = createAsyncThunk(
  "/executive/company/route/landmark",
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "post",
        "/executive/company/route/landmark",
        data,
        true,
        "application/www-form-urlencoded"
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "route-landmark creation failed"
      );
    }
  }
);

//route list Api

export const busRouteListApi = createAsyncThunk(
  "/executive/company/route",
  async (companyId: number | null, { rejectWithValue }) => {
    try {
      const params = companyId ? { company_id: companyId } : {};
      const response = await commonApi.apiCall(
        "get",
        "/executive/company/route",
        params,
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
      console.log("Error fetching routes=====================>", error);
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch routes"
      );
    }
  }
);

//route-landmark list api

export const busRouteLandmarkListApi = createAsyncThunk(
  "/executive/company/route/landmark",
  async (routeId: number | null, { rejectWithValue }) => {
    try {
      const params = routeId ? { route_id: routeId } : {};
      const response = await commonApi.apiCall(
        "get",
        "/executive/company/route/landmark",
        params,
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
      console.log(
        "Error fetching route landmarks =====================>",
        error
      );
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch route landmarks"
      );
    }
  }
);

//route-delete Api
export const routeDeleteApi = createAsyncThunk(
  "/executive/company/route",
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "delete",
        "/executive/company/route",
        data,
        true,
        "application/x-www-form-urlencoded"
      );

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Account deletion failed"
      );
    }
  }
);

//route-landmark Delete Api
export const routeLandmarkDeleteApi = createAsyncThunk(
  "/executive/company/route/landmark",
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "delete",
        "/executive/company/route/landmark",
        data,
        true,
        "application/x-www-form-urlencoded"
      );

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Account deletion failed"
      );
    }
  }
);

//route update Api
export const routeUpdationApi = createAsyncThunk(
  "/executive/company/route",
  async (
    { formData }: { routeId: number; formData: FormData },
    { rejectWithValue }
  ) => {
    try {
      const response = await commonApi.apiCall(
        "patch",
        "/executive/company/route",
        formData,
        true,
        "application/x-www-form-urlencoded"
      );
      return response;
    } catch (error: any) {
      console.error("Backend Error Response:", error.response?.data); // Log the full error response
      return rejectWithValue(
        error?.response?.data?.message || "route update failed"
      );
    }
  }
);

//route-landmark update Api
export const routeLandmarkUpdationApi = createAsyncThunk(
  "/executive/company/route/landmark",
  async (
    { formData }: { routeLandmarkId: number; formData: FormData },
    { rejectWithValue }
  ) => {
    try {
      const response = await commonApi.apiCall(
        "patch",
        "/executive/company/route/landmark",
        formData,
        true,
        "application/x-www-form-urlencoded"
      );
      return response;
    } catch (error: any) {
      console.error("Backend Error Response:", error.response?.data); // Log the full error response
      return rejectWithValue(
        error?.response?.data?.message || "Route-landmark update failed"
      );
    }
  }
);

//****************************************************************global and local Fare *************************************************************************
//fare get api
export const fareListApi = createAsyncThunk(
  "executive/company/fare",
  async (params: { scope: 1 | 2; companyId?: string }, { rejectWithValue }) => {
    try {
      if (!params.scope) {
        throw new Error(
          "Scope parameter is required (1 for global, 2 for local)"
        );
      }

      const endpoint = "/executive/company/fare";
      const queryParams = new URLSearchParams({
        scope: params.scope.toString(),
      });

      if (params.scope === 2 && params.companyId) {
        queryParams.append("companyId", params.companyId);
      }

      const response = await commonApi.apiCall(
        "get",
        `${endpoint}?${queryParams.toString()}`,
        null,
        true,
        "application/json"
      );

      if (!response || typeof response !== "object") {
        throw new Error("API returned non-object response");
      }

      const responseData = response.data || response;
      const fareData = Array.isArray(responseData)
        ? responseData
        : [responseData];

      if (!fareData.length || !fareData[0].id) {
        throw new Error("API response doesn't contain valid fare data");
      }

      return {
        scope: params.scope,
        companyId: params.scope === 2 ? params.companyId : null,
        data: fareData,
      };
    } catch (error: any) {
      console.error("Error fetching fares:", error);
      return rejectWithValue({
        message: error?.response?.data?.message || error.message,
        code: error?.response?.status || 500,
        details: error?.response?.data?.errors || null,
      });
    }
  }
);

//fare creation API
export const fareCreationApi = createAsyncThunk(
  "/executive/company/fare",
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "post",
        "/executive/company/fare",
        data,
        true,
        "application/x-www-form-urlencoded"
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Account creation failed"
      );
    }
  }
);

//fare updation API
export const fareupdationApi = createAsyncThunk(
  "/executive/company/fare",
  async (
    { formData }: { fareId: number; formData: URLSearchParams },
    { rejectWithValue }
  ) => {
    try {
      const response = await commonApi.apiCall(
        "patch",
        `/executive/company/fare`,
        formData,
        true,
        "application/x-www-form-urlencoded" // Use the correct content type
      );
      return response;
    } catch (error: any) {
      console.error("Backend Error Response:", error.response?.data); // Log the full error response
      return rejectWithValue(
        error?.response?.data?.message || "Fare update failed"
      );
    }
  }
);
//fare delete API
export const fareDeleteApi = createAsyncThunk(
  "executive/company/fare",
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await commonApi.apiCall(
        "delete",
        "/executive/company/fare",
        data,
        true,
        "application/x-www-form-urlencoded"
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Fare deletion failed"
      );
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
    setRoleDetails: (state, action) => {
      state.roleDetails = action.payload;
    },
    clearRoleDetails: (state) => {
      state.roleDetails = null;
    },
    setPermissions: (state, action: PayloadAction<string[]>) => {
      state.permissions = action.payload;
    },
  },
});

export const {
  userLoggedIn,
  userLoggedOut,
  setLoader,
  setLoggedUser,
  splashCompleted,
  setLoginCreds,
  setRoleDetails,
  clearRoleDetails,
  setPermissions,
} = appSlice.actions;
// Export actions

export default appSlice.reducer;

// Slice store data selector function
export const getSplash = (state: RootState) => state.app.splash;
export const getStatus = (state: RootState) => state.app.status;
export const getLoggedIn = (state: RootState) => state.app.loggedIn;
export const getLoggedUser = (state: RootState) => state.app.loggedUser;
export const getLoginCreds = (state: RootState) => state.app.logincreds;
export const getRoleDetails = (state: RootState) => state.app.roleDetails;
