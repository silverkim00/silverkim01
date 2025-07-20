// LoginPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// API 기본 URL을 환경 변수에서 가져옵니다.
// 이 값은 .env 파일 (개발) 또는 .env.production 파일 (배포)에 정의되어야 합니다.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function LoginPage({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // API_BASE_URL을 사용하여 로그인 API 호출
        axios.post(`${API_BASE_URL}/login/`, { username, password })
            .then(response => {
                // response.data 객체 전체를 onLogin으로 전달합니다.
                onLogin(response.data);
                
                // 로그인 후 역할에 따라 올바른 페이지로 이동합니다.
                if (response.data.groups.includes('Admin')) {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            })
            .catch(error => {
                // alert() 대신 사용자에게 메시지를 보여주는 UI 컴포넌트를 사용하는 것이 좋습니다.
                alert('로그인 실패: 아이디 또는 비밀번호를 확인해주세요.');
                console.error('로그인 오류!', error);
            });
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>로그인</h2>
                <input
                    type="text"
                    placeholder="사용자 아이디"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <button type="submit" className="btn-primary">로그인</button>
                <p>계정이 없으신가요? <Link to="/register">가입하기</Link></p>
            </form>
        </div>
    );
}

export default LoginPage;