
import * as yup from "yup";



//******************************************** login validation schema ************************************************
export const loginSchema = yup.object().shape({
  username: yup.string().required("Username is required"),
  password: yup.string().required("Password is required")
});


//******************************************** Account creating validation schema ************************************************


export const accountFormSchema = yup.object().shape({
  username: yup
    .string()
    .matches(/^[A-Za-z][A-Za-z0-9@._-]{3,31}$/, "Invalid username format")
    .required("Username is required"),

  password: yup
    .string()
    .matches(
      /^[A-Za-z0-9\-+,.@_$%&*#!^=/\?]{8,64}$/,
      "Invalid password format"
    )
    .required("Password is required"),

  fullName: yup.string().optional(),

  phoneNumber: yup
    .string()
    // .matches(
    //   /[1-9][0-9]{3,11}$/,
    //   "Invalid phone number format"
    // )
    // .optional(), 
    ,

  email: yup
    .string()
    .email("Invalid email format")
    .max(254, "Email cannot exceed 254 characters")
    .optional(),

  gender: yup
    .number()
    // .oneOf([1, 2, 3, 4], "Invalid gender selection")
    // .optional(),
    ,

  designation: yup
    .string()
    .matches(/^[A-Za-z() _-]{0,64}$/, "Invalid designation format")
    .optional(),
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