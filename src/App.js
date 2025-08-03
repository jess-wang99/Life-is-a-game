import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';

// 导航链接组件
const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to}
      className={`navbar-link ${isActive ? 'active' : ''}`}
    >
      {children}
    </Link>
  );
};

// 导航栏组件（内联在App.js中）
const Navbar = ({ points, incrementPoints }) => (
  <nav className="navbar">
    <div className="container navbar-container">
      <Link to="/" className="navbar-logo">
        <i className="fa fa-gamepad"></i>
        <span>人生游戏</span>
      </Link>
      
      <div className="navbar-links">
        <NavLink to="/">首页</NavLink>
        <NavLink to="/tasks">任务</NavLink>
        <NavLink to="/achievements">成就</NavLink>
        <NavLink to="/stats">数据</NavLink>
      </div>
      
      <div className="navbar-points">
        <span className="btn btn-secondary">
          <i className="fa fa-trophy"></i> {points} 积分
        </span>
      </div>
    </div>
  </nav>
);

// 首页组件
const Home = () => (
  <div className="page">
    <div className="container">
      <h1 className="page-title">欢迎来到人生游戏</h1>
      <div className="card">
        <h2>通过完成任务提升自己</h2>
        <p>这是一个简单的任务管理应用，帮助你跟踪日常任务并获得成就感。</p>
        <div style={{ marginTop: '20px' }}>
          <Link to="/tasks" className="btn btn-primary">
            查看我的任务
          </Link>
        </div>
      </div>
    </div>
  </div>
);

