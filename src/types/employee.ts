
export interface Employee {
  id: number;
  surname: string;
  name: string;
  last_name: string;
  image: string;
  full_path_image: string;
  work_phone_num: string;
  personal_phone_num: string;
  email: string;
  position: {
    id: number;
    title: string;
  };
  department: string;
  room_number: string;
  full_name: string;
  order: number;
}
