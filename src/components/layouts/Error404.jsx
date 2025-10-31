import { Link, useLocation } from 'react-router-dom';

export default function Error404() {
    const location = useLocation();

    return (
        <div className="card w-full h-full bg-base-100 card-md shadow-sm">
            <div className="card-body">
                <h2 className="card-title">Error! 404 Not Found!</h2>
                <p>페이지를 찾을 수 없습니다!</p>
                <p>요청링크: { location.pathname }</p>
                <div className="justify-end card-actions">
                    <div className="badge badge-outline"><Link to="/">홈으로</Link></div>
                </div>
            </div>
        </div>
    )
}