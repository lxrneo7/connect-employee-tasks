
import { getAccessToken } from './authService';
import { Task } from '../types/task';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.38.236:8000';

export const fetchTasks = async (): Promise<Task[]> => {
  const token = getAccessToken();
  
  try {
    console.log('Fetching tasks from API...');
    const response = await fetch(`${API_BASE_URL}/api/v1/todo/todos/`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('Error fetching tasks:', response.status, response.statusText);
      throw new Error('Failed to fetch tasks');
    }
    
    const data = await response.json();
    console.log('Received tasks data:', data);
    return data;
  } catch (error) {
    console.error('Error in fetchTasks:', error);
    throw error;
  }
};

export const getTaskById = async (id: number): Promise<Task> => {
  const token = getAccessToken();
  
  try {
    console.log(`Fetching task with ID ${id}...`);
    const response = await fetch(`${API_BASE_URL}/api/v1/todo/todos/${id}/`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('Error fetching task details:', response.status, response.statusText);
      throw new Error('Failed to fetch task details');
    }
    
    const data = await response.json();
    console.log('Received task details:', data);
    return data;
  } catch (error) {
    console.error('Error in getTaskById:', error);
    throw error;
  }
};
