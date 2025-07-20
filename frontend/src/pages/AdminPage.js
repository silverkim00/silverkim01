import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // useNavigate 제거

// 컴포넌트 import
import ClientList from '../ClientList';
import ClientDetailModal from '../ClientDetailModal';
import Pagination from '../components/Pagination';
import MySummaryPanel from '../components/MySummaryPanel';
import RankingBanner from './RankingBanner';
import RankingSidebar from '../components/RankingSidebar';

// API 기본 URL을 환경 변수에서 가져옵니다.
// 이 값은 .env 파일 (개발) 또는 .env.production 파일 (배포)에 정의되어야 합니다.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const formatDate = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
};

function AdminPage({ token, username, onLogout }) {
    // --- 상태 관리 (State) ---
    const [clients, setClients] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'descending' });
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState(formatDate(new Date()));
    const [endDate, setEndDate] = useState(formatDate(new Date()));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [rankingData, setRankingData] = useState([]);
    const [mySummary, setMySummary] = useState(null);
    const [incentives, setIncentives] = useState([]);
    const [siteConfigData, setSiteConfigData] = useState([]);
    const [siteConfig, setSiteConfig] = useState({});
    const [isEditingAnnouncement, setIsEditingAnnouncement] = useState(false);
    const [editableAnnouncement, setEditableAnnouncement] = useState('');

    const recordType = '월간 계약 건수';

    const authHeaders = useCallback(() => ({ headers: { Authorization: `Token ${token}` } }), [token]);

    const fetchClients = useCallback((page = 1) => {
        const orderParam = sortConfig.direction === 'descending' ? `-${sortConfig.key}` : sortConfig.key;
        // API_BASE_URL 사용
        const url = `${API_BASE_URL}/clientdata/?page=${page}&search=${searchTerm}&start_date=${startDate}&end_date=${endDate}&ordering=${orderParam}`;
        axios.get(url, authHeaders())
            .then(response => {
                setClients(response.data.results);
                setTotalPages(Math.ceil(response.data.count / 50));
            })
            .catch(error => { console.error('고객 데이터 로딩 오류', error); setClients([]); });
    }, [startDate, endDate, searchTerm, authHeaders, sortConfig]);

    const fetchDashboardData = useCallback(() => {
        const urls = [
            // API_BASE_URL 사용
            `${API_BASE_URL}/performance/?ranking=true&type=${recordType}`,
            `${API_BASE_URL}/my-summary/`,
            `${API_BASE_URL}/incentives/`,
            `${API_BASE_URL}/site-configurations/`,
        ];
        axios.all(urls.map(url => axios.get(url, authHeaders())))
            .then(axios.spread((rankingRes, summaryRes, incentiveRes, configRes) => {
                setRankingData(rankingRes.data);
                setMySummary(summaryRes.data);
                setIncentives(incentiveRes.data);
                setSiteConfigData(configRes.data);
                const configObject = configRes.data.reduce((acc, item) => {
                    acc[item.key] = item.value;
                    return acc;
                }, {});
                setSiteConfig(configObject);
                const currentAnnouncement = configObject.announcement || '';
                setEditableAnnouncement(currentAnnouncement);
            })).catch(error => console.error("대시보드 데이터 로딩 중 오류 발생!", error));
    }, [recordType, authHeaders]);

    useEffect(() => { fetchClients(1); }, [fetchClients]);
    useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleSearch = () => { setCurrentPage(1); fetchClients(1); };

    const handleExcelDownload = () => {
        // API_BASE_URL 사용
        const url = `${API_BASE_URL}/download-clients/?start_date=${startDate}&end_date=${endDate}&search=${searchTerm}`;
        axios.get(url, { ...authHeaders(), responseType: 'blob' })
            .then(response => {
                const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.setAttribute('download', `clients_${startDate}_to_${endDate}.xlsx`);
                document.body.appendChild(link);
                link.click();
                link.remove();
            })
            .catch(error => console.error('엑셀 다운로드 오류', error));
    };

    const handlePageChange = (page) => { setCurrentPage(page); fetchClients(page); };

    const handleDelete = (id) => {
        // alert() 대신 사용자에게 메시지를 보여주는 UI 컴포넌트를 사용하는 것이 좋습니다.
        if (window.confirm('정말로 이 고객 정보를 삭제하시겠습니까?')) {
            // API_BASE_URL 사용
            axios.delete(`${API_BASE_URL}/clientdata/${id}/`, authHeaders())
                .then(() => { alert('데이터가 삭제되었습니다.'); fetchClients(currentPage); })
                .catch(error => { console.error('데이터 삭제 중 오류 발생!', error); });
        }
    };

    const handleRowDoubleClick = (client) => {
        setSelectedClient(client);
        setIsModalOpen(true);
    };

    const handleEdit = (client) => {
        setSelectedClient(client);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedClient(null);
    };

    const handleAnnouncementSave = () => {
        const announcementConfig = siteConfigData.find(c => c.key === 'announcement');
        if (announcementConfig) {
            // API_BASE_URL 사용
            axios.patch(`${API_BASE_URL}/site-configurations/announcement/`, { value: editableAnnouncement }, authHeaders())
            .then(() => {
                alert('공지사항이 저장되었습니다.');
                setIsEditingAnnouncement(false);
                fetchDashboardData();
            })
            .catch(error => { console.error('공지사항 저장 오류', error); alert('저장에 실패했습니다.'); });
        } else {
            // API_BASE_URL 사용
            axios.post(`${API_BASE_URL}/site-configurations/`, { key: 'announcement', value: editableAnnouncement }, authHeaders())
            .then(() => {
                alert('공지사항이 새로 등록되었습니다.');
                setIsEditingAnnouncement(false);
                fetchDashboardData();
            })
            .catch(error => { console.error('공지사항 등록 오류', error); alert('등록에 실패했습니다.'); });
        }
    };

    return (
        <>
            <header className="app-main-header">
                <div className="header-left">
                    <span className="welcome-message">{username}님 (관리자)</span>
                </div>
                <div className="header-right">
                    <button onClick={onLogout} className="logout-button">로그아웃</button>
                </div>
            </header>

            <main className="app-main-content">
                <div className="announcement-bar">
                    {isEditingAnnouncement ? (
                        <div className="announcement-edit-mode">
                            <textarea value={editableAnnouncement} onChange={(e) => setEditableAnnouncement(e.target.value)} rows="3" />
                            <div className="announcement-actions">
                                <button onClick={handleAnnouncementSave} className="btn-save">저장</button>
                                <button onClick={() => setIsEditingAnnouncement(false)} className="btn-cancel">취소</button>
                            </div>
                        </div>
                    ) : (
                        <div className="announcement-view-mode">
                            <span>� {siteConfig.announcement || '등록된 공지사항이 없습니다.'}</span>
                            <button onClick={() => setIsEditingAnnouncement(true)} className="btn-edit-announcement">수정</button>
                        </div>
                    )}
                </div>
                
                <div className="dashboard-grid">
                    <div className="dashboard-widget">
                        <h3 className="widget-title">나의 월간 실적</h3>
                        <MySummaryPanel summaryData={mySummary} />
                    </div>
                    <div className="dashboard-widget ranking-widget">
                        <div className="widget-header">
                            <h3 className="widget-title">월간 계약 건수 TOP 3</h3>
                            <button className="details-button" onClick={() => setIsSidebarOpen(true)}>&laquo; 자세히</button>
                        </div>
                        <RankingBanner rankingData={rankingData} />
                    </div>
                </div>

                <div className="list-section-header">
                    <h1>고객 데이터 시스템</h1>
                </div>
                
                <div className="search-toolbar">
                    <div className="date-filter">
                        <span>기간:</span>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        <span>~</span>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                    <input type="text" placeholder="고객명, 연락처 등으로 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
                    <button onClick={handleSearch} className="btn-search">검색</button>
                </div>
                
                <div className="toolbar">
                    <div className="toolbar-left">
                        <Link to="/admin/register-client" className="btn-primary">신규 등록</Link>
                        <Link to="/admin/distribution" className="btn-primary">상담사 배분</Link>
                        <button onClick={handleExcelDownload} className="btn-excel">엑셀 다운로드</button>
                    </div>
                    <div className="toolbar-right">
                        <Link to="/admin/status" className="btn-secondary">실적 현황판</Link>
                        <Link to="/attendance" className="btn-secondary">출근부 관리</Link>
                        <Link to="/admin/user-management" className="btn-secondary">직원 관리</Link>
                    </div>
                </div>

                <ClientList
                    clients={clients}
                    handleDelete={handleDelete}
                    handleEdit={handleEdit}
                    onRowDoubleClick={handleRowDoubleClick}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                />
                
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </main>

            <ClientDetailModal
                client={selectedClient}
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                onUpdate={() => {
                    fetchClients(currentPage);
                    fetchDashboardData();
                }}
                token={token}
            />
            <RankingSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                rankingData={rankingData}
                incentiveData={incentives}
                siteConfigData={siteConfigData}
                fightingMessage={siteConfig.fighting_message || 'FIGHTING!!!!'}
                isAdmin={true}
                token={token}
                onUpdate={fetchDashboardData}
            />
        </>
    );
}

export default AdminPage;