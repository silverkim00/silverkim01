import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';

Modal.setAppElement('#root');

// API 기본 URL을 환경 변수에서 가져옵니다.
// 이 값은 .env 파일 (개발) 또는 .env.production 파일 (배포)에 정의되어야 합니다.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const koreanProvinces = [
  "서울특별시", "부산광역시", "대구광역시", "인천광역시", "광주광역시", "대전광역시", "울산광역시", "세종특별자치시",
  "경기도", "강원도", "충청북도", "충청남도", "전라북도", "전라남도", "경상북도", "경상남도", "제주특별자치도"
];

const statusMap = {
  PENDING: '작업전',
  ABSENT: '부재',
  FAIL: '실패',
  SUCCESS_1: '1차성공',
  SUCCESS_2: '2차성공',
  PROMISING: '가망',
};

function ClientDetailModal({ client, isOpen, onRequestClose, onUpdate, token }) {
  const [editableData, setEditableData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFile2, setSelectedFile2] = useState(null); // 녹취 파일 2를 위한 state

  useEffect(() => {
    if (client) {
      setEditableData({
        sido: client.sido || '',
        gugun: client.gugun || '',
        detailed_address: client.detailed_address || '',
        birth_date: client.birth_date || '',
        gender: client.gender || '',
        policy_count: client.policy_count || '',
        premium_range: client.premium_range || '',
        status: client.status || 'PENDING',
        employee_note: client.employee_note || '',
      });
      setSelectedFile(null);
      setSelectedFile2(null); // 파일 2 상태도 초기화
    }
  }, [client]);

  if (!client) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'birth_date') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setEditableData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setEditableData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileChange2 = (e) => {
    setSelectedFile2(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submissionData = new FormData();
    Object.keys(editableData).forEach(key => {
      submissionData.append(key, editableData[key]);
    });
    if (selectedFile) {
      submissionData.append('audio_file', selectedFile);
    }
    if (selectedFile2) {
      submissionData.append('audio_file_2', selectedFile2);
    }

    const authHeaders = {
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'multipart/form-data',
      }
    };

    // API_BASE_URL 사용
    axios.patch(`${API_BASE_URL}/clientdata/${client.id}/`, submissionData, authHeaders)
      .then(() => {
        alert('고객 정보가 업데이트되었습니다.');
        onUpdate();
        onRequestClose();
      })
      .catch(error => {
        console.error('업데이트 중 오류 발생!', error.response?.data);
        alert('업데이트에 실패했습니다.');
      });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customModalStyles}
      contentLabel="고객 상세 정보"
    >
      <div className="modal-header">
        <h2>상세내용</h2>
        <button onClick={onRequestClose} className="close-button">&times;</button>
      </div>
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="modal-grid">
          {/* --- 읽기 전용 필드 --- */}
          <div className="grid-item-label">전화번호</div>
          <div className="grid-item-input readonly">{client.contact}</div>

          <div className="grid-item-label">지역</div>
          <div className="grid-item-input readonly">{client.address}</div>

          <div className="grid-item-label">고객명</div>
          <div className="grid-item-input readonly">{client.name}</div>
          
          {/* --- 수정 가능 필드 --- */}
          <div className="grid-item-label">시도</div>
          <div className="grid-item-input">
            <select name="sido" value={editableData.sido} onChange={handleChange}>
              <option value="">선택</option>
              {koreanProvinces.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </div>

          <div className="grid-item-label">구군</div>
          <div className="grid-item-input">
            <input type="text" name="gugun" value={editableData.gugun} onChange={handleChange} />
          </div>
          
          <div className="grid-item-label">상세주소</div>
          <div className="grid-item-input">
            <input type="text" name="detailed_address" value={editableData.detailed_address} onChange={handleChange} />
          </div>

          <div className="grid-item-label">생년월일</div>
          <div className="grid-item-input">
            <input type="text" name="birth_date" value={editableData.birth_date} onChange={handleChange} maxLength="8" placeholder="YYYYMMDD" />
          </div>

          <div className="grid-item-label">성별</div>
          <div className="grid-item-input radio-group">
            <label><input type="radio" name="gender" value="M" checked={editableData.gender === 'M'} onChange={handleChange} /> 남</label>
            <label><input type="radio" name="gender" value="F" checked={editableData.gender === 'F'} onChange={handleChange} /> 여</label>
          </div>

          <div className="grid-item-label">가입개수</div>
          <div className="grid-item-input">
            <select name="policy_count" value={editableData.policy_count} onChange={handleChange}>
              <option value="">선택</option>
              <option value="1-2">1~2건</option>
              <option value="3-4">3~4건</option>
              <option value="5-6">5~6건</option>
              <option value="7-8">7~8건</option>
              <option value="9-10">9~10건</option>
              <option value="10+">10건 이상</option>
            </select>
          </div>

          <div className="grid-item-label">총금액대</div>
          <div className="grid-item-input">
            <select name="premium_range" value={editableData.premium_range} onChange={handleChange}>
                <option value="">선택</option>
                <option value="UNKNOWN">모름</option>
                <option value="5-10">5만~10만</option>
                <option value="10-20">10만~20만</option>
                <option value="20-30">20만~30만</option>
                <option value="30-50">30만~50만</option>
                <option value="50-100">50만~100만</option>
                <option value="100+">100만 이상</option>
            </select>
          </div>

          <div className="grid-item-label">메모(시간, 장소)</div>
          <div className="grid-item-input">
            <textarea name="employee_note" value={editableData.employee_note} onChange={handleChange} rows="3" />
          </div>

          <div className="grid-item-label">특이사항</div>
          <div className="grid-item-input">
            <textarea value={client.note || ''} readOnly className="readonly-textarea" rows="3" />
          </div>

          <div className="grid-item-label full-width">현황</div>
          <div className="grid-item-input full-width radio-group">
            {Object.entries(statusMap).map(([value, label]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="status"
                  value={value}
                  checked={editableData.status === value}
                  onChange={handleChange}
                />
                {label}
              </label>
            ))}
          </div>

          <div className="grid-item-label full-width">녹취 파일 1</div>
          <div className="grid-item-input full-width">
            <input type="file" accept="audio/*" onChange={handleFileChange} />
            {client.audio_file && !selectedFile && (
              <div className="audio-player-wrapper">
                <p>현재 파일:</p>
                <audio controls src={client.audio_file}></audio>
              </div>
            )}
          </div>
          
          <div className="grid-item-label full-width">녹취 파일 2</div>
          <div className="grid-item-input full-width">
            <input type="file" accept="audio/*" onChange={handleFileChange2} />
            {client.audio_file_2 && !selectedFile2 && (
              <div className="audio-player-wrapper">
                <p>현재 파일:</p>
                <audio controls src={client.audio_file_2}></audio>
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button type="submit" className="save-button">저장</button>
          <button type="button" onClick={onRequestClose}>닫기</button>
        </div>
      </form>
    </Modal>
  );
}

const customModalStyles = {
    content: {
      top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%',
      transform: 'translate(-50%, -50%)', width: '80%', maxWidth: '1000px',
      padding: '0', border: 'none', borderRadius: '8px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)', background: '#fff',
      maxHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
    }
};

export default ClientDetailModal;
