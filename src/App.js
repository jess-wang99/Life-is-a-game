import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
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

// 页面组件
const Home = () => (
  <div className="container mx-auto p-6">
    <div className="text-center mb-10">
      <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
        游戏化人生管理工具
      </h1>
      <p className="text-xl text-gray-300">创建任务，设定周期，追踪你的生活进度！</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card title="任务管理" icon="check-square-o" description="创建带时间属性的任务，按周期自动提醒" />
      <Card title="成就系统" icon="trophy" description="完成任务目标，解锁专属成就" />
      <Card title="数据统计" icon="line-chart" description="分析你的完成情况，优化时间管理" />
    </div>
  </div>
);

const Tasks = () => {
  // 任务状态管理
  const [tasks, setTasks] = useState(() => {
    // 从localStorage加载任务
    const saved = localStorage.getItem('lifeGameTasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [todayTasks, setTodayTasks] = useState([]);
  const today = getToday();

  // 任务表单状态
  const [taskForm, setTaskForm] = useState({
    title: '',
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

  // 筛选今日任务
  useEffect(() => {
    const filtered = tasks.filter(task => {
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
  }, [tasks, today]);

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
      difficulty: taskForm.difficulty,
      repeat: taskForm.repeat,
      startDate: taskForm.startDate,
      endDate: taskForm.endDate,
      specificDate: taskForm.specificDate,
      completed: false,
      exp: expMap[taskForm.difficulty],
      createdAt: today
    };
    
    setTasks(prev => [...prev, newTask]);
    // 重置表单
    setTaskForm({
      title: '',
      difficulty: 'medium',
      repeat: 'daily',
      startDate: today,
      endDate: today,
      specificDate: today
    });
  };

  // 切换任务完成状态
  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // 删除任务
  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 flex items-center">
        <i className="fa fa-check-square-o mr-2"></i>任务管理
      </h2>

      {/* 任务创建表单 */}
      <div className="mb-8 p-5 bg-gray-800 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">创建新任务</h3>
        
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-1">难度 (经验值)</label>
              <select
                name="difficulty"
                value={taskForm.difficulty}
                onChange={handleFormChange}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="easy">简单 (30 XP)</option>
                <option value="medium">中等 (50 XP)</option>
                <option value="hard">困难 (100 XP)</option>
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
          
          <button
            onClick={addTask}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors font-medium"
          >
            <i className="fa fa-plus mr-1"></i>添加任务
          </button>
        </div>
      </div>

      {/* 今日任务列表 */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <i className="fa fa-calendar mr-2"></i>今日任务 ({today})
        </h3>
        
        {todayTasks.length === 0 ? (
          <div className="p-8 bg-gray-800 rounded-lg text-center text-gray-400">
            <i className="fa fa-inbox text-4xl mb-3"></i>
            <p>今天没有任务，去创建新任务吧！</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayTasks.map(task => (
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
                  <span>{task.title}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-gray-700 rounded text-sm">
                    +{task.exp} XP
                  </span>
                  
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
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
  
  // 计算已完成任务数量
  const completedTasks = tasks.filter(task => task.completed).length;
  
  // 成就数据
  const achievements = [
    { 
      id: 1, 
      title: "第一步", 
      description: "创建第一个任务", 
      unlocked: tasks.length > 0, 
      icon: "flag" 
    },
    { 
      id: 2, 
      title: "行动派", 
      description: "完成第一个任务", 
      unlocked: completedTasks > 0, 
      icon: "check-circle" 
    },
    { 
      id: 3, 
      title: "坚持不懈", 
      description: "完成10个任务", 
      unlocked: completedTasks >= 10, 
      icon: "calendar-check-o" 
    },
    { 
      id: 4, 
      title: "任务达人", 
      description: "创建50个任务", 
      unlocked: tasks.length >= 50, 
      icon: "list-alt" 
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 flex items-center">
        <i className="fa fa-trophy mr-2"></i>成就系统
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {achievements.map(achievement => (
          <div 
            key={achievement.id}
            className={`p-6 rounded-lg border ${
              achievement.unlocked 
                ? 'border-yellow-500 bg-yellow-950/30' 
                : 'border-gray-700 bg-gray-800/50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`text-3xl p-2 rounded-full ${
                achievement.unlocked ? 'text-yellow-400 bg-yellow-900/50' : 'text-gray-500 bg-gray-700'
              }`}>
                <i className={`fa fa-${achievement.icon}`}></i>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">{achievement.title}</h3>
                <p className="text-gray-400 mb-3">{achievement.description}</p>
                <span className={`text-sm px-3 py-1 rounded-full ${
                  achievement.unlocked 
                    ? 'bg-green-900 text-green-300' 
                    : 'bg-gray-700 text-gray-300'
                }`}>
                  {achievement.unlocked ? '已解锁' : '未解锁'}
                </span>
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

// 通用组件
const Card = ({ title, icon, description }) => (
  <div className="bg-gray-800 rounded-lg p-6 hover:shadow-lg hover:shadow-blue-900/20 transition-all">
    <div className="text-4xl mb-4 text-blue-400">
      <i className={`fa fa-${icon}`}></i>
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

const Navbar = () => (
  <nav className="bg-gray-800 border-b border-gray-700">
    <div className="container mx-auto px-4">
      <div className="flex justify-between h-16">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <i className="fa fa-gamepad text-blue-400"></i>
            <span>人生游戏</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-6">
          <NavLink to="/">首页</NavLink>
          <NavLink to="/tasks">任务</NavLink>
          <NavLink to="/achievements">成就</NavLink>
          <NavLink to="/stats">数据</NavLink>
        </div>
      </div>
    </div>
  </nav>
);

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
    
