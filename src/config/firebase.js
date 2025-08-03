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

// 更新任务状态
export const updateTaskStatus = (userId, taskId, completed) => {
  const taskRef = ref(db, `users/${userId}/tasks/${taskId}`);
  return update(taskRef, { completed });
};

// 其他Firebase操作方法...
