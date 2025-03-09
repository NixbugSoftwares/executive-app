
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
    .required("Username is required")
    .matches(/^[A-Za-z][A-Za-z0-9@._-]{3,31}$/, "Invalid username format"),

  password: yup
    .string()
    .required("Password is required")
    .matches(
      /^[A-Za-z0-9\-+,.@_$%&*#!^=/\?]{8,64}$/,
      "Invalid password format"
    ),
    

  fullName: yup
  .string()
  .optional()
  .matches(/^[A-Za-z]+(?: [A-Za-z]+)*$|^$/, "Invalid full name format")
  .max(32, "Full name cannot exceed 32 characters"),

  

  phoneNumber: yup
  .string()
  .optional()
  .matches(/^[1-9][0-9]{9}$/, "Invalid phone number format"),
 
    

  email: yup
    .string()
    .trim()
    .max(254, "Email cannot exceed 254 characters")
    .matches(/^(?!.*\.\.)[a-zA-Z0-9!#$%&'*+/=?^_{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_{|}~-]+)*@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}|^$/, "Invalid email format")
    .optional(),

    

  gender: yup
    .number(),

    designation: yup
    .string()
    .trim()
    .max(32, "Designation cannot exceed 32 characters")
    .matches(/^[a-zA-Z\s\-\_\(\)]*|^$/, "Invalid designation format")
    .optional(),

  role: yup
  .number()
  .required(), 
  
});



//**************************************************account updation schema **************************************** */


export const accountUpdationFormSchema = yup.object().shape({
  username: yup
    .string()
    .optional()
    .matches(/^[A-Za-z][A-Za-z0-9@._-]{3,31}$/, "Invalid username format"),

  password: yup
    .string()
    .matches(
      /^[A-Za-z0-9\-+,.@_$%&*#!^=/\?]{8,64}$/,
      "Invalid password format"
    ),
    

  fullName: yup
  .string()
  .optional()
  .matches(/^[A-Za-z]+(?: [A-Za-z]+)*$|^$/, "Invalid full name format")
  .max(32, "Full name cannot exceed 32 characters"),

  

  phoneNumber: yup
  .string()
  .optional()
  .matches(/^[1-9][0-9]{9}$/, "Invalid phone number format"),
 
    

  email: yup
    .string()
    .trim()
    .max(254, "Email cannot exceed 254 characters")
    .matches(/^(?!.*\.\.)[a-zA-Z0-9!#$%&'*+/=?^_{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_{|}~-]+)*@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}|^$/, "Invalid email format")
    .optional(),

    

  gender: yup
    .number(),

    designation: yup
    .string()
    .trim()
    .max(32, "Designation cannot exceed 32 characters")
    .matches(/^[a-zA-Z\s\-\_\(\)]*|^$/, "Invalid designation format")
    .optional(),

  role: yup
  .number()
  .required(), 

  status: yup
  .number()
  .optional(),
  
});

//*********************************************************Role creating validation schema********************************************** 
export const roleCreationSchema = yup.object().shape({
  name: yup.string().required("Role name is required"),
  manageExecutive: yup.boolean(),
  manageRole: yup.boolean(),
  manageLandmark: yup.boolean(),
  manageCompany: yup.boolean(),
  manageVendor: yup.boolean(),
  manageRoute: yup.boolean(),
  manageSchedule: yup.boolean(),
  manageService: yup.boolean(),
  manageDuty: yup.boolean(),
});



//*********************************************************landmark creating validation schema********************************************** 

export const landMarkAddSchema = yup.object().shape({
  name: yup.string().required("landmark name  is required"),
  boundary: yup.string().required("Boundary is required")
})