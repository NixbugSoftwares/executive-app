export interface User {
    executive_id: number,
}


export interface Landmark {
    id: number;
    name: string;
    boundary: string;
    status: string;
    importance: string;
  }


export interface BusStop {
    id: number;
    name: string;
    landmark_id: number;
    location: string;
    status: string;
    parsedLocation?: [number, number] | null;
  }