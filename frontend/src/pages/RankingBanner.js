import React from 'react';

// 순위별 메달 아이콘
const medals = ['🥇', '🥈', '🥉'];

function RankingBanner({ rankingData }) {
    // 데이터가 없거나 부족할 경우를 대비해 빈 슬롯을 채워줍니다.
    const displayData = [...(rankingData || [])];
    while (displayData.length < 3) {
        displayData.push({ rank: displayData.length + 1, employee_username: '-', total_value: '-' });
    }

    return (
        <div className="ranking-podium">
            {displayData.map((item, index) => (
                <div key={item.rank} className={`podium-step rank-${item.rank}`}>
                    <div className="podium-medal">{medals[index]}</div>
                    <div className="podium-name">{item.employee_username}</div>
                    <div className="podium-value">{item.total_value} 건</div>
                    <div className="podium-rank-number">{item.rank}</div>
                </div>
            ))}
        </div>
    );
}

export default RankingBanner;