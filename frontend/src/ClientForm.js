import React, { useState, useEffect } from 'react';
import axios from 'axios';

// API 기본 URL을 환경 변수에서 가져옵니다.
// 이 값은 .env 파일 (개발) 또는 .env.production 파일 (배포)에 정의되어야 합니다.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function ClientForm({ currentClient, onSave, token, staffList }) {
  // 폼 데이터를 관리하는 state
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: '',
    birth_date: '',
    gender: 'M',
    note: '',
    owner: null, // 담당자 ID. null일 경우 '미지정'
  });

  // `currentClient` prop이 변경될 때마다 (수정 모드 진입 시) 폼 데이터를 채웁니다.
  useEffect(() => {
    if (currentClient) {
      // 수정 모드: 기존 고객 데이터로 폼을 채웁니다.
      setFormData({
        name: currentClient.name || '',
        contact: currentClient.contact || '',
        address: currentClient.address || '',
        // 날짜 필드가 null일 경우 빈 문자열로 처리하여 오류를 방지합니다.
        birth_date: currentClient.birth_date || '',
        gender: currentClient.gender || 'M',
        note: currentClient.note || '',
        // owner 객체가 있을 경우 id를, 없으면 null을 사용합니다.
        owner: currentClient.owner ? currentClient.owner.id : null, 
      });
    } else {
      // 신규 등록 모드: 폼을 깨끗하게 비웁니다.
      setFormData({
        name: '', contact: '', address: '', birth_date: '', gender: 'M', note: '', owner: null,
      });
    }
  }, [currentClient]);

  // 폼 입력값이 변경될 때마다 formData state를 업데이트합니다.
  const handleChange = (e) => {
    const { name, value } = e.target;
    // 담당자(owner)를 선택할 때, 값이 비어있으면 null로, 아니면 숫자로 저장합니다.
    const finalValue = name === 'owner' ? (value ? parseInt(value, 10) : null) : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  // '저장' 또는 '수정' 버튼 클릭 시 실행됩니다.
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // API_BASE_URL을 사용하여 엔드포인트 정의
    const apiEndpoint = `${API_BASE_URL}/clientdata/`;
    const headers = { Authorization: `Token ${token}` };

    // currentClient prop의 존재 여부로 신규 등록(POST)과 수정(PUT)을 구분합니다.
    const request = currentClient
      ? axios.put(`${apiEndpoint}${currentClient.id}/`, formData, { headers })
      : axios.post(apiEndpoint, formData, { headers });

    request
      .then(() => {
        alert(currentClient ? '고객 정보가 수정되었습니다.' : '신규 고객이 등록되었습니다.');
        if (onSave) {
          onSave(); // 부모 컴포넌트에서 전달받은 onSave 함수를 실행 (페이지 이동 등)
        }
      })
      .catch(error => {
        console.error('고객 정보 저장 실패:', error.response?.data);
        alert(`저장 실패: ${JSON.stringify(error.response?.data)}`);
      });
  };

  return (
    <div className="client-form-container">
      {/* 제목을 모드에 따라 동적으로 변경합니다. */}
      <h3>{currentClient ? '고객 정보 수정' : '신규 고객 정보 입력'}</h3>
      <form onSubmit={handleSubmit} className="client-form">
        <input name="name" value={formData.name} onChange={handleChange} placeholder="이름" required />
        <input name="contact" value={formData.contact} onChange={handleChange} placeholder="연락처" required />
        <input name="address" value={formData.address} onChange={handleChange} placeholder="주소" />
        <input name="birth_date" type="date" value={formData.birth_date} onChange={handleChange} />
        <select name="gender" value={formData.gender} onChange={handleChange}>
          <option value="M">남성</option>
          <option value="F">여성</option>
        </select>
        <select name="owner" value={formData.owner || ''} onChange={handleChange}>
          <option value="">담당자 미지정</option>
          {staffList && staffList.map(staff => (
            <option key={staff.id} value={staff.id}>
              {staff.first_name} ({staff.username})
            </option>
          ))}
        </select>
        <textarea name="note" value={formData.note} onChange={handleChange} placeholder="관리자 메모 (특이사항)"></textarea>
        <button type="submit" className="btn-primary">
          {currentClient ? '수정 완료' : '등록하기'}
        </button>
      </form>
    </div>
  );
}

export default ClientForm;
