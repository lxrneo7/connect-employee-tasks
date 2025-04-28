
import { Employee } from './employee';

export interface Task {
  id: number;
  parent_task?: number | null;
  employee_info: {
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
  };
  task_name: string;
  description: string;
  task_status: string;
  task_priority: string;
  deadline: string;
  subtodo?: string;
  comments?: string;
}
