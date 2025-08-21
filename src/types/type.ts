export interface User {
  executive_id: number;
}

export interface Account {
  id: number;
  fullName: string;
  username: string;
  password?: string;
  gender: string;
  designation: string;
  email_id: string;
  phoneNumber: string;
  status: string;
  created_on: string;
  updated_on: string;
}

export interface RoleDetails {
  manage_ex_token?: boolean;
  manage_op_token?: boolean;
  manage_ve_token?: boolean;
  create_executive?: boolean;
  update_executive?: boolean;
  delete_executive?: boolean;
  create_landmark?: boolean;
  update_landmark?: boolean;
  delete_landmark?: boolean;
  create_company?: boolean;
  update_company?: boolean;
  delete_company?: boolean;
  create_operator?: boolean;
  update_operator?: boolean;
  delete_operator?: boolean;
  create_business?: boolean;
  update_business?: boolean;
  delete_business?: boolean;
  create_route?: boolean;
  update_route?: boolean;
  delete_route?: boolean;
  create_bus?: boolean;
  update_bus?: boolean;
  delete_bus?: boolean;
  create_vendor?: boolean;
  update_vendor?: boolean;
  delete_vendor?: boolean;
  create_schedule?: boolean;
  update_schedule?: boolean;
  delete_schedule?: boolean;
  create_service?: boolean;
  update_service?: boolean;
  delete_service?: boolean;
  create_fare?: boolean;
  update_fare?: boolean;
  delete_fare?: boolean;
  create_duty?: boolean;
  update_duty?: boolean;
  delete_duty?: boolean;
  create_ex_role?: boolean;
  update_ex_role?: boolean;
  delete_ex_role?: boolean;
  create_op_role?: boolean;
  update_op_role?: boolean;
  delete_op_role?: boolean;
  create_ve_role?: boolean;
  update_ve_role?: boolean;
  delete_ve_role?: boolean;
}

export interface Landmark {
  id: number;
  name: string;
  boundary: string;
  status: string;
  importance: string;
  type: string;
  arrivalTime: string;
  departureTime: string;
}

export interface BusStop {
  id: number;
  name: string;
  landmark_id: number;
  location: string;
  status: string;
}

export interface Company {
  id: number;
  name: string;
  contact_person: string;
  location: string;
  phone_number: string;
  address: string;
  email_id: string;
  status: string;
  companyType: string;
  latitude: number;
  longitude: number;
  created_on: string;
  updated_on: string;
}
export interface Operator {
  id: number;
  company_id: number;
  companyName: string;
  username: string;
  fullName: string;
  password: string;
  gender: string;
  email_id: string;
  phoneNumber: string;
  status: string;
  created_on: string;
  updated_on: string;
}
export interface OperatorRoleDetails {
  manage_operator: boolean;
  manage_bus: boolean;
  manage_route: boolean;
  manage_schedule: boolean;
  manage_role: boolean;
  manage_company: boolean;
  manage_fare: boolean;
  manage_duty: boolean;
  manage_service: boolean;
}
export interface Bus {
  company_id: number;
  id: number;
  registrationNumber: string;
  name: string;
  capacity: number;
  model: string;
  manufactured_on: string;
  insurance_upto: string;
  pollution_upto: string;
  fitness_upto: string;
  road_tax_upto: string;
  status: number;
}
export interface SelectedLandmark {
  id: number;
  name: string;
  sequenceId?: number;
  start_time: string;

  // Final UTC-converted times
  arrivalTime: { fullTime: string };
  departureTime: { fullTime: string };

  // Day offsets and deltas
  arrivalDayOffset: number;
  departureDayOffset: number;
  arrivalDelta: number;
  departureDelta: number;
  distance_from_start: number;

  // These are needed during the conversion
  arrivalHour?: number;
  arrivalMinute?: number;
  arrivalAmPm?: "AM" | "PM";
  departureHour?: number;
  departureMinute?: number;
  departureAmPm?: "AM" | "PM";
}
export interface RouteLandmark {
  id: number;
  landmark_id: string;
  name: string;
  start_time: string;
  arrival_delta: string;
  departure_delta: string;
  arrivalTime: { fullTime: string };
  departureTime: { fullTime: string };
  distance_from_start?: number;
  sequence_id?: number;
}

export interface Fare {
  id: number;
  name: string;
  company_id: number | null;
  version: number;
  function: string;
  scope: number;
  attributes: {
    df_version: number;
    ticket_types: { id: number; name: string }[];
    currency_type: string;
    distance_unit: string;
    extra: Record<string, any>;
  };
  created_on: string;
}

export interface Service {
  id: number;
  name: string;
  company_id: number;
  bus_id: number;
  route_id: number;
  fare_id: number;
  fareName: string;
  routeName: string;
  status: string;
  ticket_mode: string;
  created_mode: string;
  starting_at: string;
  ending_at: string;
  remarks: string;
  created_on: string;
  updated_on: string;
}

export interface Schedule {
  id: number;
  service_id: number;
  name: string;
  permit_no: string;
  triggering_mode: number;
  ticketing_mode: number;
  frequency: number[];
  bus_id: number;
  route_id: number;
  fare_id: number;
  created_on: string;
  updated_on: string;
  routeName: string;
}

export interface Duty {
  id: number;
  company_id: number;
  operator_id: number;
  service_id: number;
  operatorName: string;
  serviceName: string;
  status: string;
  type: string;
  created_on: string;
  updated_on: string;
  collection: number;
}

export interface PaperTicket {
  id: number;
  service_id: number;
  duty_id: number;
  sequence_id: number;
  pickup_point: number;
  dropping_point: number;
  pickupName: string;
  droppingName: string;
  amount: number;
  distance: number;
  ticket_types: { name: string; count: number }[];
  created_on: string | null;
}
