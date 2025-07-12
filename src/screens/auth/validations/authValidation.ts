
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
  .min(4, "Username must be at least 4 characters long")
  .max(32, "Username cannot exceed 32 characters")
  .test(
    'starts-with-letter',
    'Username must start with a letter (a-z or A-Z)',
    (value) => /^[A-Za-z]/.test(value)
  )
  .test(
    'valid-characters',
    'Username can only contain letters, numbers, hyphens (-), periods (.), underscores (_), and @ symbols',
    (value) => /^[A-Za-z][A-Za-z0-9@._-]*$/.test(value)
  )
  .test(
    'no-consecutive-specials',
    'Username cannot have consecutive special characters',
    (value) => !/([@._-]{2,})/.test(value)
  ),
  password: yup
    .string()
    .required("Password is required")
    .matches(
      /^[A-Za-z0-9\-+,.@_$%&*#!^=/\?]{8,64}$/,
      "Invalid password format"
    ),
    
  fullName: yup
  .string()
  .required("Full Name is required")
  .test({
    name: 'fullNameValidation',
    message: (params) => {
      const value = params.value;
      if (/[0-9]/.test(value)) return 'Numbers are not allowed in the full name';
      if (/[^A-Za-z ]/.test(value)) return 'Special characters are not allowed';
      if (!/[A-Za-z]$/.test(value)) return 'Full name must end with a letter';
      if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(value)) return 'Full name should consist of letters separated by single spaces';
      return 'Invalid full name format';
    },
    test: (value) => !value || /^[A-Za-z]+(?: [A-Za-z]+)*$/.test(value)
  })
  .max(32, 'Full name cannot exceed 32 characters'),

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
    .optional()
    .max(32, "Designation cannot exceed 32 characters")
    .test(
      "allowed-characters",
      "Designation can only contain letters, spaces, hyphens (-), underscores (_), and brackets ( )",
      (value) => !value || /^[A-Za-z\s\-_()]*$/.test(value)
    )
    .test(
      "no-leading-trailing-spaces",
      "Designation should not start or end with a space",
      (value) => !value || !/^\s|\s$/.test(value)
    )
    .test(
      "no-consecutive-spaces-or-specials",
      "Designation cannot have consecutive spaces or special characters",
      (value) => !value || !/([\s\-_()]{2,})/.test(value)
    ),
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
  
});

//*********************************************************Role creating validation schema********************************************** 
export const roleCreationSchema = yup.object().shape({
  name: yup.string().required("Role name is required")
  .min(4, "landmark name must be at least 4 characters")
  .max(32, "landmark name cannot exceed 32 characters"),
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
  name: yup.string().required("landmark name  is required")
  .min(4, "landmark name must be at least 4 characters")
  .max(32, "landmark name cannot exceed 32 characters"),
  boundary: yup.string().required("Boundary is required"),
  status: yup.string().required("Status is required"),
  importance: yup.string().required("Importance is required"),
})


//*********************************************************company  creating validation schema**********************************************

export const companyCreationSchema = yup.object().shape({
  name: yup
  .string()
  .required("name name  is required")
  .min(4, "Company name must be at least 4 characters")
  .max(32, "Company name cannot exceed 32 characters"),

  address: yup
  .string()
  .min(4, "Address must be at least 4 characters")
  .max(512, "Address name cannot exceed 32 characters")
  .required("address is required"),

  location: yup
  .string()
  .required("location is required"),

  owner_name: yup
  .string()
  .required("Owner name is required")
  .min(4, "Owner name must be at least 4 characters")
  .max(64, "Owner name cannot exceed 32 characters"),


  phone_number: yup
  .string()
  .required("phone number is required")
  .matches(/^[1-9][0-9]{9}$/, "Invalid phone number format"),
  
  email: yup
    .string()
    .trim()
    .max(254, "Email cannot exceed 254 characters")
    .matches(/^(?!.*\.\.)[a-zA-Z0-9!#$%&'*+/=?^_{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_{|}~-]+)*@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}|^$/, "Invalid email format")
    .optional(),


    company_type: yup
    .string()
    .required(),

    status: yup
    .string()
    .required(),


})



//*********************************************************operator creating validation schema**********************************************



export const operatorCreationSchema = yup.object().shape({
  companyId: yup.number()
  .required("select a company"),

  username: yup
    .string()
    .required("Username is required")
    .matches(/^[A-Za-z][A-Za-z0-9@._-]{3,31}$/, "Invalid username format"),

  password: yup
    .string()
    .required("Password is required")
    .matches(
      /^[A-Za-z0-9\-+,.@_$%&*#!^=/\?]{8,64}$/,
      "Invalid password format"),

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

  role: yup.number()
  .required("Role is required"),

})


//*********************************************************operator role creating validation schema**********************************************
export const operatorRoleCreationSchema = yup.object().shape({
  name: yup.string().required("Role name is required"),
  companyId: yup.number().required("Company is required"),
  manage_bus: yup.boolean(),
  manage_route: yup.boolean(),
  manage_schedule: yup.boolean(),
  manage_role: yup.boolean(),
  manage_operator: yup.boolean(),
  manage_company: yup.boolean(),
});



//******************************************************Company Bus Creation *********************************************** */
export const busCreationSchema = yup.object().shape({
  registrationNumber: yup
  .string()
  .required("Registration number is required")
  .max(16, "Registration number must be at most 16 characters")
  .matches(
    /^[A-Z0-9]+$/,
    "Only uppercase letters and digits are allowed without spaces"
  ),

  name: yup.string().required().min(4).max(32),
  capacity: yup.number().required().min(1).max(120),
  manufactured_on: yup.string().required(),
  insurance_upto: yup.string().nullable().notRequired(),
  pollution_upto: yup.string().nullable().notRequired(),
  fitness_upto: yup.string().nullable().notRequired(),
  road_tax_upto: yup.string().nullable().notRequired(),
});