import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// API 기본 URL을 환경 변수에서 가져옵니다.
// 이 값은 .env 파일 (개발) 또는 .env.production 파일 (배포)에 정의되어야 합니다.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [gender, setGender] = useState('');

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        const userData = {
            username: username,
            password: password,
            first_name: firstName,
            profile: {
                birth_date: birthDate,
                gender: gender,
            }
        };

        // API_BASE_URL을 사용하여 회원가입 API 호출
        axios.post(`${API_BASE_URL}/register/`, userData)
            .then(response => {
                console.log(response.data);
                alert('회원가입 요청이 완료되었습니다. 관리자의 승인 후 로그인할 수 있습니다.');
                navigate('/login');
            })
            .catch(error => {
                console.error('회원가입 중 오류 발생!', error.response?.data);
                const errorMessages = error.response?.data ? 
                    Object.values(error.response.data).flat().join('\n') : 
                    '알 수 없는 오류가 발생했습니다.';
                alert(`회원가입 실패:\n${errorMessages}`);
            });
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>직원 가입</h2>
                <input
                    type="text"
                    placeholder="이름"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="아이디"
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
                <input
                    type="text"
                    placeholder="생년월일 8자리 (예: 19900101)"
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value.replace(/[^0-9]/g, ''))}
                    maxLength="8"
                    required
                />
                <div className="radio-group-register">
                    <label>
                        <input
                            type="radio"
                            name="gender"
                            value="M"
                            checked={gender === 'M'}
                            onChange={e => setGender(e.target.value)}
                            required
                        /> 남
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="gender"
                            value="F"
                            checked={gender === 'F'}
                            onChange={e => setGender(e.target.value)}
                            required
                        /> 여
                    </label>
                </div>
                <button type="submit" className="btn-primary">가입 요청</button>
                <p>이미 계정이 있으신가요? <Link to="/login">로그인</Link></p>
            </form>
        </div>
    );
}

export default RegisterPage;