import * as yup from "yup";

//******************************************** login validation schema ************************************************
export const loginSchema = yup.object().shape({
  username: yup
    .string()
    .required("Username is required")
    .matches(/^[a-zA-Z]/, "Username must start with an alphabet")
    .matches(/^[a-zA-Z0-9.@_-]+$/, "Username can only contain letters, digits, ., @, _, or -")
    .min(4, "Username must be at least 4 characters")
    .max(32, "Username cannot exceed 32 characters")
    .test(
      "no-consecutive-spaces",
      "Username cannot have consecutive spaces",
      (value) => !/\s{2,}/.test(value)
    )
    .test(
      "no-leading-trailing-spaces",
      "Username cannot have leading or trailing spaces",
      (value) => value?.trim() === value
    ),

  password: yup
  .string()
  .required("Password is required")
  .min(8, "Password must be at least 8 characters")
  .max(32, "Password cannot exceed 32 characters")
  .matches(
    /^[A-Za-z0-9\-+,.@_$%&*#!^=/?]+$/,
    "Password can only contain: letters (A-Z, a-z), numbers (0-9), and these special characters: - + , . @ _ $ % & * # ! ^ = / ?"
  )
  .test(
    "no-spaces",
    "Password cannot contain any spaces",
    (value) => !/\s/.test(value)
  ),
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
  .min(8, "Password must be at least 8 characters")
  .max(32, "Password cannot exceed 32 characters")
  .matches(
    /^[A-Za-z0-9\-+,.@_$%&*#!^=/?]+$/,
    "Password can only contain: letters (A-Z, a-z), numbers (0-9), and these special characters: - + , . @ _ $ % & * # ! ^ = / ?"
  )
  .test(
    "no-spaces",
    "Password cannot contain any spaces",
    (value) => !/\s/.test(value)
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
  .test(
    "is-valid-email",
    "Please enter a valid email address eg: user@example.com",
    (value) => {
      if (!value) return true; 
      return /^(?!.*\s)(?!.*\.\.)[a-zA-Z0-9!#$%&'*+/=?^_{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_{|}~-]+)*@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/.test(value);
    }
  )
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
  
});


//*********************************************************Role creating validation schema********************************************** 
export const roleCreationSchema = yup.object().shape({
  name: yup.string()
    .required("Role name is required")
     .matches(/^\S(?:.*\S)?$/, "Role name cannot start or end with a space")
    .min(4, "Role name must be at least 4 characters")
    .max(32, "Role name cannot exceed 32 characters"),

  
  // Token Management
  manage_ex_token: yup.boolean(),
  manage_op_token: yup.boolean(),
  manage_ve_token: yup.boolean(),
  
  // Executive Permissions
  create_executive: yup.boolean(),
  update_executive: yup.boolean(),
  delete_executive: yup.boolean(),
  
  // Landmark Permissions
  create_landmark: yup.boolean(),
  update_landmark: yup.boolean(),
  delete_landmark: yup.boolean(),
  
  // Company Permissions
  create_company: yup.boolean(),
  update_company: yup.boolean(),
  delete_company: yup.boolean(),
  
  // Operator Permissions
  create_operator: yup.boolean(),
  update_operator: yup.boolean(),
  delete_operator: yup.boolean(),
  
  // Business Permissions
  create_business: yup.boolean(),
  update_business: yup.boolean(),
  delete_business: yup.boolean(),
  
  // Route Permissions
  create_route: yup.boolean(),
  update_route: yup.boolean(),
  delete_route: yup.boolean(),
  
  // Bus Permissions
  create_bus: yup.boolean(),
  update_bus: yup.boolean(),
  delete_bus: yup.boolean(),
  
  // Vendor Permissions
  create_vendor: yup.boolean(),
  update_vendor: yup.boolean(),
  delete_vendor: yup.boolean(),
  
  // Schedule Permissions
  create_schedule: yup.boolean(),
  update_schedule: yup.boolean(),
  delete_schedule: yup.boolean(),
  
  // Service Permissions
  create_service: yup.boolean(),
  update_service: yup.boolean(),
  delete_service: yup.boolean(),
  
  // Fare Permissions
  create_fare: yup.boolean(),
  update_fare: yup.boolean(),
  delete_fare: yup.boolean(),
  
  // Duty Permissions
  create_duty: yup.boolean(),
  update_duty: yup.boolean(),
  delete_duty: yup.boolean(),
  
  // Role Permissions
  create_ex_role: yup.boolean(),
  update_ex_role: yup.boolean(),
  delete_ex_role: yup.boolean(),
  create_op_role: yup.boolean(),
  update_op_role: yup.boolean(),
  delete_op_role: yup.boolean(),
  create_ve_role: yup.boolean(),
  update_ve_role: yup.boolean(),
  delete_ve_role: yup.boolean(),
});



//*********************************************************landmark creating validation schema********************************************** 

export const landMarkAddSchema = yup.object().shape({
  name: yup.string().required("landmark name  is required")
  .min(4, "landmark name must be at least 4 characters")
  .max(32, "landmark name cannot exceed 32 characters")
  .test(
      "allowed-characters",
      "Name can only contain letters, spaces, hyphens (-), underscores (_), and brackets ( )",
      (value) => !value || /^[A-Za-z\s\-_()]*$/.test(value)
    )
    .test(
      "no-leading-trailing-spaces",
      "Name should not start or end with a space",
      (value) => !value || !/^\s|\s$/.test(value)
    )
    .test(
      "no-consecutive-spaces-or-specials",
      "Name cannot have consecutive spaces or special characters",
      (value) => !value || !/([\s\-_()]{2,})/.test(value)
    ),

  boundary: yup.string().required("Boundary is required"),
  type:yup.string().optional(),
})

export const busStopCreationSchema = yup.object().shape({
  name: yup.string().required("Bus stop name is required")
  .min(4, "Bus stop name must be at least 4 characters")
  .max(128, "Bus stop name cannot exceed 128 characters")
  .test(
      "allowed-characters",
      "Name can only contain letters, spaces, hyphens (-), underscores (_), and brackets ( )",
      (value) => !value || /^[A-Za-z\s\-_()]*$/.test(value)
    )
    .test(
      "no-leading-trailing-spaces",
      "Name should not start or end with a space",
      (value) => !value || !/^\s|\s$/.test(value)
    )
    .test(
      "no-consecutive-spaces-or-specials",
      "Name cannot have consecutive spaces or special characters",
      (value) => !value || !/([\s\-_()]{2,})/.test(value)
    ),
  location: yup.string().required("Location coordinates are required"),
  landmark_id: yup.string().required("Landmark ID is required"),
})


//*********************************************************company  creating validation schema**********************************************

export const companyCreationSchema = yup.object().shape({
  name: yup
  .string()
  .required("Name is required")
  .test('no-empty-string', 'Name cannot be empty', value => value.trim().length > 0)
  .min(2, "Name must be at least 2 characters")
  .max(32, "Name cannot exceed 32 characters")
  .test('no-leading-trailing-spaces', 'Name cannot start or end with spaces', value => {
    return value === value.trim();
  })
  .test('no-consecutive-spaces', 'Name cannot have consecutive spaces', value => {
    return !/\s{2,}/.test(value);
  }),

  address: yup
  .string()
  .required("Address is required")
  .test('not-empty', 'Address cannot be empty', value => value.trim().length > 0)
  .min(4, "Address must be at least 4 characters")
  .max(512, "Address cannot exceed 512 characters") // Fixed the max length message
  .test('no-leading-trailing-spaces', 'Address cannot start or end with spaces', value => {
    return value === value.trim();
  })
  .test('no-consecutive-spaces', 'Address cannot have consecutive spaces', value => {
    return !/\s{2,}/.test(value);
  })
  .test('valid-address', 'Address contains invalid characters', value => {
    // Allows letters, numbers, basic punctuation, and spaces
    return /^[a-zA-Z0-9\s\-.,#'/]+$/.test(value);
  }),
  location: yup
  .string()
  .required("location is required"),

owner_name: yup
  .string()
  .required("Owner name is required")
  .test('not-empty', 'Owner name cannot be empty', value => value.trim().length > 0)
  .min(4, "Owner name must be at least 4 characters")
  .max(64, "Owner name cannot exceed 64 characters") // Fixed: Your original had "32" in the error message
  .test('no-leading-trailing-spaces', 'Owner name cannot start or end with spaces', value => {
    return value === value.trim();
  })
  .test('no-consecutive-spaces', 'Owner name cannot have consecutive spaces', value => {
    return !/\s{2,}/.test(value);
  })
  .test('valid-chars', 'Owner name can only contain letters, spaces, hyphens (-), and apostrophes (\')', value => {
    return /^[A-Za-z\s\-']+$/.test(value); // Allows letters, spaces, hyphens, and apostrophes
  }),

  phone_number: yup
  .string()
  .required("phone number is required")
  .matches(/^[1-9][0-9]{9}$/, "Invalid phone number format"),
  
  email: yup
    .string()
    .required("Email is required")
    .trim()
    .max(254, "Email cannot exceed 254 characters")
    .matches(/^(?!.*\.\.)[a-zA-Z0-9!#$%&'*+/=?^_{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_{|}~-]+)*@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}|^$/, "Invalid email format"),


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
    /^[A-Za-z0-9\-+,.@_$%&*#!^=/?](?:[A-Za-z0-9\-+,.@_$%&*#!^=/? ]*[A-Za-z0-9\-+,.@_$%&*#!^=?/])?$/,
    "Password must be 8-64 characters, cannot start/end with space or have consecutive spaces"
  )
  .matches(
    /^.{8,64}$/,
    "Password must be between 8-64 characters"
  )
  .test(
    "no-consecutive-spaces",
    "Password cannot have consecutive spaces",
    (value) => !/\s{2,}/.test(value)
  )
  .test(
    "allowed-chars",
    "You can use letters (A-Z, a-z), numbers (0-9), and special characters (-+,.@_$%&*#!^=/?). Spaces are allowed but not at the start/end or consecutive.",
    (value) => /^[A-Za-z0-9\-+,.@_$%&*#!^=/? ]+$/.test(value)
  ),

  fullName: yup
    .string()
    .required("Full name is required")
    .matches(/^[A-Za-z]+(?: [A-Za-z]+)*$|^$/, "Invalid full name format")
    .min(4, "Full name must be at least 4 characters")
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
    // Token Management
  manage_token: yup.boolean(),
  
  // Company Permissions
  update_company: yup.boolean(),
  
  // Operator Permissions
  create_operator: yup.boolean(),
  update_operator: yup.boolean(),
  delete_operator: yup.boolean(),
  // Route Permissions
  create_route: yup.boolean(),
  update_route: yup.boolean(),
  delete_route: yup.boolean(),
  
  // Bus Permissions
  create_bus: yup.boolean(),
  update_bus: yup.boolean(),
  delete_bus: yup.boolean(),
  // Schedule Permissions
  create_schedule: yup.boolean(),
  update_schedule: yup.boolean(),
  delete_schedule: yup.boolean(),
  
  // Service Permissions
  create_service: yup.boolean(),
  update_service: yup.boolean(),
  delete_service: yup.boolean(),
  
  // Fare Permissions
  create_fare: yup.boolean(),
  update_fare: yup.boolean(),
  delete_fare: yup.boolean(),
  
  // Duty Permissions
  create_duty: yup.boolean(),
  update_duty: yup.boolean(),
  delete_duty: yup.boolean(),
  
  // Role Permissions
  create_role: yup.boolean(),
  update_role: yup.boolean(),
  delete_role: yup.boolean(),
});



//******************************************************Company Bus Creation *********************************************** */
export const busCreationSchema = yup.object().shape({
  company_id: yup.number().required("Company is required"),
   registration_number: yup
    .string()
    .required("Registration number is required")
    .max(16, "The registration number should not exceed 16 characters")
    .matches(
      /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{1,4}$/,
      "Format: e.g., KA01AB1234 — 2 letters, 2 digits, 1-2 letters, 1-4 digits"
    ),

   name: yup.string().required("Bus name is required")
  .min(4, "Bus name must be at least 4 characters")
  .max(32, "Bus name cannot exceed 32 characters")
  .test(
      "allowed-characters",
      "Name can only contain letters, spaces, hyphens (-), underscores (_), and brackets ( )",
      (value) => !value || /^[A-Za-z\s\-_()]*$/.test(value)
    )
    .test(
      "no-leading-trailing-spaces",
      "Name should not start or end with a space",
      (value) => !value || !/^\s|\s$/.test(value)
    )
    .test(
      "no-consecutive-spaces-or-specials",
      "Name cannot have consecutive spaces or special characters",
      (value) => !value || !/([\s\-_()]{2,})/.test(value)
    ),
  capacity: yup
    .number()
    .required('Capacity is required')
    .typeError('Capacity must be a number')
    .min(1, 'Capacity must be at least 1')
    .max(120, 'Capacity cannot exceed 120')
    .integer('Capacity must be a whole number'),
  manufactured_on: yup.string().required(),
  insurance_upto: yup.string().nullable().notRequired(),
  pollution_upto: yup.string().nullable().notRequired(),
  fitness_upto: yup.string().nullable().notRequired(),
  road_tax_upto: yup.string().nullable().notRequired(),
});