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
  created_on  : string;
}

export interface RoleDetails {
  manage_executive?: boolean;
  manage_role?: boolean;
  manage_landmark?: boolean;
  manage_company?: boolean;
  manage_vendor?: boolean;
  manage_route?: boolean;
  manage_schedule?: boolean;
  manage_service?: boolean;
  manage_duty?: boolean;
  manage_fare?: boolean;
}

export interface Landmark {
  id: number;
  name: string;
  boundary: string;
  status: string;
  importance: string;
  type: string;
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
}
export interface OperatorRoleDetails{
  manage_operator: boolean
  manage_bus: boolean,
  manage_route: boolean,
  manage_schedule: boolean,
  manage_role: boolean,
  manage_company: boolean,
  manage_fare: boolean,
  manage_duty: boolean,
  manage_service: boolean
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
  starting_time: string;

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
  starting_time: string;
  arrival_delta: string;
  departure_delta: string;
  arrivalTime: {  fullTime: string };
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


export interface Service{
  id:number
  name:string
  company_id:number
  bus_id:number
  route_id:number
  fare_id:number
  status:string
  ticket_mode:string
  created_mode:string
  starting_date:string
  remarks:string
}

export interface Schedule{
  id:number
  service_id:number
  name:string
  permit_no:string
  trigger_mode:number
  ticket_mode:number
  frequency:number[] 
  bus_id:number
  route_id:number
  fare_id:number
}

export interface Duty{
  id:number
  operator_id:number
  service_id:number
  operatorName:string
  serviceName:string
  status:string
  type:string
  created_on:string
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
  ticket_types: { name: string; count: number; }[];
  created_on: string | null;
}