import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// 재사용 가능한 PageLayout 컴포넌트를 import 합니다.
import PageLayout from '../components/PageLayout';

// API 기본 URL을 환경 변수에서 가져옵니다.
// 이 값은 .env 파일 (개발) 또는 .env.production 파일 (배포)에 정의되어야 합니다.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// 위젯 카드 컴포넌트 (가독성을 위해 분리)
const StatCard = ({ title, value, description }) => (
    <div className="dashboard-widget">
        <h3 className="widget-title">{title}</h3>
        <p className="stat-value">{value}</p>
        <p className="stat-description">{description}</p>
    </div>
);

function StatusPage({ token }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                // API_BASE_URL 사용
                const response = await axios.get(`${API_BASE_URL}/statistics/`, {
                    headers: { Authorization: `Token ${token}` }
                });
                setStats(response.data);
            } catch (err) {
                setError('데이터를 불러오는 중 오류가 발생했습니다.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStatistics();
    }, [token]);

    // 로딩 및 오류 상태에 따라서도 PageLayout을 사용해 일관된 UI를 보여줍니다.
    if (loading) {
        return <PageLayout title="실적 현황판"><div className="loading-text">로딩 중...</div></PageLayout>;
    }

    if (error) {
        return <PageLayout title="실적 현황판"><div className="error-text">{error}</div></PageLayout>;
    }

    return (
        // PageLayout으로 전체 페이지를 감싸줍니다.
        <PageLayout title="실적 현황판">
            {stats && (
                <div className="dashboard-grid">
                    <StatCard title="총 고객 수" value={stats.summary.total_clients.toLocaleString()} description="현재까지 등록된 모든 고객" />
                    <StatCard title="총 계약 수" value={stats.summary.total_contracts.toLocaleString()} description="누적 계약 완료 건수" />
                    <StatCard title="미배분 고객" value={stats.summary.unassigned_clients.toLocaleString()} description="담당자가 지정되지 않은 고객" />

                    <div className="dashboard-widget full-width">
                        <h3 className="widget-title">최근 6개월 계약 추이</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={stats.monthly_contract_trend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                                <XAxis dataKey="month" stroke="#868E96" />
                                <YAxis stroke="#868E96" />
                                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0' }} />
                                <Legend />
                                <Line type="monotone" dataKey="contracts" name="계약 건수" stroke="#FFAB91" strokeWidth={2} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="dashboard-widget full-width">
                        <h3 className="widget-title">지역별 고객 분포 (TOP 5)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.region_top5} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                                <XAxis dataKey="address" stroke="#868E96" />
                                <YAxis stroke="#868E96" />
                                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0' }} />
                                <Bar dataKey="count" name="고객 수" fill="#B3E5FC" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </PageLayout>
    );
}

export default StatusPage;