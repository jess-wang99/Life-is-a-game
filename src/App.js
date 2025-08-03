import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // 若需路由可保留，纯静态则删除

// 模拟任务数据（可扩展为 localStorage 或 API）
const mockTodayTasks = [
  { id: 1, title: "完成文档撰写", time: "09:00-11:00", completed: false },
  { id: 2, title: "健身锻炼", time: "15:00-16:00", completed: true },
  { id: 3, title: "学习 React 新特性", time: "19:30-21:00", completed: false },
];

function App() {
  // 状态：等级、经验、当天任务
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [todayTasks, setTodayTasks] = useState(mockTodayTasks);

  // 模拟经验升级逻辑（可扩展为任务关联）
  useEffect(() => {
    // 每 100 XP 升一级
    const nextLevel = Math.floor(xp / 100) + 1;
    if (nextLevel > level) {
      setLevel(nextLevel);
    }
  }, [xp, level]);

  // 完成任务逻辑
  const handleCompleteTask = (taskId) => {
    setTodayTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task
      )
    );
    // 完成任务增加经验
    setXp((prev) => prev + 20);
  };

  return (
    <div>
      {/* 导航栏 */}
      <nav className="navbar">
        <div className="logo">
          <span>人生游戏</span>
        </div>
        <div className="nav-links">
          <Link to="/">首页</Link>
          <Link to="/tasks">任务</Link>
          <Link to="/achievements">成就</Link>
          <Link to="/stats">数据</Link>
          <Link to="/lottery">抽奖</Link>
          <Link to="/wishes">心愿</Link>
        </div>
        <div className="points">0</div>
      </nav>

      {/* 主容器 */}
      <div className="container">
        {/* 标题 + 等级进度 */}
        <div className="page-title">
          游戏化人生管理工具
          <p style={{ fontSize: "1rem", color: "#99aabf", margin: "0.5rem 0 0 1rem" }}>
            创建任务，积累经验，解锁成就，兑换奖励！
          </p>
        </div>
        <div className="card" style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span>等级 {level}</span>
            <div className="level-bar">
              <div
                className="progress"
                style={{ width: `${(xp % 100) / 100 * 100}%` }}
              ></div>
            </div>
            <span>{xp % 100} XP / 100 XP</span>
          </div>
        </div>

        {/* 当天任务模块 */}
        <div className="today-tasks">
          <h2>当天任务</h2>
          {todayTasks.map((task) => (
            <div key={task.id} className="task-item">
              <div className="task-info">
                <div className="task-title">
                  {task.completed ? (
                    <s>{task.title}</s>
                  ) : (
                    task.title
                  )}
                </div>
                <div className="task-time">{task.time}</div>
              </div>
              <div
                className="complete-btn"
                onClick={() => handleCompleteTask(task.id)}
                style={{
                  backgroundColor: task.completed ? "#4a98e8" : "#67b2ff",
                }}
              >
                {task.completed ? "已完成" : "标记完成"}
              </div>
            </div>
          ))}
        </div>

        {/* 功能卡片 */}
        <div className="card-grid">
          <div className="card">
            <h3>任务管理</h3>
            <p>创建分类任务，按周期自动提醒</p>
            <Link to="/tasks" className="btn">查看详情</Link>
          </div>
          <div className="card">
            <h3>成就系统</h3>
            <p>完成分类目标，解锁专属成就</p>
            <Link to="/achievements" className="btn">查看详情</Link>
          </div>
          <div className="card">
            <h3>数据统计</h3>
            <p>分析完成情况，优化时间管理</p>
            <Link to="/stats" className="btn">查看详情</Link>
          </div>
          <div className="card">
            <h3>幸运抽奖</h3>
            <p>消耗积分参与抽奖，赢取奖励</p>
            <Link to="/lottery" className="btn">查看详情</Link>
          </div>
          <div className="card">
            <h3>心愿清单</h3>
            <p>记录愿望，用成就积分兑换实现</p>
            <Link to="/wishes" className="btn">查看详情</Link>
          </div>
        </div>
      </div>

      {/* 底部版权 */}
      <footer className="footer">
        游戏化人生管理工具 © 2025
      </footer>
    </div>
  );
}

export default App;
