import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from "firebase/auth";
import { loadUserPoints } from '../services/firebaseService';

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to}
      className={`flex items-center gap-1 px-1 py-2 ${
        isActive 
          ? 'text-blue-400 border-b-2 border-blue-400' 
          : 'text-gray-300 hover:text-white transition-colors'
      }`}
    >
      {children}
    </Link>
  );
};

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [loadingPoints, setLoadingPoints] = useState(true);
  
  useEffect(() => {
    // 监听用户状态变化
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      
      if (user) {
        setLoadingPoints(true);
        // 加载用户积分
        const unsubscribePoints = loadUserPoints(user.uid, (points) => {
          setPoints(points);
          setLoadingPoints(false);
        });
        
        return () => unsubscribePoints();
      } else {
        setPoints(0);
        setLoadingPoints(false);
      }
    });
    
    return () => unsubscribeAuth();
  }, []);

  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <i className="fa fa-gamepad text-blue-400"></i>
              <span>人生游戏</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {!loadingPoints && (
              <div className="px-3 py-1 bg-yellow-900/50 rounded-full text-sm flex items-center gap-1">
                <i className="fa fa-ticket text-yellow-400"></i>
                <span>{points}</span>
              </div>
            )}
            
            <div className="hidden md:flex items-center gap-6">
              <NavLink to="/">首页</NavLink>
              <NavLink to="/tasks">任务</NavLink>
              <NavLink to="/achievements">成就</NavLink>
              <NavLink to="/stats">数据</NavLink>
              <NavLink to="/lottery">抽奖</NavLink>
              <NavLink to="/wishes">心愿</NavLink>
            </div>
            
            {/* 移动端菜单按钮 */}
            <button className="md:hidden text-gray-300 hover:text-white">
              <i className="fa fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
    
