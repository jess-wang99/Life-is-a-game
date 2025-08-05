import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
// ...（其他原有 import 保留）

// 工具函数：格式化日期为 YYYY-MM-DD
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// 工具函数：获取当前日期
const getToday = () => {
  return formatDate(new Date());
};

// 任务分类（原有代码保留）
const TASK_CATEGORIES = [/* ...原有分类数据 ... */];

// 新增：每日任务重置逻辑
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

// 首页组件（Home）调整：新增任务重置逻辑
const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({/* ...原有状态 ... */});
  const [todayTasks, setTodayTasks] = useState([]);
  const today = getToday();

  // 每日重置任务：关键修改！
  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('lifeGameTasks') || '[]');
    // 调用「每日任务重置」函数
    const resetTasks = resetDailyTasks(storedTasks); 
    localStorage.setItem('lifeGameTasks', JSON.stringify(resetTasks));
    
    // 重新计算今日任务（筛选 + 重置后的数据）
    const filtered = resetTasks.filter((task) => {
      // 原有任务筛选逻辑（根据 repeat 类型判断今日任务）
      const taskDate = new Date(task.specificDate || task.startDate);
      const taskFormatted = formatDate(taskDate);
      // ...（原有任务筛选逻辑保留）
    });
    setTodayTasks(filtered);

    // 重新计算 stats（总任务、已完成等）
    const completedTasks = resetTasks.filter(task => task.completed).length;
    const totalExp = resetTasks
      .filter(task => task.completed)
      .reduce((sum, task) => sum + task.exp, 0);
    const level = Math.floor(totalExp / 1000) + 1;
    setStats({ totalTasks: resetTasks.length, completedTasks, totalExp, level });

  }, [today]); // 每天（日期变化时）触发重置

  // 切换任务完成状态：关键修改！重复完成可累加奖励
  const toggleTask = (id) => {
    const tasks = JSON.parse(localStorage.getItem('lifeGameTasks') || '[]');
    let updatedTasks = [];
    let pointsToAdd = 0;

    for (const task of tasks) {
      if (task.id === id) {
        // 标记为「完成」时，无论是否重复完成，都增加积分/经验
        if (!task.completed) {
          pointsToAdd = task.points; // 积分 = points（原有逻辑）
          // 经验 = exp（原有逻辑），这里通过 stats.totalExp 累加
        } else {
          // 取消完成时扣除积分（可选逻辑，根据需求决定是否保留）
          pointsToAdd = -task.points;
        }
        updatedTasks.push({ 
          ...task, 
          completed: !task.completed, 
          lastCompletedDate: !task.completed ? getToday() : null // 记录最后完成日期
        });
      } else {
        updatedTasks.push(task);
      }
    }

    // 更新 localStorage 任务
    localStorage.setItem('lifeGameTasks', JSON.stringify(updatedTasks));
    // 重新筛选今日任务（确保状态同步）
    const filteredToday = updatedTasks.filter((task) => {
      // 原有任务筛选逻辑（根据 repeat 类型判断今日任务）
      const taskDate = new Date(task.specificDate || task.startDate);
      const taskFormatted = formatDate(taskDate);
      // ...（原有任务筛选逻辑保留）
    });
    setTodayTasks(filteredToday);

    // 更新积分（同步到 localStorage 和状态）
    if (pointsToAdd !== 0) {
      const currentPoints = parseInt(localStorage.getItem('lifeGamePoints') || '0');
      localStorage.setItem('lifeGamePoints', (currentPoints + pointsToAdd).toString());
    }
  };

  // 原有渲染逻辑保留...
  return (/* ...原有 JSX 结构 ... */);
};

// 其他组件（Tasks、Achievements 等）保留原有逻辑，如需调整可参考上述模式

// 主 App 组件（保留路由、导航等）
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
