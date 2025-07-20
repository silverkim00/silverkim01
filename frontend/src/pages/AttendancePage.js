import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import PageLayout from '../components/PageLayout'; // PageLayout import

// API 기본 URL을 환경 변수에서 가져옵니다.
// 이 값은 .env 파일 (개발) 또는 .env.production 파일 (배포)에 정의되어야 합니다.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// 날짜/시간 포맷팅 헬퍼 함수
const formatDateTime = (isoString, type = 'time') => {
    if (!isoString) return null;
    const date = new Date(isoString);
    if (type === 'date') {
        return date.toISOString().split('T')[0];
    }
    // 한국 시간(KST)에 맞춰 시간을 표시합니다.
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Seoul' });
};

function AttendancePage({ token, isAdmin }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [monthlyRecords, setMonthlyRecords] = useState([]);
    const [todaysRecord, setTodaysRecord] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const authHeaders = useCallback(() => ({
        headers: { Authorization: `Token ${token}` }
    }), [token]);

    const fetchTodaysRecord = useCallback(() => {
        // API_BASE_URL 사용
        return axios.get(`${API_BASE_URL}/attendance/today/`, authHeaders())
            .then(response => {
                setTodaysRecord(response.data && Object.keys(response.data).length > 0 ? response.data : null);
            })
            .catch(error => console.error("오늘의 출근 기록 로딩 오류", error));
    }, [authHeaders]);

    const fetchMonthlyRecords = useCallback((date) => {
        if (!isAdmin) return Promise.resolve();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        
        // API_BASE_URL 사용
        return axios.get(`${API_BASE_URL}/attendance/?month=${year}-${month}`, authHeaders())
            .then(response => {
                const records = Array.isArray(response.data) ? response.data : response.data.results;
                setMonthlyRecords(records || []);
            })
            .catch(error => {
                console.error("월별 출퇴근 기록 로딩 오류", error);
                setMonthlyRecords([]);
            });
    }, [isAdmin, authHeaders]);

    useEffect(() => {
        setIsLoading(true);
        const promises = [fetchTodaysRecord()];
        if (isAdmin) {
            promises.push(fetchMonthlyRecords(currentDate));
        }
        Promise.all(promises).finally(() => setIsLoading(false));
    }, [currentDate, fetchTodaysRecord, fetchMonthlyRecords, isAdmin]);

    const handleCheckIn = () => {
        // alert() 대신 사용자에게 메시지를 보여주는 UI 컴포넌트를 사용하는 것이 좋습니다.
        if (window.confirm('출근 처리 하시겠습니까?')) {
            // API_BASE_URL 사용
            axios.post(`${API_BASE_URL}/attendance/check-in/`, {}, authHeaders())
                .then(() => {
                    alert('출근 처리되었습니다.');
                    fetchTodaysRecord();
                })
                .catch(error => alert(`오류: ${error.response?.data?.error || '알 수 없는 오류'}`));
        }
    };

    const handleCheckOut = () => {
        // alert() 대신 사용자에게 메시지를 보여주는 UI 컴포넌트를 사용하는 것이 좋습니다.
        if (window.confirm('퇴근 처리 하시겠습니까?')) {
            // API_BASE_URL 사용
            axios.put(`${API_BASE_URL}/attendance/check-out/`, {}, authHeaders())
                .then(() => {
                    alert('퇴근 처리되었습니다. 고생하셨습니다!');
                    fetchTodaysRecord();
                })
                .catch(error => alert(`오류: ${error.response?.data?.error || '알 수 없는 오류'}`));
        }
    };

    const tileContent = ({ date, view }) => {
        if (view === 'month' && isAdmin) {
            const dateStr = formatDateTime(date, 'date');
            const recordsOnDate = monthlyRecords.filter(r => r.work_date === dateStr);
            if (recordsOnDate.length > 0) {
                return (
                    <div className="flex justify-center items-center mt-1">
                        <span className="text-xs">{recordsOnDate.length}명</span>
                    </div>
                );
            }
        }
        return null;
    };

    if (isLoading) {
        return <PageLayout title="출근부"><div>로딩 중...</div></PageLayout>;
    }

    return (
        <PageLayout title="출근부" backTo={isAdmin ? "/admin" : "/"}>
            <div className="dashboard-grid">
                <div className="dashboard-widget">
                    <h3 className="widget-title">오늘의 기록</h3>
                    <div className="attendance-today-status">
                        <p><strong>날짜:</strong> {formatDateTime(new Date(), 'date')}</p>
                        <p><strong>출근 시간:</strong> <span className="time-record">{formatDateTime(todaysRecord?.check_in_time) || '미기록'}</span></p>
                        <p><strong>퇴근 시간:</strong> <span className="time-record">{formatDateTime(todaysRecord?.check_out_time) || '미기록'}</span></p>
                    </div>
                    <div className="attendance-actions">
                        <button onClick={handleCheckIn} disabled={!!todaysRecord?.check_in_time} className="btn-primary">출근하기</button>
                        <button onClick={handleCheckOut} disabled={!todaysRecord?.check_in_time || !!todaysRecord?.check_out_time} className="btn-secondary">퇴근하기</button>
                    </div>
                </div>

                {isAdmin && (
                    <div className="dashboard-widget full-width">
                        <h3 className="widget-title">{currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월 출근 현황</h3>
                        <Calendar
                            onChange={setCurrentDate}
                            value={currentDate}
                            onActiveStartDateChange={({ activeStartDate }) => setCurrentDate(activeStartDate)}
                            tileContent={tileContent}
                            formatDay={(locale, date) => date.getDate()}
                            calendarType="gregory"
                        />
                    </div>
                )}
            </div>
        </PageLayout>
    );
}

export default AttendancePage;
