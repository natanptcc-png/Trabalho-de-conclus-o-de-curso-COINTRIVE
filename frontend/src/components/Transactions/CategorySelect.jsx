import { useState, useRef, useEffect } from "react";

export default function CategorySelect({ options = [], value, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef();

    useEffect(() => {
        function onDoc(e) {
            if (!ref.current) return;
            if (!ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener('click', onDoc);
        return () => document.removeEventListener('click', onDoc);
    }, []);

    return (
        <div className={`category-select ${open ? 'open' : ''}`} ref={ref}>
            <button type="button" className="category-select-button" onClick={() => setOpen(v => !v)}>
                {value}
                <span className="caret">▾</span>
            </button>

            <div className="category-select-menu" role="listbox">
                {options.map((opt) => (
                    <div
                        key={opt}
                        role="option"
                        className={`category-select-item ${opt === value ? 'selected' : ''}`}
                        onClick={() => { onChange(opt); setOpen(false); }}
                    >
                        {opt}
                    </div>
                ))}
            </div>
        </div>
    );
}
