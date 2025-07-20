import React from 'react';
import Slider from 'react-slick';
import PageLayout from '../components/PageLayout'; // 1. PageLayout 임포트

// 슬라이드 라이브러리의 CSS
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function PerformanceDashboard({ performanceData }) {
  // 슬라이드 설정
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  return (
    // 2. 기존 div 대신 PageLayout을 사용하고, title prop 전달
    <PageLayout title="직원 실적 현황">
      {/* 3. 불필요해진 <h2> 태그는 삭제 */}
      {performanceData && performanceData.length > 0 ? (
        <Slider {...settings}>
          {performanceData.map(record => (
            <div key={record.id} className="performance-card-wrapper">
              <div className="performance-card">
                <h3>{record.employee_username}</h3>
                <p className="record-type">{record.record_type}</p>
                <p className="record-value">{record.value}</p>
                <p className="record-date">{record.date}</p>
              </div>
            </div>
          ))}
        </Slider>
      ) : (
        <p>표시할 실적 데이터가 없습니다.</p>
      )}
    </PageLayout>
  );
}

export default PerformanceDashboard;