// 任务页面组件
const Tasks = ({ tasks, toggleTask, deleteTask, addTask }) => {
  const [newTask, setNewTask] = useState({ title: '', category: 'daily' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTask.title.trim()) {
      addTask(newTask);
      setNewTask({ title: '', category: 'daily' });
    }
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">我的任务</h1>
        
        <div className="card">
          <h2>添加新任务</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">任务名称</label>
              <input
                type="text"
                className="form-control"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                placeholder="输入任务名称"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">任务类型</label>
              <select
                className="form-control"
                value={newTask.category}
                onChange={(e) => setNewTask({...newTask, category: e.target.value})}
              >
                <option value="daily">日常任务</option>
                <option value="weekly">周任务</option>
                <option value="monthly">月任务</option>
                <option value="once">一次性任务</option>
              </select>
            </div>
            
            <button type="submit" className="btn btn-primary">添加任务</button>
          </form>
        </div>
        
        <h2 style={{ marginTop: '30px' }}>任务列表</h2>
        {tasks.length === 0 ? (
          <div className="card">
            <p>还没有任务，添加你的第一个任务吧！</p>
          </div>
        ) : (
          <div className="task-list custom-scrollbar">
            {tasks.map(task => (
              <div key={task.id} className="task-item">
                <div className="task-content">
                  <div className="task-title">{task.title}</div>
                  <div className="task-meta">
                    类型: {
                      task.category === 'daily' ? '日常任务' :
                      task.category === 'weekly' ? '周任务' :
                      task.category === 'monthly' ? '月任务' : '一次性任务'
                    }
                  </div>
                </div>
                <div>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => toggleTask(task.id)}
                  >
                    {task.completed ? '未完成' : '完成'}
                  </button>
                  <button 
                    className="btn btn-secondary"
                    style={{ marginLeft: '10px', backgroundColor: '#dc2626' }}
                    onClick={() => deleteTask(task.id)}
                  >
                    删除
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

// 成就页面组件
const Achievements = ({ tasks }) => {
  const completedTasks = tasks.filter(task => task.completed).length;
  
  // 计算成就
  const achievements = [
    {
      id: 1,
      title: '第一步',
      description: '完成第一个任务',
      unlocked: completedTasks >= 1,
      icon: 'fa-flag'
    },
    {
      id: 2,
      title: '坚持不懈',
      description: '完成10个任务',
      unlocked: completedTasks >= 10,
      icon: 'fa-calendar-check-o'
    },
    {
      id: 3,
      title: '任务达人',
      description: '完成50个任务',
      unlocked: completedTasks >= 50,
      icon: 'fa-trophy'
    }
  ];
  
  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">我的成就</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {achievements.map(achievement => (
            <div 
              key={achievement.id} 
              className="card"
              style={{ 
                opacity: achievement.unlocked ? 1 : 0.5,
                borderLeft: achievement.unlocked ? '5px solid #4f46e5' : 'none'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>
                <i className={`fa ${achievement.icon}`} style={{ color: achievement.unlocked ? '#4f46e5' : '#888' }}></i>
              </div>
              <h3>{achievement.title}</h3>
              <p>{achievement.description}</p>
              <div>
                {achievement.unlocked ? (
                  <span className="btn btn-primary" style={{ backgroundColor: '#10b981' }}>已解锁</span>
                ) : (
                  <span className="btn btn-secondary">未解锁</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 数据统计页面组件
const Stats = ({ tasks }) => {
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // 按类型统计
  const tasksByCategory = {
    daily: tasks.filter(t => t.category === 'daily').length,
    weekly: tasks.filter(t => t.category === 'weekly').length,
    monthly: tasks.filter(t => t.category === 'monthly').length,
    once: tasks.filter(t => t.category === 'once').length
  };
  
  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">数据统计</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div className="card">
            <h3>总任务数</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalTasks}</p>
          </div>
          
          <div className="card">
            <h3>已完成任务</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{completedTasks}</p>
          </div>
          
          <div className="card">
            <h3>完成率</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{completionRate}%</p>
            <div style={{ height: '10px', backgroundColor: '#333', borderRadius: '5px', overflow: 'hidden', marginTop: '10px' }}>
              <div 
                style={{ 
                  width: `${completionRate}%`, 
                  height: '100%', 
                  backgroundColor: completionRate > 70 ? '#10b981' : completionRate > 30 ? '#f59e0b' : '#ef4444'
                }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h2>任务类型分布</h2>
          <div style={{ marginTop: '20px' }}>
            {Object.entries(tasksByCategory).map(([category, count]) => (
              <div key={category} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span>
                    {category === 'daily' ? '日常任务' :
                     category === 'weekly' ? '周任务' :
                     category === 'monthly' ? '月任务' : '一次性任务'}
                  </span>
                  <span>{count}</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#333', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: totalTasks > 0 ? `${(count / totalTasks) * 100}%` : '0%', 
                      height: '100%', 
                      backgroundColor: '#4f46e5'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 主应用组件
const App = () => {
  // 状态管理
  const [tasks, setTasks] = useState([]);
  const [points, setPoints] = useState(0);

  // 从本地存储加载任务
  useEffect(() => {
    const savedTasks = localStorage.getItem('lifeGameTasks');
    const savedPoints = localStorage.getItem('lifeGamePoints');
    
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
    
    if (savedPoints) {
      setPoints(parseInt(savedPoints));
    }
  }, []);

  // 保存任务到本地存储
  useEffect(() => {
    localStorage.setItem('lifeGameTasks', JSON.stringify(tasks));
  }, [tasks]);
  
  // 保存积分到本地存储
  useEffect(() => {
    localStorage.setItem('lifeGamePoints', points.toString());
  }, [points]);

  // 切换任务完成状态
  const toggleTask = (taskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        // 完成任务时增加积分
        if (!task.completed) {
          setPoints(prev => prev + 10);
        } else {
          // 取消完成时减少积分
          setPoints(prev => Math.max(0, prev - 10));
        }
        return { ...task, completed: !task.completed };
      }
      return task;
    }));
  };

  // 删除任务
  const deleteTask = (taskId) => {
    const taskToDelete = tasks.find(task => task.id === taskId);
    setTasks(tasks.filter(task => task.id !== taskId));
    
    // 如果删除的是已完成任务，减少积分
    if (taskToDelete && taskToDelete.completed) {
      setPoints(prev => Math.max(0, prev - 10));
    }
  };

  // 添加新任务
  const addTask = (taskData) => {
    const newTask = {
      id: Date.now().toString(),
      ...taskData,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    setTasks([...tasks, newTask]);
  };

  return (
    <div>
      <Navbar points={points} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/tasks" 
          element={<Tasks 
                    tasks={tasks} 
                    toggleTask={toggleTask} 
                    deleteTask={deleteTask} 
                    addTask={addTask} 
                  />} 
        />
        <Route 
          path="/achievements" 
          element={<Achievements tasks={tasks} />} 
        />
        <Route 
          path="/stats" 
          element={<Stats tasks={tasks} />} 
        />
      </Routes>
    </div>
  );
};

export default App;
