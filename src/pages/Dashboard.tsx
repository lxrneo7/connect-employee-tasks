
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { useQuery } from '@tanstack/react-query';
import { fetchTasks } from '../services/taskService';

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Task } from '../types/task';

const Dashboard: React.FC = () => {
  const { state, dispatch } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");

  // Используем React Query для запроса задач
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
    staleTime: 5 * 60 * 1000, // 5 минут
    retry: 2,
  });

  const handleLogout = async () => {
    await logout();
    dispatch({ type: 'LOGOUT' });
    toast({
      title: "Выход выполнен",
      description: "Вы успешно вышли из системы"
    });
    navigate('/login');
  };

  const currentUser = getCurrentUser();

  // Фильтрация задач в зависимости от активной вкладки
  const filteredTasks = tasks.filter((task: Task) => {
    if (activeTab === "all") return true;
    // Для демонстрации, можно расширить логику фильтрации по необходимости
    return true;
  });

  const handleTaskClick = (id: number) => {
    navigate(`/tasks/${id}`);
  };

  // Вспомогательные функции для отображения статуса и приоритета
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Новая': return 'bg-blue-500';
      case 'В процессе': return 'bg-yellow-500';
      case 'Выполнено': return 'bg-green-500';
      case 'Завершена': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Критический': return 'bg-red-500';
      case 'Высокий': return 'bg-orange-500';
      case 'Средний': return 'bg-yellow-500';
      case 'Низкий': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ru-RU');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Система управления задачами</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Привет, {currentUser?.username || 'Пользователь'}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="all">Все задачи</TabsTrigger>
                <TabsTrigger value="my">Мои задачи</TabsTrigger>
                <TabsTrigger value="created">Созданные мной</TabsTrigger>
              </TabsList>
              <Button onClick={() => console.log('Открыть форму создания задачи')}>
                Новая задача
              </Button>
            </div>
            
            <TabsContent value="all">
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center py-10">
                  <p className="text-red-500">Ошибка при загрузке задач</p>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">Задач не найдено</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Приоритет</TableHead>
                      <TableHead>Исполнитель</TableHead>
                      <TableHead>Дедлайн</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task: Task) => (
                      <TableRow 
                        key={task.id} 
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => handleTaskClick(task.id)}
                      >
                        <TableCell className="font-medium">{task.task_name}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(task.task_status)} text-white`}>
                            {task.task_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getPriorityColor(task.task_priority)} text-white`}>
                            {task.task_priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={task.employee_info.full_path_image} />
                              <AvatarFallback>
                                {task.employee_info.name.substring(0, 1)}{task.employee_info.surname.substring(0, 1)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{task.employee_info.full_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(task.deadline)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
            <TabsContent value="my">
              <div className="text-center py-10">
                <p className="text-gray-500">Ваши задачи будут отображаться здесь</p>
              </div>
            </TabsContent>
            <TabsContent value="created">
              <div className="text-center py-10">
                <p className="text-gray-500">Созданные вами задачи будут отображаться здесь</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
