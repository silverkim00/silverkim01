import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import PageLayout from '../components/PageLayout'; // PageLayout import

// API 기본 URL을 환경 변수에서 가져옵니다.
// 이 값은 .env 파일 (개발) 또는 .env.production 파일 (배포)에 정의되어야 합니다.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function UserManagementPage({ token }) {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const authHeaders = useCallback(() => ({
        headers: { Authorization: `Token ${token}` }
    }), [token]);

    const fetchUsers = useCallback(() => {
        setIsLoading(true);
        // API_BASE_URL 사용
        axios.get(`${API_BASE_URL}/users/`, authHeaders())
            .then(response => {
                const userList = Array.isArray(response.data) ? response.data : response.data.results;
                setUsers(userList || []);
            })
            .catch(err => {
                setError('직원 목록을 불러오는 중 오류가 발생했습니다.');
                console.error(err);
                setUsers([]);
            })
            .finally(() => setIsLoading(false));
    }, [authHeaders]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleUpdateUser = (userId, field, value) => {
        const updatedData = { [field]: value };
        // API_BASE_URL 사용
        axios.patch(`${API_BASE_URL}/users/${userId}/`, updatedData, authHeaders())
            .then(() => {
                fetchUsers();
            })
            .catch(err => {
                alert('업데이트 중 오류가 발생했습니다.');
                console.error(err.response?.data);
            });
    };

    if (isLoading) {
        return <PageLayout title="직원 계정 관리"><div>로딩 중...</div></PageLayout>;
    }
    if (error) {
        return <PageLayout title="직원 계정 관리"><div className="error-text">{error}</div></PageLayout>;
    }

    return (
        <PageLayout title="직원 계정 관리">
            <div className="client-list-container"> {/* 고객 목록 테이블 스타일 재사용 */}
                <table className="client-table">
                    <thead>
                        <tr>
                            <th>이름 (ID)</th>
                            <th>가입일</th>
                            <th>역할(그룹)</th>
                            <th>계정 상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <p className="user-name">{user.first_name || '(이름없음)'}</p>
                                    <p className="user-id">{user.username}</p>
                                </td>
                                <td>{user.date_joined}</td>
                                <td>
                                    <select 
                                        value={user.groups[0]?.name || 'Staff'}
                                        onChange={(e) => handleUpdateUser(user.id, 'groups', [e.target.value])}
                                        className="form-select" // 공통 스타일 적용
                                    >
                                        <option value="Staff">Staff</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </td>
                                <td>
                                    <div className="status-toggle-wrapper">
                                        <label className="toggle-switch">
                                            <input 
                                                type="checkbox" 
                                                checked={user.is_active}
                                                onChange={(e) => handleUpdateUser(user.id, 'is_active', e.target.checked)}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                        <span className={`toggle-label ${user.is_active ? 'active' : ''}`}>
                                            {user.is_active ? '활성' : '승인대기'}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </PageLayout>
    );
}

export default UserManagementPage;
