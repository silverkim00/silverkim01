// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import PWAInstallButton from './components/PWAInstallButton';

// 페이지 컴포넌트 import
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MainPage from './pages/MainPage';
import AdminPage from './pages/AdminPage';
import DistributionPage from './pages/DistributionPage';
import ClientRegistrationPage from './pages/ClientRegistrationPage';
import StatusPage from './pages/StatusPage';
import AttendancePage from './pages/AttendancePage';
import UserManagementPage from './pages/UserManagementPage';

// API 기본 URL을 환경 변수에서 가져옵니다.
// 이 값은 .env 파일 (개발) 또는 .env.production 파일 (배포)에 정의되어야 합니다.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// localStorage에서 안전하게 데이터를 읽어오는 함수
const getInitialState = (key, defaultValue) => {
    try {
        const item = localStorage.getItem(key);
        if (item === null || item === 'undefined') {
            return defaultValue;
        }
        return JSON.parse(item);
    } catch (error) {
        console.error(`Error parsing JSON from localStorage key "${key}":`, error);
        return defaultValue;
    }
};

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [username, setUsername] = useState(localStorage.getItem('username'));
    const [groups, setGroups] = useState(getInitialState('groups', []));

    const handleLogin = (data) => {
        const { token, username, groups } = data;
        setToken(token);
        setUsername(username);
        setGroups(groups);
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        localStorage.setItem('groups', JSON.stringify(groups));
    };

    const handleLogout = () => {
        if (token) {
            // API_BASE_URL을 사용하여 로그아웃 API 호출
            axios.post(`${API_BASE_URL}/logout/`, {}, {
                headers: { Authorization: `Token ${token}` }
            }).catch(error => console.error("Logout API error", error));
        }
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('groups');
        setToken(null);
        setUsername(null);
        setGroups([]);
    };

    const isAdmin = Array.isArray(groups) && groups.includes('Admin');

    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* 로그인/가입 경로 */}
                    <Route path="/login" element={!token ? <LoginPage onLogin={handleLogin} /> : <Navigate to={isAdmin ? "/admin" : "/"} />} />
                    <Route path="/register" element={!token ? <RegisterPage /> : <Navigate to="/login" />} />
                    
                    {/* 일반 직원 경로 */}
                    <Route path="/" element={token ? (isAdmin ? <Navigate to="/admin" /> : <MainPage token={token} username={username} onLogout={handleLogout} />) : <Navigate to="/login" />} />
                    
                    {/* 관리자 전용 경로 */}
                    <Route path="/admin" element={token && isAdmin ? <AdminPage token={token} username={username} onLogout={handleLogout} /> : <Navigate to="/" />} />
                    <Route path="/admin/distribution" element={token && isAdmin ? <DistributionPage token={token} /> : <Navigate to="/" />} />
                    <Route path="/admin/register-client" element={token && isAdmin ? <ClientRegistrationPage token={token} /> : <Navigate to="/" />} />
                    <Route path="/admin/status" element={token && isAdmin ? <StatusPage token={token} /> : <Navigate to="/" />} />
                    <Route path="/admin/user-management" element={token && isAdmin ? <UserManagementPage token={token} /> : <Navigate to="/" />} />
                    
                    {/* 공용 경로 */}
                    <Route path="/attendance" element={token ? <AttendancePage token={token} isAdmin={isAdmin} /> : <Navigate to="/login" />} />
                    
                    {/* 일치하는 경로가 없을 경우 리다이렉트 */}
                    <Route path="*" element={<Navigate to={token ? (isAdmin ? "/admin" : "/") : "/login"} />} />
                </Routes>
            <PWAInstallButton />
            </div>
        </Router>
    );
}

export default App;