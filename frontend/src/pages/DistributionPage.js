import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import PageLayout from '../components/PageLayout';

// API 기본 URL을 환경 변수에서 가져옵니다.
// 이 값은 .env 파일 (개발) 또는 .env.production 파일 (배포)에 정의되어야 합니다.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// 정렬 가능한 테이블 헤더 컴포넌트
const SortableHeader = ({ children, onSort, sortKey, sortConfig }) => {
    const isSorted = sortConfig.key === sortKey;
    const directionIcon = sortConfig.direction === 'ascending' ? '▲' : '▼';
    return (
        <th className="sortable-header" onClick={() => onSort(sortKey)}>
            {children}
            <span className="sort-icon">{isSorted ? directionIcon : ''}</span>
        </th>
    );
};

function DistributionPage({ token }) {
    const [unassignedClients, setUnassignedClients] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [selectedClients, setSelectedClients] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState([]);
    const [distributionDate, setDistributionDate] = useState(new Date().toISOString().slice(0, 10));

    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'descending' });
    const [clientSearchTerm, setClientSearchTerm] = useState('');
    const [staffSearchTerm, setStaffSearchTerm] = useState('');
    const [numToSelect, setNumToSelect] = useState(50);

    const authHeaders = useCallback(() => ({ headers: { Authorization: `Token ${token}` } }), [token]);

    const fetchData = useCallback(() => {
        const orderParam = sortConfig.direction === 'descending' ? `-${sortConfig.key}` : sortConfig.key;
        // 미배분 고객은 페이지네이션 없이 모두 불러오도록 수정 (대량 작업을 위해)
        // API_BASE_URL 사용
        const clientsUrl = `${API_BASE_URL}/clientdata/?distributed=false&search=${clientSearchTerm}&ordering=${orderParam}&page_size=1000`;
        // API_BASE_URL 사용
        const staffUrl = `${API_BASE_URL}/staff/`;

        axios.all([axios.get(clientsUrl, authHeaders()), axios.get(staffUrl, authHeaders())])
            .then(axios.spread((clientsRes, staffRes) => {
                setUnassignedClients(clientsRes.data.results || []);
                setStaffList(staffRes.data || []);
            }))
            .catch(error => console.error("데이터 로딩 오류", error));
    }, [authHeaders, sortConfig, clientSearchTerm]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // --- 체크박스 선택/해제 로직 수정 ---
    const handleClientSelection = (clientId) => {
        setSelectedClients(prev =>
            prev.includes(clientId)
                ? prev.filter(id => id !== clientId) // 이미 있으면 제거
                : [...prev, clientId] // 없으면 추가
        );
    };
    const handleStaffSelection = (staffId) => {
        setSelectedStaff(prev =>
            prev.includes(staffId)
                ? prev.filter(id => id !== staffId)
                : [...prev, staffId]
        );
    };
    
    const handleSelectAllClients = (e) => {
        if (e.target.checked) {
            setSelectedClients(unassignedClients.map(c => c.id));
        } else {
            setSelectedClients([]);
        }
    };
    const handleSelectAllStaff = (e) => {
        const staffToSelect = checkedInStaff.map(s => s.id);
        if (e.target.checked) {
            setSelectedStaff(staffToSelect);
        } else {
            setSelectedStaff([]);
        }
    };

    const handleSelectNumClients = () => {
        const clientsToSelect = unassignedClients.slice(0, numToSelect).map(c => c.id);
        setSelectedClients(clientsToSelect);
    };
    
    const handleDistribute = async (isRandom = false) => {
        if (selectedClients.length === 0 || selectedStaff.length === 0) {
            alert('고객과 상담사를 1명 이상 선택해주세요.');
            return;
        }
        const data = {
            client_ids: selectedClients,
            staff_ids: selectedStaff,
            distribution_date: distributionDate,
            randomize: isRandom,
        };
        try {
            // API_BASE_URL 사용
            const response = await axios.post(`${API_BASE_URL}/distribute/`, data, authHeaders());
            alert(response.data.message);
            fetchData();
            setSelectedClients([]);
            setSelectedStaff([]);
        } catch (error) {
            alert(`배분 실패: ${error.response?.data?.error || '알 수 없는 오류'}`);
        }
    };

    const filteredStaff = staffList.filter(staff =>
        (staff.first_name || '').toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
        staff.username.toLowerCase().includes(staffSearchTerm.toLowerCase())
    );
    const checkedInStaff = filteredStaff.filter(staff => staff.checked_in);

    return (
        <PageLayout title="상담사 배분">
            <div className="distribution-container">
                <div className="list-panel">
                    <div className="panel-header">
                        <h3 className="widget-title">미배분 고객 ({unassignedClients.length})</h3>
                        <input type="text" placeholder="고객명 검색..." value={clientSearchTerm} onChange={(e) => setClientSearchTerm(e.target.value)} className="search-input panel-search" />
                    </div>
                    <div className="bulk-actions">
                        <input type="number" value={numToSelect} onChange={(e) => setNumToSelect(parseInt(e.target.value, 10) || 0)} className="form-input num-input" />
                        <button onClick={handleSelectNumClients} className="btn-secondary">개 선택</button>
                    </div>
                    <div className="list-box table-container">
                        <table className="distribution-table">
                            <thead>
                                <tr>
                                    <th><input type="checkbox" onChange={handleSelectAllClients} checked={selectedClients.length === unassignedClients.length && unassignedClients.length > 0} /></th>
                                    <SortableHeader sortKey="name" sortConfig={sortConfig} onSort={handleSort}>고객명</SortableHeader>
                                    <SortableHeader sortKey="address" sortConfig={sortConfig} onSort={handleSort}>지역</SortableHeader>
                                    <SortableHeader sortKey="created_at" sortConfig={sortConfig} onSort={handleSort}>등록일</SortableHeader>
                                </tr>
                            </thead>
                            <tbody>
                                {unassignedClients.map(client => (
                                    <tr key={client.id} onClick={() => handleClientSelection(client.id)} className={selectedClients.includes(client.id) ? 'selected' : ''}>
                                        <td><input type="checkbox" checked={selectedClients.includes(client.id)} onChange={() => {}} /></td>
                                        <td>{client.name}</td>
                                        <td>{client.address}</td>
                                        <td>{new Date(client.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="list-panel">
                    <div className="panel-header">
                        <h3 className="widget-title">상담사 목록 ({filteredStaff.length})</h3>
                        <input type="text" placeholder="상담사명 검색..." value={staffSearchTerm} onChange={(e) => setStaffSearchTerm(e.target.value)} className="search-input panel-search" />
                    </div>
                    <div className="list-box table-container">
                        <table className="distribution-table">
                            <thead>
                                <tr>
                                    <th><input type="checkbox" onChange={handleSelectAllStaff} checked={selectedStaff.length === checkedInStaff.length && checkedInStaff.length > 0} /></th>
                                    <th>상담사명</th>
                                    <th>아이디</th>
                                    <th>상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStaff.map(staff => (
                                    <tr key={staff.id} onClick={() => handleStaffSelection(staff.id)} className={selectedStaff.includes(staff.id) ? 'selected' : ''}>
                                        <td><input type="checkbox" checked={selectedStaff.includes(staff.id)} onChange={() => {}} /></td>
                                        <td>{staff.first_name}</td>
                                        <td>{staff.username}</td>
                                        <td>
                                            <span className={`status-dot ${staff.checked_in ? 'active' : ''}`}></span>
                                            {staff.checked_in ? '출근' : '퇴근'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="distribution-actions">
                <label htmlFor="distribution-date">배분 날짜:</label>
                <input type="date" id="distribution-date" value={distributionDate} onChange={(e) => setDistributionDate(e.target.value)} className="form-input" />
                <button onClick={() => handleDistribute(false)} className="btn-primary">선택 순차 배분</button>
                <button onClick={() => handleDistribute(true)} className="btn-accent">선택 랜덤 배분</button>
            </div>
        </PageLayout>
    );
}

export default DistributionPage;

