import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { loadFull } from 'tsparticles';
import Particles from 'react-tsparticles';

// 注册Chart.js组件
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function App() {
  // 目标和任务状态管理
  const [goal, setGoal] = useState('');
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [points, setPoints] = useState(0);
  const [pointHistory, setPointHistory] = useState([]);
  
  // 粒子动画配置
  const particlesInit = async (main) => {
    await loadFull(main);
  };
  
  const particlesLoaded = (container) => {
    console.log(container);
  };
  
  const particlesConfig = {
    fullScreen: { enable: false },
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: "#00f7ff" },
      shape: { type: "circle" },
      opacity: { value: 0.8 },
      size: { value: { min: 1, max: 3 } },
      move: {
        enable: true,
        speed: 6,
        direction: "none",
        random: false,
        straight: false,
        out_mode: "out",
        bounce: false
      }
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: true, mode: "grab" },
        onclick: { enable: true, mode: "push" },
        resize: true
      }
    },
    retina_detect: true
  };

  // 从localStorage加载数据
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    const savedCompleted = localStorage.getItem('completedTasks');
    const savedRewards = localStorage.getItem('rewards');
    const savedPoints = localStorage.getItem('points');
    const savedPointHistory = localStorage.getItem('pointHistory');
    const savedBingoData = localStorage.getItem('bingoData');
    
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedCompleted) setCompletedTasks(JSON.parse(savedCompleted));
    if (savedRewards) setRewards(JSON.parse(savedRewards));
    if (savedPoints) setPoints(parseInt(savedPoints));
    if (savedPointHistory) setPointHistory(JSON.parse(savedPointHistory));
    
    // 加载或初始化宾果数据
    if (savedBingoData) {
      const bingoData = JSON.parse(savedBingoData);
      // 检查是否为当前月份
      const currentMonth = new Date().toISOString().slice(0, 7);
      if (bingoData.currentMonth === currentMonth) {
        setBingoData(bingoData);
      } else {
        // 新月份，初始化新的宾果数据
        initializeBingoData();
      }
    } else {
      // 首次使用，初始化宾果数据
      initializeBingoData();
    }
  }, []);

  // 保存数据到localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
    localStorage.setItem('points', points.toString());
    localStorage.setItem('pointHistory', JSON.stringify(pointHistory));
    localStorage.setItem('bingoData', JSON.stringify(bingoData));
  }, [tasks, completedTasks, points, pointHistory, bingoData]);

  useEffect(() => {
    localStorage.setItem('rewards', JSON.stringify(rewards));
  }, [rewards]);

  // 模拟AI目标拆解
  const handleGoalSubmit = async () => {
    if (!goal.trim()) return;
    
    // 模拟API调用
    const mockApiResponse = {
      tasks: [
        `学习${goal}基础语法`,
        `掌握${goal}数据结构`,
        `练习${goal}项目实战`,
        `阅读${goal}相关文档`,
        `加入${goal}开发者社区`
      ]
    };
    
    setTasks(mockApiResponse.tasks);
    setCompletedTasks([]);
    setGoal('');
  };

  // 处理任务完成状态
  const handleTaskToggle = (task) => {
    if (completedTasks.includes(task)) {
      // 取消完成
      setCompletedTasks(prev => prev.filter(t => t !== task));
      setPoints(prev => prev - 10);
    } else {
      // 标记为完成
      setCompletedTasks(prev => [...prev, task]);
      setPoints(prev => prev + 10);
      
      // 记录积分历史
      const now = new Date();
      const dateStr = `${now.getMonth() + 1}/${now.getDate()}`;
      setPointHistory(prev => [...prev, { date: dateStr, points: prev.length > 0 ? prev[prev.length - 1].points + 10 : 10 }]);
    }
  };

  // 添加奖励
  const [newReward, setNewReward] = useState('');
  const [rewardWeight, setRewardWeight] = useState('common');
  
  const handleAddReward = () => {
    if (!newReward.trim()) return;
    
    const weight = rewardWeight === 'common' ? 70 : 30;
    setRewards(prev => [...prev, { name: newReward, weight }]);
    setNewReward('');
  };

  // 抽奖功能
  const [showParticles, setShowParticles] = useState(false);
  const [winningReward, setWinningReward] = useState(null);
  
  const handleDraw = () => {
    if (points < 100 && bingoData.extraDraws <= 0) {
      alert('积分不足，至少需要100积分或额外抽奖机会才能抽奖');
      return;
    }
    
    let useExtraDraw = false;
    if (bingoData.extraDraws > 0) {
      // 使用额外抽奖机会
      setBingoData(prev => ({
        ...prev,
        extraDraws: prev.extraDraws - 1
      }));
      useExtraDraw = true;
    } else {
      // 扣除积分
      setPoints(prev => prev - 100);
    }
    
    // 加权随机算法
    const totalWeight = rewards.reduce((sum, reward) => sum + reward.weight, 0);
    let random = Math.random() * totalWeight;
    
    let selectedReward = null;
    for (const reward of rewards) {
      random -= reward.weight;
      if (random <= 0) {
        selectedReward = reward;
        break;
      }
    }
    
    setWinningReward(selectedReward);
    setShowParticles(true);
    
    // 3秒后隐藏粒子效果
    setTimeout(() => {
      setShowParticles(false);
    }, 3000);
  };

  // 进度环Canvas
  const progressCanvasRef = useRef(null);
  const progressValueRef = useRef(0);
  
  useEffect(() => {
    const canvas = progressCanvasRef.current;
    if (!canvas || tasks.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const radius = (width - 40) / 2;
    const centerX = width / 2;
    const centerY = height / 2;
    
    const targetValue = completedTasks.length / tasks.length;
    const startValue = progressValueRef.current;
    const duration = 1000; // 动画持续时间（毫秒）
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      let progress = elapsedTime / duration;
      
      if (progress > 1) progress = 1;
      
      // 缓动函数 - easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      
      // 清除画布
      ctx.clearRect(0, 0, width, height);
      
      // 绘制背景环
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.lineWidth = 20;
      ctx.strokeStyle = '#1a202c';
      ctx.stroke();
      
      // 绘制进度环
      const currentValue = startValue + (targetValue - startValue) * easeProgress;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + currentValue * Math.PI * 2);
      ctx.lineWidth = 20;
      ctx.strokeStyle = currentValue === 1 ? '#00ffea' : '#0077ff';
      ctx.lineCap = 'round';
      ctx.stroke();
      
      // 绘制中心文本
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.round(currentValue * 100)}%`, centerX, centerY);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        progressValueRef.current = targetValue;
      }
    };
    
    requestAnimationFrame(animate);
  }, [completedTasks.length, tasks.length]);

  // 积分历史图表配置
  const chartData = {
    labels: pointHistory.map(entry => entry.date),
    datasets: [{
      label: '积分累计',
      data: pointHistory.map(entry => entry.points),
      borderColor: '#0077ff',
      backgroundColor: 'rgba(0, 119, 255, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  // 宾果消消乐模块
  const [bingoData, setBingoData] = useState({
    currentMonth: '',
    tasks: Array(25).fill('点击设置任务'),
    completed: Array(25).fill(false),
    linesAchieved: 0,
    extraDraws: 0,
    activeLines: []
  });

  // 初始化宾果数据
  const initializeBingoData = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    setBingoData({
      currentMonth,
      tasks: Array(25).fill('点击设置任务'),
      completed: Array(25).fill(false),
      linesAchieved: 0,
      extraDraws: 0,
      activeLines: []
    });
  };

  // 切换宾果任务完成状态
  const handleBingoTaskToggle = (index) => {
    setBingoData(prev => {
      const newCompleted = [...prev.completed];
      newCompleted[index] = !newCompleted[index];
      
      // 检测连线
      const { linesAchieved, activeLines } = checkLines(newCompleted);
      
      // 如果达成新连线，增加额外抽奖机会
      let extraDraws = prev.extraDraws;
      if (linesAchieved > prev.linesAchieved) {
        extraDraws += linesAchieved - prev.linesAchieved;
        // 触发庆祝动画
        triggerBingoCelebration();
      }
      
      return {
        ...prev,
        completed: newCompleted,
        linesAchieved,
        extraDraws,
        activeLines
      };
    });
  };

  // 检测连线
  const checkLines = (completed) => {
    const lines = [
      // 横向
      [0, 1, 2, 3, 4],
      [5, 6, 7, 8, 9],
      [10, 11, 12, 13, 14],
      [15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24],
      // 纵向
      [0, 5, 10, 15, 20],
      [1, 6, 11, 16, 21],
      [2, 7, 12, 17, 22],
      [3, 8, 13, 18, 23],
      [4, 9, 14, 19, 24],
      // 对角线
      [0, 6, 12, 18, 24],
      [4, 8, 12, 16, 20]
    ];
    
    let linesAchieved = 0;
    const activeLines = [];
    
    lines.forEach((line, lineIndex) => {
      const isLineComplete = line.every(index => completed[index]);
      if (isLineComplete) {
        linesAchieved++;
        activeLines.push(lineIndex);
      }
    });
    
    return { linesAchieved, activeLines };
  };

  // 宾果连线庆祝动画
  const [showBingoCelebration, setShowBingoCelebration] = useState(false);
  
  const triggerBingoCelebration = () => {
    setShowBingoCelebration(true);
    setTimeout(() => {
      setShowBingoCelebration(false);
    }, 3000);
  };

  // 设置宾果任务内容
  const [editingIndex, setEditingIndex] = useState(null);
  const [newBingoTask, setNewBingoTask] = useState('');
  
  const handleEditBingoTask = (index) => {
    setEditingIndex(index);
    setNewBingoTask(bingoData.tasks[index]);
  };
  
  const handleSaveBingoTask = () => {
    if (newBingoTask.trim() && editingIndex !== null) {
      setBingoData(prev => {
        const newTasks = [...prev.tasks];
        newTasks[editingIndex] = newBingoTask;
        return { ...prev, tasks: newTasks };
      });
      setEditingIndex(null);
    }
  };

  // 宾果庆祝粒子效果
  const bingoParticlesConfig = {
    fullScreen: { enable: false },
    particles: {
      number: { value: 150, density: { enable: true, value_area: 800 } },
      color: { value: "#00ffea" },
      shape: { type: "circle" },
      opacity: { value: 0.8 },
      size: { value: { min: 2, max: 6 } },
      move: {
        enable: true,
        speed: 8,
        direction: "none",
        random: true,
        straight: false,
        out_mode: "out",
        bounce: false
      }
    },
    interactivity: {
      events: {
        onclick: { enable: false },
        onhover: { enable: false }
      }
    },
    retina_detect: true
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 text-white font-sans p-4 md:p-8">
      {/* 粒子动画背景 */}
      <div className="fixed inset-0 -z-10 opacity-30">
        <Particles
          id="tsparticles"
          init={particlesInit}
          loaded={particlesLoaded}
          options={particlesConfig}
        />
      </div>
      
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <header className="text-center mb-8">
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">游戏化人生管理</h1>
          <p className="text-blue-300 text-lg">将目标拆解为游戏任务，通过完成任务积累积分，兑换奖励</p>
        </header>
        
        {/* 目标输入区 */}
        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 mb-8 shadow-lg border border-blue-700/30">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="输入你的目标，例如：学习Python"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg bg-gray-900/80 border border-blue-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button
              onClick={handleGoalSubmit}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1 transition-all"
            >
              拆解目标
            </button>
          </div>
        </div>
        
        {/* 主要内容区 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* 任务列表 */}
          <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-md rounded-xl p-6 shadow-lg border border-blue-700/30">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="inline-block w-4 h-4 rounded-full bg-blue-500 mr-2"></span>
              任务列表
            </h2>
            
            {tasks.length === 0 ? (
              <div className="py-8 text-center text-blue-300">
                <p>请先拆解一个目标</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {tasks.map((task, index) => (
                  <div
                    key={index}
                    className={`flex items-center p-3 rounded-lg ${completedTasks.includes(task) ? 'bg-green-900/30' : 'bg-gray-700/30'} transition-all`}
                  >
                    <input
                      type="checkbox"
                      checked={completedTasks.includes(task)}
                      onChange={() => handleTaskToggle(task)}
                      className="w-5 h-5 text-blue-500 rounded focus:ring-blue-400 mr-3 cursor-pointer"
                    />
                    <span
                      className={`flex-1 ${completedTasks.includes(task) ? 'line-through text-gray-400' : 'text-white'}`}
                    >
                      {task}
                    </span>
                    {completedTasks.includes(task) && (
                      <span className="ml-2 text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full">+10积分</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* 进度环 */}
          <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 shadow-lg border border-blue-700/30 flex flex-col items-center justify-center">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <span className="inline-block w-4 h-4 rounded-full bg-blue-500 mr-2"></span>
              完成进度
            </h2>
            
            <div className="relative">
              <canvas
                ref={progressCanvasRef}
                width="240"
                height="240"
                className="mb-4"
              ></canvas>
              
              <div className="text-center">
                <p className="text-blue-300 mb-1">已完成 {completedTasks.length} / {tasks.length} 任务</p>
                <p className="text-lg font-bold">当前积分: <span className="text-cyan-400">{points}</span></p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 积分历史图表 */}
        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 mb-8 shadow-lg border border-blue-700/30">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="inline-block w-4 h-4 rounded-full bg-blue-500 mr-2"></span>
            积分历史
          </h2>
          
          {pointHistory.length > 0 ? (
            <div className="h-64">
              <Line data={chartData} />
            </div>
          ) : (
            <div className="py-8 text-center text-blue-300">
              <p>完成任务以积累积分并查看积分增长曲线</p>
            </div>
          )}
        </div>
        
        {/* 奖励池 */}
        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 shadow-lg border border-blue-700/30">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="inline-block w-4 h-4 rounded-full bg-blue-500 mr-2"></span>
            心愿奖励池
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 添加奖励表单 */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h3 className="font-semibold mb-3">添加奖励</h3>
              
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="奖励名称"
                  value={newReward}
                  onChange={(e) => setNewReward(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-blue-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <div className="flex items-center space-x-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="rewardWeight"
                      value="common"
                      checked={rewardWeight === 'common'}
                      onChange={() => setRewardWeight('common')}
                      className="text-blue-500 focus:ring-blue-400"
                    />
                    <span className="ml-2">普通奖励 (70%)</span>
                  </label>
                  
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="rewardWeight"
                      value="rare"
                      checked={rewardWeight === 'rare'}
                      onChange={() => setRewardWeight('rare')}
                      className="text-blue-500 focus:ring-blue-400"
                    />
                    <span className="ml-2">稀有奖励 (30%)</span>
                  </label>
                </div>
                
                <button
                  onClick={handleAddReward}
                  className="w-full py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  添加到奖励池
                </button>
              </div>
            </div>
            
            {/* 奖励列表 */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">奖励列表</h3>
                <span className="text-sm text-blue-300">共 {rewards.length} 个奖励</span>
              </div>
              
              {rewards.length === 0 ? (
                <div className="py-6 text-center text-blue-300 bg-gray-700/30 rounded-lg">
                  <p>奖励池为空，请添加奖励</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {rewards.map((reward, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${reward.weight === 30 ? 'bg-purple-900/30' : 'bg-gray-700/30'}`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{reward.name}</span>
                        <span className="text-xs px-2 py-1 rounded-full">
                          {reward.weight === 30 ? '稀有' : '普通'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* 抽奖按钮 */}
              <button
                onClick={handleDraw}
                className={`mt-4 w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium ${
                  points < 100 && bingoData.extraDraws <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-purple-500/30 transform hover:-translate-y-1 transition-all'
                }`}
                disabled={points < 100 && bingoData.extraDraws <= 0}
              >
                {points < 100 && bingoData.extraDraws <= 0 ? 
                  `积分不足 (${points}/100)` : 
                  `抽取奖励 (${points >= 100 ? '100积分' : ''}${points >= 100 && bingoData.extraDraws > 0 ? ' 或 ' : ''}${bingoData.extraDraws > 0 ? `${bingoData.extraDraws}次额外机会` : ''})`
                }
              </button>
            </div>
          </div>
          
          {/* 中奖结果 */}
          {winningReward && (
            <div className="mt-6 p-4 bg-gradient-to-r from-indigo-900 to-purple-900 rounded-lg border border-purple-600/50 transform transition-all">
              <h3 className="font-bold text-lg mb-2">恭喜您抽中：</h3>
              <p className="text-xl font-bold text-purple-300">{winningReward.name}</p>
              <p className="text-sm text-purple-400 mt-1">{winningReward.weight === 30 ? '稀有奖励' : '普通奖励'}</p>
            </div>
          )}
        </div>
        
        {/* 每月任务宾果消消乐模块 */}
        <div className="mt-8 bg-gray-800/50 backdrop-blur-md rounded-xl p-6 shadow-lg border border-blue-700/30">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <span className="inline-block w-4 h-4 rounded-full bg-green-500 mr-2"></span>
              每月任务宾果消消乐 ({new Date().toLocaleDateString('zh-CN', { month: 'long' })})
            </h2>
            
            <div className="flex space-x-4 mt-4 md:mt-0">
              <div className="bg-gray-700/50 rounded-lg px-4 py-2 flex items-center">
                <span className="mr-2 text-green-400">
                  <i className="fa fa-check-circle"></i>
                </span>
                <span>已完成: {bingoData.completed.filter(Boolean).length}/25</span>
              </div>
              
              <div className="bg-gray-700/50 rounded-lg px-4 py-2 flex items-center">
                <span className="mr-2 text-red-400">
                  <i className="fa fa-bolt"></i>
                </span>
                <span>连线数: {bingoData.linesAchieved}</span>
              </div>
              
              <div className="bg-gray-700/50 rounded-lg px-4 py-2 flex items-center">
                <span className="mr-2 text-purple-400">
                  <i className="fa fa-gift"></i>
                </span>
                <span>额外抽奖: {bingoData.extraDraws}</span>
              </div>
            </div>
          </div>
          
          {/* 宾果网格 */}
          <div className="grid grid-cols-5 gap-2 relative">
            {bingoData.tasks.map((task, index) => {
              // 检查是否属于活跃连线
              const isInActiveLine = bingoData.activeLines.some(lineIndex => {
                const lines = [
                  // 横向
                  [0, 1, 2, 3, 4],
                  [5, 6, 7, 8, 9],
                  [10, 11, 12, 13, 14],
                  [15, 16, 17, 18, 19],
                  [20, 21, 22, 23, 24],
                  // 纵向
                  [0, 5, 10, 15, 20],
                  [1, 6, 11, 16, 21],
                  [2, 7, 12, 17, 22],
                  [3, 8, 13, 18, 23],
                  [4, 9, 14, 19, 24],
                  // 对角线
                  [0, 6, 12, 18, 24],
                  [4, 8, 12, 16, 20]
                ];
                return lines[lineIndex].includes(index);
              });
              
              // 编辑状态
              if (editingIndex === index) {
                return (
                  <div 
                    key={index} 
                    className="aspect-square bg-gray-700/80 rounded-lg p-3 flex flex-col items-center justify-center border-2 border-blue-500 transform transition-all hover:shadow-lg hover:shadow-blue-500/20"
                  >
                    <input
                      type="text"
                      value={newBingoTask}
                      onChange={(e) => setNewBingoTask(e.target.value)}
                      className="w-full bg-gray-800 border border-blue-600/50 rounded p-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={handleSaveBingoTask}
                        className="px-2 py-1 bg-blue-600 rounded text-sm"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingIndex(null)}
                        className="px-2 py-1 bg-gray-600 rounded text-sm"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                );
              }
              
              return (
                <div 
                  key={index} 
                  className={`aspect-square ${
                    bingoData.completed[index] 
                      ? 'bg-green-900/40 border-2 border-green-500' 
                      : 'bg-gray-700/30 border border-gray-600/50'
                  } ${
                    isInActiveLine 
                      ? 'border-2 border-red-500 shadow-lg shadow-red-500/30' 
                      : ''
                  } rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer transform transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20`}
                  onClick={() => editingIndex === null ? handleBingoTaskToggle(index) : null}
                  onDoubleClick={() => editingIndex === null ? handleEditBingoTask(index) : null}
                >
                  <p className="text-center text-sm md:text-base">{task}</p>
                  {bingoData.completed[index] && (
                    <div className="mt-2 text-green-400">
                      <i className="fa fa-check-circle text-xl"></i>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* 宾果庆祝动画 */}
          {showBingoCelebration && (
            <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
              <Particles
                id="bingoParticles"
                init={particlesInit}
                loaded={particlesLoaded}
                options={bingoParticlesConfig}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* 粒子动画效果 */}
      {showParticles && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <Particles
            id="winningParticles"
            init={particlesInit}
            loaded={particlesLoaded}
            options={{
              ...particlesConfig,
              particles: {
                ...particlesConfig.particles,
                color: { value: winningReward.weight === 30 ? "#ff00ff" : "#00f7ff" },
                size: { value: { min: 2, max: 5 } },
                move: { speed: 10 }
              },
              interactivity: {
                events: {
                  onclick: { enable: false }
                }
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
