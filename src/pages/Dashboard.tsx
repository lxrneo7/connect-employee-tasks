
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut } from "lucide-react";

const Dashboard: React.FC = () => {
  const { state, dispatch } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");

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
              <Button>Новая задача</Button>
            </div>
            
            <TabsContent value="all">
              <div className="text-center py-10">
                <p className="text-gray-500">Список задач будет отображаться здесь</p>
              </div>
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
