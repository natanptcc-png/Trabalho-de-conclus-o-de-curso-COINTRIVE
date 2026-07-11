import "./Skeleton.css";

function CardPlaceholder() {
    return (
        <div className="skeleton-card">
            <div className="s-card-title s-line" />
            <div className="s-card-sub s-line short" />
        </div>
    );
}

function BoxPlaceholder({ pie = false }) {
    return (
        <div className={"skeleton-box" + (pie ? " pie" : "")}>
            <div className="s-box-row">
                <div className="s-line" />
                <div className="s-line short" />
            </div>
            <div className="s-box-row small">
                <div className="s-line long" />
                <div className="s-line" />
            </div>
            <div className="s-box-row">
                <div className="s-line medium" />
            </div>
        </div>
    );
}

export default function Skeleton({ type = "page" }) {
    return (
        <div className="skeleton-root" aria-hidden>
            <div className="skeleton-header">
                <div className="skeleton-avatar" />
                <div className="skeleton-title-group">
                    <div className="s-line title" />
                    <div className="s-line subtitle short" />
                </div>
                <div className="skeleton-bell" />
            </div>

            <div className="skeleton-carousel">
                <CardPlaceholder />
                <CardPlaceholder />
                <CardPlaceholder />
            </div>

            <div className="skeleton-grid">
                <BoxPlaceholder />
                <BoxPlaceholder />
                <BoxPlaceholder />
                <BoxPlaceholder pie />
            </div>
        </div>
    );
}
