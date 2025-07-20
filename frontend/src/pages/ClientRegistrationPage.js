import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageLayout from '../components/PageLayout'; // PageLayout import

// API 기본 URL을 환경 변수에서 가져옵니다.
// 이 값은 .env 파일 (개발) 또는 .env.production 파일 (배포)에 정의되어야 합니다.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function ClientRegistrationPage({ token }) {
    const [excelFile, setExcelFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const navigate = useNavigate();

    const authHeaders = useCallback(() => ({
        headers: { Authorization: `Token ${token}` }
    }), [token]);

    const handleFileChange = (e) => {
        setExcelFile(e.target.files[0]);
    };

    const handleExcelUpload = async () => {
        if (!excelFile) {
            alert('업로드할 엑셀 파일을 선택해주세요.');
            return;
        }
        const formData = new FormData();
        formData.append('excel_file', excelFile);
        
        setIsUploading(true);
        try {
            // API_BASE_URL 사용
            const response = await axios.post(`${API_BASE_URL}/upload-clients/`, formData, {
                headers: { ...authHeaders().headers, 'Content-Type': 'multipart/form-data' },
            });
            alert(response.data.message || '엑셀 파일이 성공적으로 업로드되었습니다.');
            navigate('/admin');
        } catch (error) {
            console.error('엑셀 업로드 실패:', error.response?.data);
            alert(`업로드 실패: ${error.response?.data?.error || '알 수 없는 오류'}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <PageLayout title="신규 고객 등록">
            {/* --- 여기가 핵심 수정 부분 --- */}
            {/* 엑셀 등록 전용 컨테이너를 사용합니다. */}
            <div className="excel-registration-container">
                <h2 className="form-title">엑셀 일괄 등록</h2>
                <p className="form-description">
                    정해진 양식의 엑셀 파일을 사용하여 여러 고객 정보를 한 번에 등록할 수 있습니다.
                </p>
                <div className="excel-upload-form">
                    <input 
                        type="file" 
                        id="excel-file-input"
                        accept=".xlsx, .xls" 
                        onChange={handleFileChange} 
                        className="form-input-file" 
                    />
                    {/* label을 사용해 디자인을 개선합니다. */}
                    <label htmlFor="excel-file-input" className="btn-file-select">
                        {excelFile ? excelFile.name : '파일 선택'}
                    </label>
                    <button onClick={handleExcelUpload} disabled={isUploading} className="btn-excel-upload">
                        {isUploading ? '업로드 중...' : '업로드'}
                    </button>
                </div>
                <p className="excel-info">※ 엑셀 파일 형식: A열=이름, B열=연락처, C열=주소, D열=특이사항</p>
            </div>
        </PageLayout>
    );
}

export default ClientRegistrationPage;
