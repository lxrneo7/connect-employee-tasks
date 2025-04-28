
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Task } from '../types/task';
import { getTaskById } from '../services/taskService';
import { Loader2, ArrowLeft, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from "@/components/ui/separator";
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { useQuery } from '@tanstack/react-query';

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

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Не указан';
  
  try {
    return format(new Date(dateString), 'd MMMM yyyy', { locale: ru });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Некорректная дата';
  }
};

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const taskId = id ? parseInt(id) : 0;

  // Use React Query for fetching task data with corrected options
  const { data: task, isLoading, isError } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTaskById(taskId),
    enabled: Boolean(taskId) && !isNaN(taskId),
    retry: 1,
    staleTime: 5 * 60 * 1000,
    // Remove the onError option since it's not supported in this version of react-query
    // Instead, handle errors with onSettled or through the component UI
  });

  // Add error toast handling here instead of in onError
  React.useEffect(() => {
    if (isError) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить данные задачи",
      });
    }
  }, [isError, toast]);

  const handleBack = () => {
    navigate(-1); // Navigate back to previous page
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-3xl mx-auto p-4">
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-3xl mx-auto p-4">
          <div className="text-center py-10">
            <p className="text-red-500 mb-4">Ошибка при загрузке задачи</p>
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Вернуться назад
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Button variant="outline" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к списку задач
        </Button>
        
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl font-bold">{task.task_name}</CardTitle>
                <div className="flex gap-2">
                  <Badge className={`${getStatusColor(task.task_status)} text-white`}>
                    {task.task_status}
                  </Badge>
                  <Badge className={`${getPriorityColor(task.task_priority)} text-white`}>
                    {task.task_priority}
                  </Badge>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Дедлайн: {formatDate(task.deadline)}
                </div>
                {task.parent_task && (
                  <div className="flex items-center">
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-blue-500 hover:text-blue-700"
                      onClick={() => navigate(`/tasks/${task.parent_task}`)}
                    >
                      Родительская задача: #{task.parent_task}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          
          <Separator />
          
          <CardContent className="pt-6">
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Описание</h3>
              <p className="text-gray-700 whitespace-pre-line">{task.description || "Описание отсутствует"}</p>
            </div>
            
            {task.subtodo && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Подзадачи</h3>
                <p className="text-gray-700 whitespace-pre-line">{task.subtodo}</p>
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Исполнитель</h3>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={task.employee_info.full_path_image} />
                  <AvatarFallback>
                    {task.employee_info.name[0]}{task.employee_info.surname[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{task.employee_info.full_name}</p>
                  <p className="text-sm text-gray-500">
                    {task.employee_info.position.title}, {task.employee_info.department}
                  </p>
                  <p className="text-sm text-gray-500">
                    Кабинет {task.employee_info.room_number}
                  </p>
                </div>
              </div>
            </div>
            
            {task.comments && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Комментарии</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-line">{task.comments}</p>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-end gap-3 pt-2">
            <Button variant="outline">Изменить</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default TaskDetailPage;
