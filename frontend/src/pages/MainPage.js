import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ClientList from '../ClientList';
import RankingBanner from './RankingBanner';
import ClientDetailModal from '../ClientDetailModal';
import MySummaryPanel from '../components/MySummaryPanel';
import RankingSidebar from '../components/RankingSidebar';
import Pagination from '../components/Pagination'; // Pagination 컴포넌트 import
import { Link } from 'react-router-dom';

// API 기본 URL을 환경 변수에서 가져옵니다.
// 이 값은 .env 파일 (개발) 또는 .env.production 파일 (배포)에 정의되어야 합니다.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function MainPage({ token, username, onLogout }) {
  // --- 상태 관리 (State) ---
  const [clients, setClients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 상세 정보 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // 헤더 및 사이드바 관련 상태
  const [rankingData, setRankingData] = useState([]);
  const [mySummary, setMySummary] = useState(null);
  const [incentives, setIncentives] = useState([]);
  const [siteConfig, setSiteConfig] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const recordType = '월간 계약 건수';

  // --- API 요청 관련 ---
  const authHeaders = useCallback(() => ({
    headers: { Authorization: `Token ${token}` }
  }), [token]);

  // 고객 목록 로딩 함수
  const fetchClients = useCallback((page = 1) => {
    // API_BASE_URL 사용
    const url = `${API_BASE_URL}/clientdata/?page=${page}&search=${searchTerm}`;
    axios.get(url, authHeaders())
      .then(response => {
        setClients(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 20));
      })
      .catch(error => {
        console.error('고객 데이터를 가져오는 중 오류 발생!', error);
        setClients([]);
      });
  }, [searchTerm, authHeaders]);

  // 나머지 대시보드 데이터 로딩 함수
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
        const configData = configRes.data.reduce((acc, item) => {
          acc[item.key] = item.value;
          return acc;
        }, {});
        setSiteConfig(configData);
      })).catch(error => console.error("대시보드 데이터 로딩 중 오류 발생!", error));
  }, [recordType, authHeaders]);

  // 검색어가 변경될 때 데이터를 다시 불러옵니다.
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1);
      fetchClients(1);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchClients]);

  // 페이지가 처음 로드될 때 대시보드 데이터를 불러옵니다.
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchClients(page);
  };

  // --- 이벤트 핸들러 ---
  const handleDelete = (id) => {
    // alert() 대신 사용자에게 메시지를 보여주는 UI 컴포넌트를 사용하는 것이 좋습니다.
    if (window.confirm('정말로 이 고객 정보를 삭제하시겠습니까?')) {
      // API_BASE_URL 사용
      axios.delete(`${API_BASE_URL}/clientdata/${id}/`, authHeaders())
        .then(() => {
          alert('데이터가 삭제되었습니다.');
          fetchClients(currentPage);
        })
        .catch(error => { console.error('데이터 삭제 중 오류 발생!', error); });
    }
  };
  
  const handleRowDoubleClick = (client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  return (
    <>
      <header className="app-main-header">
        <div className="header-left">
          <span className="welcome-message">{username}님</span>
          <MySummaryPanel summaryData={mySummary} />
        </div>
        <div className="header-right">
          <RankingBanner rankingData={rankingData} recordType={recordType} />
          <button className="details-button" onClick={() => setIsSidebarOpen(true)}>
            &laquo; 자세히
          </button>
          <button onClick={onLogout} className="logout-button">로그아웃</button>
          <Link to="/attendance" className="btn-primary" style={{marginRight: '1rem'}}>출근/퇴근</Link>
                    <button onClick={onLogout} className="logout-button">로그아웃</button> {/* 중복된 로그아웃 버튼 제거 또는 의도 확인 필요 */}

        </div>
      </header>

      <main className="app-main-content">
        <div className="toolbar">
          <input
            type="text"
            placeholder="고객 이름으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <ClientList
          clients={clients}
          handleDelete={handleDelete}
          onRowDoubleClick={handleRowDoubleClick}
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
        onUpdate={() => fetchClients(currentPage)}
        token={token}
      />
      <RankingSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        rankingData={rankingData}
        incentiveData={incentives}
        fightingMessage={siteConfig.fighting_message || 'FIGHTING!!!!'}
      />
    </>
  );
}

export default MainPage;