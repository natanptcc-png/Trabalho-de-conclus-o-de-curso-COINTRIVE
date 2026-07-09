import { useEffect, useState, useRef } from "react";

export default function PageTransition({ show, children, className = "" }) {

    const [visible, setVisible] = useState(show);
    const [closing, setClosing] = useState(false);
    const tRef = useRef();

    useEffect(() => {
        if (show) {
            clearTimeout(tRef.current);
            setVisible(true);
            setClosing(false);
        } else if (visible) {
            setClosing(true);
            tRef.current = setTimeout(() => {
                setVisible(false);
                setClosing(false);
            }, 300);
        }
        return () => clearTimeout(tRef.current);
    }, [show]);

    if (!visible) return null;

    const cls = `page-transition ${closing ? 'exit' : 'enter'} ${className}`;

    return (
        <div className={cls}>
            {children}
        </div>
    );
}
