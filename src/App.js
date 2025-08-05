import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

// 注册Chart.js组件
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// 工具函数：格式化日期为YYYY-MM-DD
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// 工具函数：获取当前日期
const getToday = () => {
  return formatDate(new Date());
};

// 任务分类
const TASK_CATEGORIES = [
  { id: 'skill', name: '技能', icon: 'graduation-cap', color: 'blue' },
  { id: 'fitness', name: '健身', icon: 'heartbeat', color: 'red' },
  { id: 'habit', name: '好习惯', icon: 'leaf', color: 'green' },
  { id: 'growth', name: '成长', icon: 'line-chart', color: 'purple' },
  { id: 'finance', name: '财务', icon: 'money', color: 'yellow' },
  { id: 'social', name: '社交', icon: 'users', color: 'cyan' },
];

// 每日任务重置逻辑
const resetDailyTasks = (tasks) => {
  const today = getToday();
  return tasks.map((task) => {
    // 仅处理「每日任务」且「已完成」且「最后完成日期不是今天」的任务
    if (
      task.repeat === 'daily' && 
      task.completed && 
      task.lastCompletedDate !== today
    ) {
      return { ...task, completed: false };
    }
    return task;
  });
};

// 页面组件
const Home = () => {
  const navigate = useNavigate();
  
  // 从localStorage获取数据用于展示统计
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalExp: 0,
    level: 1
  });
  
  // 获取今日任务
  const [todayTasks, setTodayTasks] = useState([]);
  const today = getToday();
  
  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('lifeGameTasks') || '[]');
    // 调用「每日任务重置」函数
    const resetTasks = resetDailyTasks(storedTasks); 
    localStorage.setItem('lifeGameTasks', JSON.stringify(resetTasks));
    
    const completedTasks = resetTasks.filter(task => task.completed).length;
    const totalExp = resetTasks
      .filter(task => task.completed)
      .reduce((sum, task) => sum + task.exp, 0);
    const level = Math.floor(totalExp / 1000) + 1;
    
    setStats({
      totalTasks: resetTasks.length,
      completedTasks,
      totalExp,
      level
    });
    
    // 筛选今日任务
    const filtered = resetTasks.filter(task => {
      const taskDate = new Date(task.specificDate || task.startDate);
      const taskFormatted = formatDate(taskDate);
      
      // 特定日期任务
      if (task.repeat === 'once' && taskFormatted === today) {
        return true;
      }
      
      // 每日任务
      if (task.repeat === 'daily') {
        const start = new Date(task.startDate);
        const end = new Date(task.endDate);
        const now = new Date(today);
        return now >= start && now <= end;
      }
      
      // 每周任务（同一天）
      if (task.repeat === 'weekly') {
        const start = new Date(task.startDate);
        const end = new Date(task.endDate);
        const now = new Date(today);
        if (now < start || now > end) return false;
        
        const taskDay = new Date(task.startDate).getDay();
        const todayDay = now.getDay();
        return taskDay === todayDay;
      }
      
      // 每月任务（同一天）
      if (task.repeat === 'monthly') {
        const start = new Date(task.startDate);
        const end = new Date(task.endDate);
        const now = new Date(today);
        if (now < start || now > end) return false;
        
        const taskDate = new Date(task.startDate).getDate();
        const todayDate = now.getDate();
        return taskDate === todayDate;
      }
      
      return false;
    });
    
    setTodayTasks(filtered);
  }, [today]);
  
  // 计算今日任务完成情况
  const todayCompleted = todayTasks.filter(task => task.completed).length;
  const todayCompletionRate = todayTasks.length > 0 
    ? Math.round((todayCompleted / todayTasks.length) * 100) 
    : 0;
  
  // 切换任务完成状态
  const toggleTask = (id) => {
    const tasks = JSON.parse(localStorage.getItem('lifeGameTasks') || '[]');
    let updatedTasks = [];
    let pointsToAdd = 0;
    
    // 修复语法错误：将updated改为for
    for (const task of tasks) {
      if (task.id === id && !task.completed) {
        pointsToAdd = task.points;
        updatedTasks.push({ 
          ...task, 
          completed: true,
          lastCompletedDate: getToday() // 记录最后完成日期
        });
      } else if (task.id === id && task.completed) {
        // 取消完成时扣除积分
        pointsToAdd = -task.points;
        updatedTasks.push({ 
          ...task, 
          completed: false,
          lastCompletedDate: null
        });
      } else {
        updatedTasks.push(task);
      }
    }
    
    // 更新任务
    localStorage.setItem('lifeGameTasks', JSON.stringify(updatedTasks));
    setTodayTasks(updatedTasks.filter(task => {
      // 重新筛选今日任务
      const taskDate = new Date(task.specificDate || task.startDate);
      const taskFormatted = formatDate(taskDate);
      
      if (task.repeat === 'once' && taskFormatted === today) return true;
      if (task.repeat === 'daily') {
        const start = new Date(task.startDate);
        const end = new Date(task.endDate);
        const now = new Date(today);
        return now >= start && now <= end;
      }
      if (task.repeat === 'weekly') {
        const start = new Date(task.startDate);
        const end = new Date(task.endDate);
        const now = new Date(today);
        if (now < start || now > end) return false;
        return new Date(task.startDate).getDay() === now.getDay();
      }
      if (task.repeat === 'monthly') {
        const start = new Date(task.startDate);
        const end = new Date(task.endDate);
        const now = new Date(today);
        if (now < start || now > end) return false;
        return new Date(task.startDate).getDate() === now.getDate();
      }
      return false;
    }));
    
    // 更新积分
    if (pointsToAdd !== 0) {
      const currentPoints = parseInt(localStorage.getItem('lifeGamePoints') || '0');
      localStorage.setItem('lifeGamePoints', (currentPoints + pointsToAdd).toString());
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          游戏化人生管理工具
        </h1>
        <p className="text-xl text-gray-300">创建任务，积累经验，解锁成就，兑换奖励！</p>
        
        <div className="mt-6 inline-flex items-center bg-gray-800 px-4 py-2 rounded-full">
          <i className="fa fa-star text-yellow-400 mr-2"></i>
          <span>等级 {stats.level}</span>
          <div className="mx-3 h-2 bg-gray-700 rounded-full flex-1 w-40">
            <div 
              className="h-full bg-blue-500 rounded-full" 
              style={{ width: `${(stats.totalExp % 1000) / 10}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-400">{stats.totalExp} XP</span>
        </div>
      </div>

      {/* 今日任务概览模块 */}
      <div className="mb-10 bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <i className="fa fa-calendar-check-o mr-2 text-blue-400"></i>
            今日任务 ({today})
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-gray-300">{todayCompleted}/{todayTasks.length} 完成</span>
            <div className="h-2 bg-gray-700 rounded-full w-24">
              <div 
                className="h-full rounded-full"
                style={{ 
                  width: `${todayCompletionRate}%`,
                  backgroundColor: todayCompletionRate > 70 ? 'rgb(16, 185, 129)' : 
                                 todayCompletionRate > 30 ? 'rgb(234, 179, 8)' : 'rgb(239, 68, 68)'
                }}
              ></div>
            </div>
            <button 
              onClick={() => navigate('/tasks')}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            >
              管理所有任务
            </button>
          </div>
        </div>
        
        {todayTasks.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            <i className="fa fa-inbox text-4xl mb-3"></i>
            <p>今天没有任务，去创建新任务吧！</p>
            <button 
              onClick={() => navigate('/tasks#add-task')}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
            >
              <i className="fa fa-plus mr-1"></i>添加新任务
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {todayTasks.map(task => {
              const category = TASK_CATEGORIES.find(c => c.id === task.category);
              return (
                <div 
                  key={task.id}
                  className={`p-4 rounded-lg flex justify-between items-center ${
                    task.completed 
                      ? 'bg-gray-700 line-through text-gray-400' 
                      : task.difficulty === 'easy' 
                        ? 'bg-green-900/30' 
                        : task.difficulty === 'medium'
                          ? 'bg-yellow-900/30'
                          : 'bg-red-900/30'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        task.completed ? 'bg-green-500' : 'border-2 border-gray-400'
                      }`}
                    >
                      {task.completed && <i className="fa fa-check text-white text-xs"></i>}
                    </button>
                    <div className="flex items-center gap-2">
                      <i className={`fa fa-${category?.icon} text-${category?.color}-400`}></i>
                      <span>{task.title}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-gray-700 rounded text-sm flex items-center gap-1">
                      <i className="fa fa-diamond text-blue-400"></i> {task.exp} XP
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <ModuleCard 
          title="任务管理" 
          icon="check-square-o" 
          description="查看和管理所有任务，设置重复周期" 
          onClick={() => navigate('/tasks')}
        />
        <ModuleCard 
          title="成就系统" 
          icon="trophy" 
          description="完成分类目标，解锁专属成就" 
          onClick={() => navigate('/achievements')}
        />
        <ModuleCard 
          title="数据统计" 
          icon="line-chart" 
          description="分析完成情况，优化时间管理" 
          onClick={() => navigate('/stats')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ModuleCard 
          title="幸运抽奖" 
          icon="gift" 
          description="消耗积分参与抽奖，赢取奖励" 
          onClick={() => navigate('/lottery')}
        />
        <ModuleCard 
          title="心愿清单" 
          icon="list-alt" 
          description="记录愿望，用成就积分兑换实现" 
          onClick={() => navigate('/wishes')}
        />
      </div>
    </div>
  );
};

const Tasks = () => {
  // 任务状态管理
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('lifeGameTasks');
    return saved ? JSON.parse(saved) : [];
  });
  const today = getToday();
  const [activeCategory, setActiveCategory] = useState('all');
  const [editingTask, setEditingTask] = useState(null);

  // 任务表单状态
  const [taskForm, setTaskForm] = useState({
    title: '',
    category: 'skill',
    difficulty: 'medium',
    repeat: 'daily', // daily, weekly, monthly, once, range
    startDate: today,
    endDate: today,
    specificDate: today
  });

  // 保存任务到localStorage
  useEffect(() => {
    localStorage.setItem('lifeGameTasks', JSON.stringify(tasks));
  }, [tasks]);

  // 处理任务表单变化
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setTaskForm(prev => ({ ...prev, [name]: value }));
  };

  // 添加新任务
  const addTask = () => {
    if (!taskForm.title.trim()) return;
    
    const expMap = { easy: 30, medium: 50, hard: 100 };
    const newTask = {
      id: Date.now(),
      title: taskForm.title,
      category: taskForm.category,
      difficulty: taskForm.difficulty,
      repeat: taskForm.repeat,
      startDate: taskForm.startDate,
      endDate: taskForm.endDate,
      specificDate: taskForm.specificDate,
      completed: false,
      lastCompletedDate: null, // 新增：记录最后完成日期
      exp: expMap[taskForm.difficulty],
      points: expMap[taskForm.difficulty] / 3, // 积分 = 经验值 / 3
      createdAt: today
    };
    
    setTasks(prev => [...prev, newTask]);
    // 重置表单
    setTaskForm(prev => ({
      ...prev,
      title: '',
    }));
  };

  // 编辑任务
  const startEditing = (task) => {
    setEditingTask(task.id);
    setTaskForm({
      title: task.title,
      category: task.category,
      difficulty: task.difficulty,
      repeat: task.repeat,
      startDate: task.startDate,
      endDate: task.endDate,
      specificDate: task.specificDate || today
    });
    
    // 滚动到表单位置
    document.getElementById('add-task').scrollIntoView({ behavior: 'smooth' });
  };

  // 保存编辑
  const saveEditing = (id) => {
    if (!taskForm.title.trim()) return;
    
    const expMap = { easy: 30, medium: 50, hard: 100 };
    setTasks(tasks.map(task => {
      if (task.id === id) {
        return {
          ...task,
          title: taskForm.title,
          category: taskForm.category,
          difficulty: taskForm.difficulty,
          repeat: taskForm.repeat,
          startDate: taskForm.startDate,
          endDate: taskForm.endDate,
          specificDate: taskForm.specificDate,
          exp: expMap[taskForm.difficulty],
          points: expMap[taskForm.difficulty] / 3
        };
      }
      return task;
    }));
    
    setEditingTask(null);
    setTaskForm(prev => ({
      ...prev,
      title: '',
    }));
  };

  // 取消编辑
  const cancelEditing = () => {
    setEditingTask(null);
    setTaskForm(prev => ({
      ...prev,
      title: '',
    }));
  };

  // 切换任务完成状态
  const toggleTask = (id) => {
    setTasks(tasks.map(task => {
      if (task.id === id && !task.completed) {
        // 完成任务时增加积分
        addPoints(task.points);
        return { 
          ...task, 
          completed: true,
          lastCompletedDate: getToday() // 记录最后完成日期
        };
      } else if (task.id === id && task.completed) {
        // 取消完成时扣除积分
        addPoints(-task.points);
        return { 
          ...task, 
          completed: false,
          lastCompletedDate: null
        };
      }
      return task;
    }));
  };

  // 增加积分
  const addPoints = (amount) => {
    const currentPoints = parseInt(localStorage.getItem('lifeGamePoints') || '0');
    const newPoints = currentPoints + amount;
    localStorage.setItem('lifeGamePoints', newPoints.toString());
  };

  // 删除任务
  const deleteTask = (id) => {
    if (window.confirm('确定要删除这个任务吗？')) {
      setTasks(tasks.filter(task => task.id !== id));
    }
  };

  // 筛选任务
  const filteredTasks = activeCategory === 'all' 
    ? tasks 
    : tasks.filter(task => task.category === activeCategory);

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 flex items-center">
        <i className="fa fa-check-square-o mr-2"></i>所有任务管理
      </h2>

      {/* 任务创建/编辑表单 */}
      <div id="add-task" className="mb-8 p-5 bg-gray-800 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">
          {editingTask ? '编辑任务' : '创建新任务'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-1">任务名称</label>
            <input
              type="text"
              name="title"
              value={taskForm.title}
              onChange={handleFormChange}
              placeholder="输入任务名称..."
              className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-300 mb-1">任务分类</label>
              <select
                name="category"
                value={taskForm.category}
                onChange={handleFormChange}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TASK_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-300 mb-1">难度 (经验值/积分)</label>
              <select
                name="difficulty"
                value={taskForm.difficulty}
                onChange={handleFormChange}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="easy">简单 (30 XP / 10 积分)</option>
                <option value="medium">中等 (50 XP / 17 积分)</option>
                <option value="hard">困难 (100 XP / 33 积分)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-300 mb-1">重复周期</label>
              <select
                name="repeat"
                value={taskForm.repeat}
                onChange={handleFormChange}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">每日</option>
                <option value="weekly">每周</option>
                <option value="monthly">每月</option>
                <option value="once">仅一次</option>
                <option value="range">日期范围</option>
              </select>
            </div>
          </div>
          
          {/* 日期设置区域 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {taskForm.repeat !== 'once' && (
              <>
                <div>
                  <label className="block text-gray-300 mb-1">开始日期</label>
                  <input
                    type="date"
                    name="startDate"
                    value={taskForm.startDate}
                    onChange={handleFormChange}
                    className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {(taskForm.repeat === 'range' || taskForm.repeat === 'daily' || 
                  taskForm.repeat === 'weekly' || taskForm.repeat === 'monthly') && (
                  <div>
                    <label className="block text-gray-300 mb-1">结束日期</label>
                    <input
                      type="date"
                      name="endDate"
                      value={taskForm.endDate}
                      onChange={handleFormChange}
                      className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </>
            )}
            
            {taskForm.repeat === 'once' && (
              <div>
                <label className="block text-gray-300 mb-1">执行日期</label>
                <input
                  type="date"
                  name="specificDate"
                  value={taskForm.specificDate}
                  onChange={handleFormChange}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            {editingTask ? (
              <>
                <button
                  onClick={() => saveEditing(editingTask)}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 rounded transition-colors font-medium"
                >
                  <i className="fa fa-save mr-1"></i>保存修改
                </button>
                <button
                  onClick={cancelEditing}
                  className="py-3 px-6 bg-gray-600 hover:bg-gray-700 rounded transition-colors font-medium"
                >
                  取消
                </button>
              </>
            ) : (
              <button
                onClick={addTask}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors font-medium"
              >
                <i className="fa fa-plus mr-1"></i>添加任务
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 任务列表筛选器 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 rounded text-sm ${
              activeCategory === 'all' 
                ? 'bg-blue-600' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            全部任务 <span className="ml-1 bg-gray-600 px-1.5 rounded text-xs">{tasks.length}</span>
          </button>
          {TASK_CATEGORIES.map(cat => {
            const count = tasks.filter(task => task.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
                  activeCategory === cat.id 
                    ? `bg-${cat.color}-600` 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <i className={`fa fa-${cat.icon}`}></i>
                {cat.name} <span className="ml-1 bg-gray-600 px-1.5 rounded text-xs">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 所有任务列表 */}
      <div>
        {filteredTasks.length === 0 ? (
          <div className="p-8 bg-gray-800 rounded-lg text-center text-gray-400">
            <i className="fa fa-tasks text-4xl mb-3"></i>
            <p>没有{activeCategory !== 'all' ? TASK_CATEGORIES.find(c => c.id === activeCategory)?.name : ''}任务</p>
            <button 
              onClick={() => {
                setActiveCategory('all');
                document.getElementById('add-task').scrollIntoView({ behavior: 'smooth' });
              }}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
            >
              <i className="fa fa-plus mr-1"></i>创建新任务
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map(task => {
              const category = TASK_CATEGORIES.find(c => c.id === task.category);
              // 计算任务状态文本
              let statusText = '';
              if (task.repeat === 'daily') statusText = '每日任务';
              if (task.repeat === 'weekly') statusText = '每周任务';
              if (task.repeat === 'monthly') statusText = '每月任务';
              if (task.repeat === 'once') statusText = `仅在 ${task.specificDate} 执行`;
              if (task.repeat === 'range') statusText = `从 ${task.startDate} 到 ${task.endDate}`;
              
              return (
                <div 
                  key={task.id}
                  className={`p-4 rounded-lg flex flex-col md:flex-row md:items-center gap-3 ${
                    task.completed 
                      ? 'bg-gray-700 line-through text-gray-400' 
                      : 'bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        task.completed ? 'bg-green-500' : 'border-2 border-gray-400'
                      }`}
                    >
                      {task.completed && <i className="fa fa-check text-white text-xs"></i>}
                    </button>
                    <div className="flex items-center gap-2">
                      <i className={`fa fa-${category?.icon} text-${category?.color}-400`}></i>
                      <span className="font-medium">{task.title}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                    <span>{statusText}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      task.difficulty === 'easy' ? 'bg-green-900/50 text-green-300' :
                      task.difficulty === 'medium' ? 'bg-yellow-900/50 text-yellow-300' :
                      'bg-red-900/50 text-red-300'
                    }`}>
                      {task.difficulty === 'easy' ? '简单' :
                       task.difficulty === 'medium' ? '中等' : '困难'}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-700 rounded-full text-xs flex items-center gap-1">
                      <i className="fa fa-diamond text-blue-400"></i> {task.exp} XP
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 self-end md:self-auto">
                    <button 
                      onClick={() => startEditing(task)}
                      className="text-gray-400 hover:text-blue-400"
                    >
                      <i className="fa fa-edit"></i>
                    </button>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <i className="fa fa-trash"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const Achievements = () => {
  // 从localStorage获取任务数据用于计算成就
  const [tasks] = useState(() => {
    const saved = localStorage.getItem('lifeGameTasks');
    return saved ? JSON.parse(saved) : [];
  });
  
  // 计算分类任务完成数
  const getCategoryCompletedCount = (categoryId) => {
    return tasks.filter(task => task.completed && task.category === categoryId).length;
  };
  
  // 计算总完成任务数
  const totalCompleted = tasks.filter(task => task.completed).length;
  const totalCreated = tasks.length;
  
  // 成就数据 - 包含各分类成就
  const achievements = [
    // 通用成就
    { 
      id: 1, 
      title: "第一步", 
      description: "创建第一个任务", 
      unlocked: totalCreated > 0, 
      icon: "flag",
      points: 50
    },
    { 
      id: 2, 
      title: "行动派", 
      description: "完成第一个任务", 
      unlocked: totalCompleted > 0, 
      icon: "check-circle",
      points: 50
    },
    { 
      id: 3, 
      title: "坚持不懈", 
      description: "完成10个任务", 
      unlocked: totalCompleted >= 10, 
      icon: "calendar-check-o",
      points: 100
    },
    { 
      id: 4, 
      title: "任务达人", 
      description: "创建50个任务", 
      unlocked: totalCreated >= 50, 
      icon: "list-alt",
      points: 200
    },
    
    // 技能分类成就
    { 
      id: 101, 
      category: "skill",
      title: "技能新手", 
      description: "完成5个技能类任务", 
      unlocked: getCategoryCompletedCount('skill') >= 5, 
      icon: "graduation-cap",
      points: 80
    },
    { 
      id: 102, 
      category: "skill",
      title: "技能大师", 
      description: "完成30个技能类任务", 
      unlocked: getCategoryCompletedCount('skill') >= 30, 
      icon: "mortar-board",
      points: 200
    },
    
    // 健身分类成就
    { 
      id: 201, 
      category: "fitness",
      title: "健身入门", 
      description: "完成5个健身类任务", 
      unlocked: getCategoryCompletedCount('fitness') >= 5, 
      icon: "heartbeat",
      points: 80
    },
    { 
      id: 202, 
      category: "fitness",
      title: "运动健将", 
      description: "完成30个健身类任务", 
      unlocked: getCategoryCompletedCount('fitness') >= 30, 
      icon: "futbol-o",
      points: 200
    },
    
    // 好习惯分类成就
    { 
      id: 301, 
      category: "habit",
      title: "习惯养成", 
      description: "完成5个好习惯类任务", 
      unlocked: getCategoryCompletedCount('habit') >= 5, 
      icon: "leaf",
      points: 80
    },
    { 
      id: 302, 
      category: "habit",
      title: "自律达人", 
      description: "完成30个好习惯类任务", 
      unlocked: getCategoryCompletedCount('habit') >= 30, 
      icon: "sun-o",
      points: 200
    },
    
    // 成长分类成就
    { 
      id: 401, 
      category: "growth",
      title: "成长起步", 
      description: "完成5个成长类任务", 
      unlocked: getCategoryCompletedCount('growth') >= 5, 
      icon: "line-chart",
      points: 80
    },
    { 
      id: 402, 
      category: "growth",
      title: "持续成长", 
      description: "完成30个成长类任务", 
      unlocked: getCategoryCompletedCount('growth') >= 30, 
      icon: "area-chart",
      points: 200
    }
  ];
  
  // 计算已解锁成就
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const [activeFilter, setActiveFilter] = useState('all');
  
  // 过滤显示的成就
  const filteredAchievements = activeFilter === 'all'
    ? achievements
    : activeFilter === 'unlocked'
      ? achievements.filter(a => a.unlocked)
      : achievements.filter(a => a.category === activeFilter);

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 flex items-center">
        <i className="fa fa-trophy mr-2"></i>成就系统
        <span className="ml-3 text-lg text-gray-400">
          已解锁 {unlockedAchievements.length}/{achievements.length}
        </span>
      </h2>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1 rounded text-sm ${
            activeFilter === 'all' 
              ? 'bg-blue-600' 
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          全部成就
        </button>
        <button
          onClick={() => setActiveFilter('unlocked')}
          className={`px-3 py-1 rounded text-sm ${
            activeFilter === 'unlocked' 
              ? 'bg-green-600' 
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          已解锁
        </button>
        {TASK_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveFilter(cat.id)}
            className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
              activeFilter === cat.id 
                ? `bg-${cat.color}-600` 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <i className={`fa fa-${cat.icon}`}></i>
            {cat.name}类
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map(achievement => (
          <div 
            key={achievement.id}
            className={`p-6 rounded-lg border ${
              achievement.unlocked 
                ? 'border-yellow-500 bg-yellow-950/30 transform hover:scale-105 transition-transform' 
                : 'border-gray-700 bg-gray-800/50 opacity-70'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`text-3xl p-2 rounded-full ${
                achievement.unlocked ? 'text-yellow-400 bg-yellow-900/50' : 'text-gray-500 bg-gray-700'
              }`}>
                <i className={`fa fa-${achievement.icon}`}></i>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold mb-1">{achievement.title}</h3>
                  {achievement.unlocked && (
                    <span className="px-2 py-1 bg-yellow-900 text-yellow-300 text-xs rounded flex items-center gap-1">
                      <i className="fa fa-ticket"></i> +{achievement.points}
                    </span>
                  )}
                </div>
                <p className="text-gray-400 mb-3">{achievement.description}</p>
                <span className={`text-sm px-3 py-1 rounded-full ${
                  achievement.unlocked 
                    ? 'bg-green-900 text-green-300' 
                    : 'bg-gray-700 text-gray-300'
                }`}>
                  {achievement.unlocked ? '已解锁' : '未解锁'}
                </span>
                {achievement.category && (
                  <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <i className={`fa fa-${TASK_CATEGORIES.find(c => c.id === achievement.category)?.icon}`}></i>
                    {TASK_CATEGORIES.find(c => c.id === achievement.category)?.name}类成就
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Stats = () => {
  // 从localStorage获取任务数据
  const [tasks] = useState(() => {
    const saved = localStorage.getItem('lifeGameTasks');
    return saved ? JSON.parse(saved) : [];
  });

  // 计算统计数据
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalExp = tasks
    .filter(task => task.completed)
    .reduce((sum, task) => sum + task.exp, 0);
  
  // 计算等级 (每1000经验升一级)
  const level = Math.floor(totalExp / 1000) + 1;
  const expToNextLevel = 1000 - (totalExp % 1000);

  // 计算分类统计
  const categoryStats = TASK_CATEGORIES.map(cat => {
    const catTasks = tasks.filter(task => task.category === cat.id);
    const completed = catTasks.filter(task => task.completed).length;
    return {
      ...cat,
      total: catTasks.length,
      completed,
      rate: catTasks.length > 0 ? Math.round((completed / catTasks.length) * 100) : 0
    };
  });

  // 最近7天的任务完成情况
  const getLast7DaysData = () => {
    const days = [];
    const data = [];
    
    // 获取最近7天的日期
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const formatted = formatDate(date);
      const dayName = new Intl.DateTimeFormat('zh-CN', { weekday: 'short' }).format(date);
      
      days.push(dayName);
      
      // 计算当天完成的任务数
      const count = tasks.filter(task => 
        task.completed && 
        (formatDate(new Date(task.createdAt)) === formatted ||
         (task.repeat && task.startDate <= formatted && task.endDate >= formatted))
      ).length;
      
      data.push(count);
    }
    
    return { days, data };
  };

  const { days, data } = getLast7DaysData();
  
  const chartData = {
    labels: days,
    datasets: [
      {
        label: '每日完成任务数',
        data: data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true,
      }
    ],
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 flex items-center">
        <i className="fa fa-line-chart mr-2"></i>数据统计
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-gray-800 rounded-lg text-center">
          <div className="text-4xl mb-2 text-blue-400">
            <i className="fa fa-tasks"></i>
          </div>
          <h3 className="text-xl text-gray-300 mb-1">总任务数</h3>
          <p className="text-3xl font-bold">{totalTasks}</p>
        </div>
        
        <div className="p-6 bg-gray-800 rounded-lg text-center">
          <div className="text-4xl mb-2 text-green-400">
            <i className="fa fa-check-circle"></i>
          </div>
          <h3 className="text-xl text-gray-300 mb-1">已完成</h3>
          <p className="text-3xl font-bold">{completedTasks} ({completionRate}%)</p>
        </div>
        
        <div className="p-6 bg-gray-800 rounded-lg text-center">
          <div className="text-4xl mb-2 text-purple-400">
            <i className="fa fa-diamond"></i>
          </div>
          <h3 className="text-xl text-gray-300 mb-1">总经验值</h3>
          <p className="text-3xl font-bold">{totalExp}</p>
        </div>
        
        <div className="p-6 bg-gray-800 rounded-lg text-center">
          <div className="text-4xl mb-2 text-yellow-400">
            <i className="fa fa-star"></i>
          </div>
          <h3 className="text-xl text-gray-300 mb-1">等级</h3>
          <p className="text-3xl font-bold">{level} (还需 {expToNextLevel} XP 升级)</p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">分类任务完成情况</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryStats.map(cat => (
            <div key={cat.id} className="p-4 bg-gray-800 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium flex items-center gap-2">
                  <i className={`fa fa-${cat.icon} text-${cat.color}-400`}></i>
                  {cat.name}
                </h4>
                <span>{cat.completed}/{cat.total}</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full">
                <div 
                  className="h-full rounded-full"
                  style={{ 
                    width: `${cat.rate}%`,
                    backgroundColor: cat.rate > 70 ? 'rgb(16, 185, 129)' : 
                                   cat.rate > 30 ? 'rgb(234, 179, 8)' : 'rgb(239, 68, 68)'
                  }}
                ></div>
              </div>
              <div className="mt-2 text-right text-sm text-gray-400">{cat.rate}% 完成率</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">最近7天完成情况</h3>
        <div className="h-80">
          <Line data={chartData} options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { 
                beginAtZero: true, 
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { precision: 0 }
              },
              x: { grid: { color: 'rgba(255, 255, 255, 0.1)' } }
            },
            plugins: {
              legend: { labels: { color: 'white' } }
            }
          }} />
        </div>
      </div>
    </div>
  );
};

// 抽奖系统
const Lottery = () => {
  const [points, setPoints] = useState(() => {
    return parseInt(localStorage.getItem('lifeGamePoints') || '0');
  });
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('lifeGameLotteryHistory');
    return saved ? JSON.parse(saved) : [];
  });

  // 保存历史记录
  useEffect(() => {
    localStorage.setItem('lifeGameLotteryHistory', JSON.stringify(history));
  }, [history]);

  // 抽奖奖品配置
  const prizes = [
    { id: 1, name: "50积分", value: 50, probability: 30, icon: "ticket", color: "yellow" },
    { id: 2, name: "100积分", value: 100, probability: 20, icon: "ticket", color: "green" },
    { id: 3, name: "200积分", value: 200, probability: 10, icon: "ticket", color: "blue" },
    { id: 4, name: "谢谢参与", value: 0, probability: 35, icon: "meh-o", color: "gray" },
    { id: 5, name: "心愿兑换券", value: 1, type: "wish", probability: 5, icon: "gift", color: "purple" }
  ];

  // 开始抽奖
  const startLottery = () => {
    // 检查积分是否足够
    if (points < 20) {
      alert("积分不足！每次抽奖需要20积分");
      return;
    }
    
    // 扣除积分
    const newPoints = points - 20;
    setPoints(newPoints);
    localStorage.setItem('lifeGamePoints', newPoints.toString());
    
    // 开始旋转动画
    setIsSpinning(true);
    setResult(null);
    
    // 3秒后显示结果
    setTimeout(() => {
      // 随机抽奖算法
      const random = Math.random() * 100;
      let cumulativeProbability = 0;
      let winningPrize = null;
      
      for (const prize of prizes) {
        cumulativeProbability += prize.probability;
        if (random <= cumulativeProbability) {
          winningPrize = prize;
          break;
        }
      }
      
      // 处理中奖结果
      if (winningPrize) {
        setResult(winningPrize);
        
        // 记录历史
        setHistory(prev => [
          {
            id: Date.now(),
            prize: winningPrize,
            date: new Date().toLocaleString()
          },
          ...prev.slice(0, 9) // 只保留最近10条记录
        ]);
        
        // 如果中奖的是积分，增加积分
        if (winningPrize.type !== "wish" && winningPrize.value > 0) {
          const updatedPoints = newPoints + winningPrize.value;
          setPoints(updatedPoints);
          localStorage.setItem('lifeGamePoints', updatedPoints.toString());
        }
      }
      
      setIsSpinning(false);
    }, 3000);
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 flex items-center">
        <i className="fa fa-gift mr-2"></i>幸运抽奖
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-yellow-900 text-yellow-300 rounded-full text-lg">
                当前积分: <span className="font-bold">{points}</span>
              </span>
              <p className="text-gray-400 mt-2">每次抽奖消耗20积分</p>
            </div>
            
            {/* 抽奖转盘 */}
            <div className="relative w-64 h-64 mx-auto mb-6">
              <div className={`absolute inset-0 rounded-full border-8 border-gray-700 flex items-center justify-center ${isSpinning ? 'animate-spin' : ''}`} style={{ animationDuration: '0.5s' }}>
                {!isSpinning && !result && (
                  <div className="text-center">
                    <i className="fa fa-gift text-5xl text-blue-400 mb-2"></i>
                    <p>点击开始抽奖</p>
                  </div>
                )}
                
                {isSpinning && (
                  <div className="text-center">
                    <i className="fa fa-refresh text-5xl text-blue-400 mb-2 fa-spin"></i>
                    <p>抽奖中...</p>
                  </div>
                )}
                
                {!isSpinning && result && (
                  <div className="text-center p-4">
                    <i className={`fa fa-${result.icon} text-5xl text-${result.color}-400 mb-2`}></i>
                    <h3 className="text-xl font-bold">{result.name}</h3>
                    {result.type === "wish" && (
                      <p className="text-green-400 text-sm mt-2">可用于兑换一个心愿！</p>
                    )}
                  </div>
                )}
              </div>
              
              {/* 转盘指针 */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-12 bg-red-500 clip-triangle"></div>
            </div>
            
            <button
              onClick={startLottery}
              disabled={isSpinning || points < 20}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                isSpinning || points < 20
                  ? 'bg-gray-700 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSpinning ? '抽奖中...' : '开始抽奖 (20积分)'}
            </button>
          </div>
          
          {/* 奖品说明 */}
          <div className="mt-6 bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">奖品说明</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {prizes.map(prize => (
                <div key={prize.id} className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                  <i className={`fa fa-${prize.icon} text-${prize.color}-400 text-xl`}></i>
                  <div>
                    <div className="font-medium">{prize.name}</div>
                    <div className="text-xs text-gray-400">概率: {prize.probability}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* 抽奖历史 */}
        <div>
          <div className="bg-gray-800 rounded-lg p-6 h-full">
            <h3 className="text-xl font-semibold mb-4">抽奖历史</h3>
            
            {history.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <i className="fa fa-history text-4xl mb-2"></i>
                <p>暂无抽奖记录</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                {history.map(item => (
                  <div key={item.id} className="p-3 bg-gray-700 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <i className={`fa fa-${item.prize.icon} text-${item.prize.color}-400`}></i>
                        <span>{item.prize.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 心愿清单
const Wishes = () => {
  const [wishes, setWishes] = useState(() => {
    const saved = localStorage.getItem('lifeGameWishes');
    return saved ? JSON.parse(saved) : [];
  });
  const [newWish, setNewWish] = useState('');
  const [wishPoints, setWishPoints] = useState(0);
  const [wishTickets, setWishTickets] = useState(0);

  // 加载积分和心愿券数量
  useEffect(() => {
    const points = parseInt(localStorage.getItem('lifeGamePoints') || '0');
    setWishPoints(points);
    
    // 计算心愿券数量（从抽奖历史中统计）
    const lotteryHistory = JSON.parse(localStorage.getItem('lifeGameLotteryHistory') || '[]');
    const availableTickets = lotteryHistory.filter(item => item.prize.type === 'wish' && item.used !== true).length;
    setWishTickets(availableTickets);
  }, []);

  // 保存心愿到localStorage
  useEffect(() => {
    localStorage.setItem('lifeGameWishes', JSON.stringify(wishes));
  }, [wishes]);

  // 添加新心愿
  const addWish = () => {
    if (!newWish.trim()) return;
    
    setWishes(prev => [
      ...prev,
      {
        id: Date.now(),
        title: newWish,
        status: 'pending', // pending, in_progress, completed
        points: 0,
        createdAt: new Date().toLocaleString()
      }
    ]);
    
    setNewWish('');
  };

  // 兑换心愿（使用心愿券）
  const redeemWish = (id) => {
    if (wishTickets < 1) {
      alert("没有足够的心愿兑换券！可以通过抽奖获得。");
      return;
    }
    
    // 更新心愿状态
    setWishes(prev => prev.map(wish => 
      wish.id === id ? { ...wish, status: 'completed' } : wish
    ));
    
    // 减少心愿券数量（更新抽奖历史）
    const lotteryHistory = JSON.parse(localStorage.getItem('lifeGameLotteryHistory') || '[]');
    // 找到第一个未使用的心愿券并标记为已使用
    const firstTicketIndex = lotteryHistory.findIndex(item => item.prize.type === 'wish' && item.used !== true);
    if (firstTicketIndex !== -1) {
      lotteryHistory[firstTicketIndex].used = true;
      localStorage.setItem('lifeGameLotteryHistory', JSON.stringify(lotteryHistory));
      setWishTickets(wishTickets - 1);
    }
  };

  // 删除心愿
  const deleteWish = (id) => {
    setWishes(prev => prev.filter(wish => wish.id !== id));
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 flex items-center">
        <i className="fa fa-list-alt mr-2"></i>心愿清单
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* 新增心愿表单 */}
          <div className="mb-6 p-5 bg-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">添加新心愿</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={newWish}
                onChange={(e) => setNewWish(e.target.value)}
                placeholder="输入你的心愿..."
                className="flex-1 p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addWish}
                className="p-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              >
                <i className="fa fa-plus mr-1"></i>添加
              </button>
            </div>
          </div>
          
          {/* 心愿列表 */}
          <div>
            <h3 className="text-xl font-semibold mb-4">我的心愿</h3>
            
            {wishes.length === 0 ? (
              <div className="p-8 bg-gray-800 rounded-lg text-center text-gray-400">
                <i className="fa fa-star-o text-4xl mb-3"></i>
                <p>还没有心愿，添加一个吧！</p>
              </div>
            ) : (
              <div className="space-y-3">
                {wishes.map(wish => (
                  <div 
                    key={wish.id}
                    className={`p-4 rounded-lg ${
                      wish.status === 'completed' 
                        ? 'bg-green-900/30' 
                        : wish.status === 'in_progress'
                          ? 'bg-yellow-900/30'
                          : 'bg-gray-800'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className={`font-medium ${wish.status === 'completed' ? 'line-through' : ''}`}>
                          {wish.title}
                        </h4>
                        <div className="text-xs text-gray-400 mt-1">
                          添加于 {wish.createdAt}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {wish.status === 'completed' ? (
                          <span className="px-2 py-1 bg-green-900 text-green-300 rounded text-sm">
                            已实现
                          </span>
                        ) : (
                          <button
                            onClick={() => redeemWish(wish.id)}
                            className="px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm"
                          >
                            <i className="fa fa-gift mr-1"></i>兑换
                          </button>
                        )}
                        
                        <button 
                          onClick={() => deleteWish(wish.id)}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* 兑换资源 */}
        <div>
          <div className="bg-gray-800 rounded-lg p-6 h-full">
            <h3 className="text-xl font-semibold mb-6">兑换资源</h3>
            
            <div className="space-y-6">
              <div className="text-center p-4 bg-yellow-900/30 rounded-lg">
                <i className="fa fa-ticket text-4xl text-yellow-400 mb-2"></i>
                <h4 className="text-lg font-medium mb-1">心愿兑换券</h4>
                <p className="text-3xl font-bold">{wishTickets}</p>
                <p className="text-xs text-gray-400 mt-2">可用于直接兑换心愿</p>
              </div>
              
              <div className="text-center p-4 bg-blue-900/30 rounded-lg">
                <i className="fa fa-diamond text-4xl text-blue-400 mb-2"></i>
                <h4 className="text-lg font-medium mb-1">可用积分</h4>
                <p className="text-3xl font-bold">{wishPoints}</p>
                <p className="text-xs text-gray-400 mt-2">可用于参与抽奖</p>
              </div>
              
              <div className="p-4 bg-gray-700 rounded-lg">
                <h4 className="font-medium mb-2">如何获得心愿兑换券？</h4>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <i className="fa fa-gift text-purple-400 mt-1"></i>
                    <span>参与幸运抽奖有5%概率获得</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fa fa-trophy text-yellow-400 mt-1"></i>
                    <span>完成特定成就可获得额外奖励</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 通用组件
const ModuleCard = ({ title, icon, description, onClick }) => (
  <div 
    className="bg-gray-800 rounded-lg p-6 hover:shadow-lg hover:shadow-blue-900/20 transition-all cursor-pointer transform hover:-translate-y-1"
    onClick={onClick}
  >
    <div className="text-4xl mb-4 text-blue-400">
      <i className={`fa fa-${icon}`}></i>
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
    <div className="mt-4 text-blue-400 flex items-center">
      <span>查看详情</span>
      <i className="fa fa-arrow-right ml-2"></i>
    </div>
  </div>
);

const Navbar = () => {
  // 获取当前积分显示在导航栏
  const [points, setPoints] = useState(0);
  
  useEffect(() => {
    const savedPoints = localStorage.getItem('lifeGamePoints') || '0';
    setPoints(parseInt(savedPoints));
    
    // 监听storage事件，同步其他页面的积分变化
    const handleStorageChange = () => {
      const newPoints = localStorage.getItem('lifeGamePoints') || '0';
      setPoints(parseInt(newPoints));
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <i className="fa fa-gamepad text-blue-400"></i>
              <span>人生游戏</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-1">
            <div className="mr-4 px-3 py-1 bg-yellow-900/50 rounded-full text-sm flex items-center gap-1">
              <i className="fa fa-ticket text-yellow-400"></i>
              <span>{points}</span>
            </div>
            
            <div className="flex items-center gap-6">
              <NavLink to="/">首页</NavLink>
              <NavLink to="/tasks">任务</NavLink>
              <NavLink to="/achievements">成就</NavLink>
              <NavLink to="/stats">数据</NavLink>
              <NavLink to="/lottery">抽奖</NavLink>
              <NavLink to="/wishes">心愿</NavLink>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, children }) => (
  <Link 
    to={to}
    className={({ isActive }) => 
      `flex items-center gap-1 ${
        isActive 
          ? 'text-blue-400 border-b-2 border-blue-400' 
          : 'text-gray-300 hover:text-white'
      }`
    }
  >
    {children}
  </Link>
);

const ParticleBackground = () => {
  const particlesInit = useCallback(async (main) => {
    await loadFull(main);
  }, []);

  return (
    <Particles
      className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20"
      init={particlesInit}
      options={{
        particles: {
          number: { value: 80, density: { enable: true, value_area: 800 } },
          color: { value: "#4f46e5" },
          shape: { type: "circle" },
          size: { value: 3 },
          line_linked: {
            enable: true,
            distance: 150,
            color: "#4f46e5",
            opacity: 0.2,
            width: 1
          },
          move: {
            enable: true,
            speed: 1,
            direction: "none",
            random: false,
            straight: false,
            out_mode: "out",
            bounce: false
          }
        }
      }}
    />
  );
};

// 主应用组件
function App() {
  return (
    <Router>
      <ParticleBackground />
      <div className="relative min-h-screen bg-gray-900 text-white">
        <Navbar />
        <main className="pt-6 pb-12">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/lottery" element={<Lottery />} />
            <Route path="/wishes" element={<Wishes />} />
          </Routes>
        </main>
        <footer className="absolute bottom-0 w-full py-4 bg-gray-800 text-center text-gray-400 text-sm">
          游戏化人生管理工具 © {new Date().getFullYear()}
        </footer>
      </div>
    </Router>
  );
}

export default App;
