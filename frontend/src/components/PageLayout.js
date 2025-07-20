import React from 'react';
import { Link } from 'react-router-dom';

function PageLayout({ title, backTo, children }) {
    return (
        <div className="app-main-content">
            <div className="list-section-header">
                <h1>{title}</h1>
                <Link to={backTo || "/admin"} className="btn-secondary">
                    돌아가기
                </Link>
            </div>
            <div className="page-container">
                {children}
            </div>
        </div>
    );
}

export default PageLayout;