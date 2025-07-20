import React from 'react';

const statusMap = {
  total: '월접수',
  PENDING: '작업전',
  ABSENT: '부재',
  FAIL: '실패',
  PROMISING: '가망',
  SUCCESS_1: '1차',
  SUCCESS_2: '2차',
  success_rate: '성공률',
};

function MySummaryPanel({ summaryData }) {
  if (!summaryData) {
    return <div className="my-summary-panel loading">로딩 중...</div>;
  }

  return (
    <div className="my-summary-panel">
      <table>
        <thead>
          <tr>
            {Object.values(statusMap).map(label => <th key={label}>{label}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr>
            {Object.keys(statusMap).map(key => (
              <td key={key}>
                {key === 'success_rate' 
                  ? `${summaryData[key]?.toFixed(1) || 0}%` 
                  : summaryData[key] || 0}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default MySummaryPanel;