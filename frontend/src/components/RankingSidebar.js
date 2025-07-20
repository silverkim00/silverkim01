import React, { useState, useEffect } from 'react'; // useCallback 제거
import axios from 'axios';
// import { Link } from 'react-router-dom'; // Link 제거

// API 기본 URL을 환경 변수에서 가져옵니다.
// 이 값은 .env 파일 (개발) 또는 .env.production 파일 (배포)에 정의되어야 합니다.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function RankingSidebar({
    isOpen,
    onClose,
    rankingData,
    incentiveData: initialIncentiveData,
    siteConfigData,
    fightingMessage: initialFightingMessage,
    isAdmin,
    token,
    onUpdate
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editableMessage, setEditableMessage] = useState(initialFightingMessage);
    const [editableIncentives, setEditableIncentives] = useState([]);

    useEffect(() => {
        setEditableMessage(initialFightingMessage);
        setEditableIncentives(initialIncentiveData || []);
    }, [isOpen, initialIncentiveData, initialFightingMessage]);

    const handleIncentiveChange = (index, field, value) => {
        const newIncentives = [...editableIncentives];
        newIncentives[index][field] = value;
        setEditableIncentives(newIncentives);
    };

    const handleIncentiveAddRow = () => {
        setEditableIncentives([...editableIncentives, { case_count: '', reward_amount: '' }]);
    };

    const handleIncentiveRemoveRow = (index) => {
        const newIncentives = editableIncentives.filter((_, i) => i !== index);
        setEditableIncentives(newIncentives);
    };

    const handleSave = async () => {
        const authHeaders = { headers: { Authorization: `Token ${token}` } };
        const promises = [];

        const fightingMessageConfig = siteConfigData.find(c => c.key === 'fighting_message');
        if (fightingMessageConfig && editableMessage !== initialFightingMessage) {
            promises.push(
                // API_BASE_URL 사용
                axios.patch(`${API_BASE_URL}/site-configurations/${fightingMessageConfig.key}/`, { 
                    value: editableMessage 
                }, authHeaders)
            );
        }

        const incentivesToUpdate = editableIncentives.filter(inc => inc.case_count && inc.reward_amount);
        promises.push(
            // API_BASE_URL 사용
            axios.post(`${API_BASE_URL}/incentives/bulk-update/`, incentivesToUpdate, authHeaders)
        );

        try {
            await Promise.all(promises);
            alert('성공적으로 저장되었습니다.');
            setIsEditing(false);
            onUpdate();
        } catch (error) {
            console.error('저장 중 오류 발생!', error.response?.data);
            alert('저장 중 오류가 발생했습니다.');
        }
    };
    
    const handleCancel = () => {
        setEditableMessage(initialFightingMessage);
        setEditableIncentives(initialIncentiveData || []);
        setIsEditing(false);
    };
    
    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
            <div className={`ranking-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                <div className="sidebar-content">
                    {isEditing ? (
                        <textarea 
                            value={editableMessage} 
                            onChange={(e) => setEditableMessage(e.target.value)}
                            className="fighting-message-input"
                            rows="2"
                        />
                    ) : (
                        <div className="fighting-message">{editableMessage}</div>
                    )}

                    <div className="sidebar-section overall-ranking">
                        <h3>{new Date().getMonth() + 1}월 종합순위</h3>
                        {rankingData && rankingData.length > 0 ? (
                            <ol className="ranking-list">
                                {rankingData.map(item => <li key={item.rank}><span>{item.rank}위</span> <span>{item.employee_username}</span> <span>{item.total_value}건</span></li>)}
                            </ol>
                        ) : <p className="no-data">데이터가 없습니다.</p>}
                    </div>

                    <div className="sidebar-section incentive-table">
                        <h4>건수 인센티브</h4>
                        <table>
                            <thead><tr><th>건수</th><th>인센티브</th>{isEditing && <th>삭제</th>}</tr></thead>
                            <tbody>
                                {editableIncentives.map((inc, index) => (
                                    <tr key={index}>
                                        <td>
                                            {isEditing ? <input type="text" value={inc.case_count} onChange={(e) => handleIncentiveChange(index, 'case_count', e.target.value)} className="sidebar-input" /> : `${inc.case_count || '-'} 건`}
                                        </td>
                                        <td>
                                            {isEditing ? <input type="number" value={inc.reward_amount} onChange={(e) => handleIncentiveChange(index, 'reward_amount', e.target.value)} className="sidebar-input" /> : `${inc.reward_amount ? Number(inc.reward_amount).toLocaleString() : '-'} 원`}
                                        </td>
                                        {isEditing && (
                                            <td><button onClick={() => handleIncentiveRemoveRow(index)} className="btn-remove-row">&times;</button></td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {isEditing && (
                            <button onClick={handleIncentiveAddRow} className="btn-add-row">+ 행 추가</button>
                        )}
                    </div>
                </div>
                {isAdmin && (
                    <div className="sidebar-actions">
                        {isEditing ? (
                            <>
                                <button onClick={handleSave} className="btn-save">저장</button>
                                <button onClick={handleCancel} className="btn-cancel">취소</button>
                            </>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="btn-edit">수정</button>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

export default RankingSidebar;