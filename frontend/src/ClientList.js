import React from 'react';

// 정렬 가능한 테이블 헤더를 위한 별도 컴포넌트
const SortableHeader = ({ children, onSort, sortKey, sortConfig }) => {
    // [수정] sortConfig가 undefined일 때 오류가 나지 않도록 기본값으로 빈 객체({})를 할당합니다.
    const safeSortConfig = sortConfig || {};
    const isSorted = safeSortConfig.key === sortKey;
    const directionIcon = safeSortConfig.direction === 'ascending' ? '▲' : '▼';

    return (
        <th className="sortable-header" onClick={() => onSort(sortKey)}>
            {children}
            <span className="sort-icon">{isSorted ? directionIcon : ''}</span>
        </th>
    );
};

// 메인 ClientList 컴포넌트
function ClientList({ clients, handleDelete, handleEdit, onRowDoubleClick, sortConfig, onSort }) {
    const statusDisplayMap = {
        PENDING: '작업전',
        ABSENT: '부재',
        FAIL: '실패',
        SUCCESS_1: '1차성공',
        SUCCESS_2: '2차성공',
        PROMISING: '가망',
    };

    return (
        <div className="client-list-container">
            <table className="client-table">
                <thead>
                    <tr>
                        <th><input type="checkbox" /></th>
                        <SortableHeader sortKey="created_at" sortConfig={sortConfig} onSort={onSort}>데이터</SortableHeader>
                        <SortableHeader sortKey="is_distributed" sortConfig={sortConfig} onSort={onSort}>배분</SortableHeader>
                        {/* [수정] Django의 related object 필드명에 맞춰 'owner__first_name'으로 정렬 키를 사용합니다. */}
                        <SortableHeader sortKey="owner__first_name" sortConfig={sortConfig} onSort={onSort}>상담사</SortableHeader>
                        <SortableHeader sortKey="distribution_date" sortConfig={sortConfig} onSort={onSort}>배분날짜</SortableHeader>
                        <SortableHeader sortKey="contact" sortConfig={sortConfig} onSort={onSort}>전화번호</SortableHeader>
                        <SortableHeader sortKey="address" sortConfig={sortConfig} onSort={onSort}>지역</SortableHeader>
                        <SortableHeader sortKey="name" sortConfig={sortConfig} onSort={onSort}>고객명</SortableHeader>
                        <SortableHeader sortKey="gender" sortConfig={sortConfig} onSort={onSort}>성별</SortableHeader>
                        <th>메모</th>
                        <SortableHeader sortKey="status" sortConfig={sortConfig} onSort={onSort}>현황</SortableHeader>
                        <th>첨부1</th>
                        <th>첨부2</th>
                        <th>정보파일</th>
                        <SortableHeader sortKey="transmission_status" sortConfig={sortConfig} onSort={onSort}>전송여부</SortableHeader>
                        <th>작업</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(clients) && clients.length > 0 ? (
                        clients.map(client => (
                            <tr key={client.id} onDoubleClick={() => onRowDoubleClick(client)}>
                                <td><input type="checkbox" /></td>
                                {/* [수정] 날짜 데이터가 없을 경우를 대비해 기본값을 설정합니다. */}
                                <td>{client.created_at ? new Date(client.created_at).toLocaleDateString() : '-'}</td>
                                <td>{client.is_distributed ? 'Y' : 'N'}</td>
                                {/* [수정] 백엔드에서 owner 객체로 데이터를 보낼 가능성이 높으므로, client.owner.first_name으로 접근합니다. */}
                                <td>{client.owner ? client.owner.first_name : '미배정'}</td>
                                <td>{client.distribution_date || '-'}</td>
                                <td>{client.contact}</td>
                                <td>{client.address}</td>
                                <td>{client.name}</td>
                                <td>{client.gender_display}</td>
                                <td className="memo-cell">{client.note}</td>
                                <td>{statusDisplayMap[client.status] || client.status}</td>
                                <td>{client.audio_file ? 'Y' : 'N'}</td>
                                <td>{client.audio_file_2 ? 'Y' : 'N'}</td>
                                <td>{client.info_file ? 'Y' : 'N'}</td>
                                <td>{client.transmission_status === 'Y' ? '전송' : '미전송'}</td>
                                <td className="action-buttons">
                                    <button onClick={() => handleEdit(client)} className="edit-button">수정</button>
                                    <button onClick={() => handleDelete(client.id)} className="delete-button">삭제</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="16">표시할 데이터가 없습니다.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default ClientList;