import "./Skeleton.css";

export default function Skeleton({ type = "page" }) {
    return (
        <div className="skeleton-root">
            <div className="skeleton-header">
                <div className="skeleton-avatar" />
                <div className="skeleton-title" />
                <div className="skeleton-bell" />
            </div>

            <div className="skeleton-carousel">
                <div className="skeleton-card" />
                <div className="skeleton-card" />
                <div className="skeleton-card" />
            </div>

            <div className="skeleton-grid">
                <div className="skeleton-box" />
                <div className="skeleton-box" />
                <div className="skeleton-box" />
                <div className="skeleton-box pie" />
            </div>
        </div>
    );
}
