// 日期格式化工具
export const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// 获取当前日期
export const getToday = () => {
  return formatDate(new Date());
};

// 任务分类定义
export const TASK_CATEGORIES = [
  { id: 'skill', name: '技能', icon: 'graduation-cap', color: 'blue' },
  { id: 'fitness', name: '健身', icon: 'heartbeat', color: 'red' },
  { id: 'habit', name: '好习惯', icon: 'leaf', color: 'green' },
  { id: 'growth', name: '成长', icon: 'line-chart', color: 'purple' },
  { id: 'finance', name: '财务', icon: 'money', color: 'yellow' },
  { id: 'social', name: '社交', icon: 'users', color: 'cyan' },
];

// 计算等级
export const calculateLevel = (totalExp) => {
  return Math.floor(totalExp / 1000) + 1;
};

// 计算距离下一级所需经验
export const calculateExpToNextLevel = (totalExp) => {
  return 1000 - (totalExp % 1000);
};

// 筛选今日任务
export const filterTodayTasks = (taskList) => {
  const today = getToday();
  return taskList.filter(task => {
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
};

// 获取最近7天的任务完成数据
export const getLast7DaysData = (tasks) => {
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
    
