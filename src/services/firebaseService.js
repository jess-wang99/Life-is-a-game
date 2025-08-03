import { db, auth } from '../config/firebase';
import { ref, onValue, set, update, remove } from "firebase/database";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getToday } from '../utils';

// 用户认证
export const authenticateUser = (callback) => {
  // 匿名登录
  signInAnonymously(auth).catch(error => {
    console.error("Authentication error:", error);
  });
  
  // 监听用户状态变化
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};

// 加载用户任务
export const loadUserTasks = (userId, callback) => {
  const tasksRef = ref(db, `users/${userId}/tasks`);
  return onValue(tasksRef, (snapshot) => {
    const data = snapshot.val();
    const tasks = data ? Object.values(data) : [];
    callback(tasks);
  });
};

// 添加新任务
export const addNewTask = (userId, taskData) => {
  const taskId = Date.now().toString();
  const today = getToday();
  const expMap = { easy: 30, medium: 50, hard: 100 };
  
  const newTask = {
    id: taskId,
    ...taskData,
    completed: false,
    exp: expMap[taskData.difficulty],
    points: Math.round(expMap[taskData.difficulty] / 3),
    createdAt: today
  };
  
  const taskRef = ref(db, `users/${userId}/tasks/${taskId}`);
  return set(taskRef, newTask);
};

// 更新任务
export const updateTask = (userId, taskId, taskData) => {
  const expMap = { easy: 30, medium: 50, hard: 100 };
  
  const updatedTask = {
    ...taskData,
    exp: expMap[taskData.difficulty],
    points: Math.round(expMap[taskData.difficulty] / 3)
  };
  
  const taskRef = ref(db, `users/${userId}/tasks/${taskId}`);
  return update(taskRef, updatedTask);
};

// 更新任务状态
export const updateTaskStatus = (userId, taskId, completed) => {
  const taskRef = ref(db, `users/${userId}/tasks/${taskId}`);
  return update(taskRef, { completed });
};

// 删除任务
export const deleteTask = (userId, taskId) => {
  const taskRef = ref(db, `users/${userId}/tasks/${taskId}`);
  return remove(taskRef);
};

// 加载用户积分
export const loadUserPoints = (userId, callback) => {
  const pointsRef = ref(db, `users/${userId}/points`);
  return onValue(pointsRef, (snapshot) => {
    callback(snapshot.val() || 0);
  });
};

// 更新用户积分
export const updateUserPoints = (userId, points) => {
  const pointsRef = ref(db, `users/${userId}/points`);
  return set(pointsRef, points);
};

// 加载抽奖历史
export const loadLotteryHistory = (userId, callback) => {
  const lotteryRef = ref(db, `users/${userId}/lotteryHistory`);
  return onValue(lotteryRef, (snapshot) => {
    const data = snapshot.val();
    callback(data ? Object.values(data) : []);
  });
};

// 记录抽奖结果
export const recordLotteryResult = (userId, result) => {
  const historyId = Date.now().toString();
  const historyRef = ref(db, `users/${userId}/lotteryHistory/${historyId}`);
  
  return set(historyRef, {
    id: historyId,
    prize: result,
    date: new Date().toLocaleString(),
    used: false
  });
};

// 使用心愿券
export const useWishTicket = (userId, ticketId) => {
  const ticketRef = ref(db, `users/${userId}/lotteryHistory/${ticketId}`);
  return update(ticketRef, { used: true });
};

// 加载心愿列表
export const loadWishes = (userId, callback) => {
  const wishesRef = ref(db, `users/${userId}/wishes`);
  return onValue(wishesRef, (snapshot) => {
    const data = snapshot.val();
    callback(data ? Object.values(data) : []);
  });
};

// 添加心愿
export const addWish = (userId, wishTitle) => {
  const wishId = Date.now().toString();
  const wishRef = ref(db, `users/${userId}/wishes/${wishId}`);
  
  return set(wishRef, {
    id: wishId,
    title: wishTitle,
    status: 'pending',
    createdAt: new Date().toLocaleString()
  });
};

// 更新心愿状态
export const updateWishStatus = (userId, wishId, status) => {
  const wishRef = ref(db, `users/${userId}/wishes/${wishId}`);
  return update(wishRef, { status });
};

// 删除心愿
export const deleteWish = (userId, wishId) => {
  const wishRef = ref(db, `users/${userId}/wishes/${wishId}`);
  return remove(wishRef);
};
    
