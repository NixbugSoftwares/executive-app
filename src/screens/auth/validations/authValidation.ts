
import * as yup from "yup";



//******************************************** login validation schema ************************************************
export const loginSchema = yup.object().shape({
  username: yup.string().required("Username is required"),
  password: yup.string().required("Password is required")
});


//******************************************** Account creating validation schema ************************************************
export const accountRegisterSchema = yup.object().shape({
  username: yup.string().required("Username is required"),
  password: yup.string().required("Password is required"),

});

//*********************************************************Role creating validation schema********************************************** 
export const RoleCreationSchema = yup.object().shape({
  name: yup.string().required("Role name is required")
});



//*********************************************************landmark creating validation schema********************************************** 

export const landMarkAddSchema = yup.object().shape({
  name: yup.string().required("landmark name  is required"),
  boundary: yup.string().required("Boundary is required")
})