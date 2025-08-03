import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

// 注册Chart.js组件
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// 页面组件
const Home = () => (
  <div className="container mx-auto p-6">
    <div className="text-center mb-10">
      <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
        游戏化人生管理工具
      </h1>
      <p className="text-xl text-gray-300">将你的生活变成一场精彩的游戏，完成任务，获取成就，升级人生！</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card title="每日任务" icon="check-square-o" description="完成日常目标，积累经验值" />
      <Card title="成就系统" icon="trophy" description="解锁特殊成就，展示你的荣耀" />
      <Card title="数据统计" icon="line-chart" description="追踪你的进步，优化生活策略" />
    </div>
  </div>
);

const Tasks = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: "完成晨跑", difficulty: "medium", completed: false, exp: 50 },
    { id: 2, title: "阅读30分钟", difficulty: "easy", completed: false, exp: 30 },
    { id: 3, title: "学习新技能", difficulty: "hard", completed: false, exp: 100 },
  ]);
  const [newTask, setNewTask] = useState("");
  const [difficulty, setDifficulty] = useState("medium");

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const expMap = { easy: 30, medium: 50, hard: 100 };
    setTasks([...tasks, {
      id: Date.now(),
      title: newTask,
      difficulty,
      completed: false,
      exp: expMap[difficulty]
    }]);
    setNewTask("");
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 flex items-center">
        <i className="fa fa-check-square-o mr-2"></i>任务管理
      </h2>

      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="添加新任务..."
            className="flex-1 p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="easy">简单 (30 XP)</option>
            <option value="medium">中等 (50 XP)</option>
            <option value="hard">困难 (100 XP)</option>
          </select>
          <button
            onClick={addTask}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            <i className="fa fa-plus mr-1"></i>添加
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map(task => (
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
            <div className="flex items-center gap-3">
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
            <span className="px-2 py-1 bg-gray-700 rounded text-sm">
              +{task.exp} XP
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Achievements = () => {
  const achievements = [
    { id: 1, title: "任务新手", description: "完成第一个任务", unlocked: true, icon: "star" },
    { id: 2, title: "坚持不懈", description: "连续完成7天任务", unlocked: false, icon: "calendar-check-o" },
    { id: 3, title: "学习达人", description: "完成10个学习相关任务", unlocked: false, icon: "book" },
    { id: 4, title: "健身爱好者", description: "完成20个运动相关任务", unlocked: false, icon: "heartbeat" },
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
  const chartData = {
    labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    datasets: [
      {
        label: '获得经验',
        data: [120, 190, 80, 250, 180, 300, 220],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true,
      },
      {
        label: '完成任务数',
        data: [3, 5, 2, 6, 4, 7, 5],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const stats = [
    { title: "总经验值", value: "1,540", icon: "diamond" },
    { title: "等级", value: "8", icon: "level-up" },
    { title: "完成任务", value: "32", icon: "check-circle" },
    { title: "解锁成就", value: "5", icon: "trophy" },
  ];

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 flex items-center">
        <i className="fa fa-line-chart mr-2"></i>数据统计
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="p-6 bg-gray-800 rounded-lg text-center">
            <div className="text-4xl mb-2 text-blue-400">
              <i className={`fa fa-${stat.icon}`}></i>
            </div>
            <h3 className="text-xl text-gray-300 mb-1">{stat.title}</h3>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">本周进度</h3>
        <div className="h-80">
          <Line data={chartData} options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
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
  const particlesInit = async (main) => {
    await loadFull(main);
  };

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
