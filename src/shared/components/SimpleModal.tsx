import type { ReactNode } from 'react';
import { X } from 'lucide-react';
type Props = {
    title: string;
    children: ReactNode;
    onClose: () => void;
    onSave: () => void;
};
export default function SimpleModal({ title, children, onClose, onSave }: Props) {
    return <div className="modal-backdrop"><div className="modal"><div className="modal-head"><h2>{title}</h2><button className="icon-btn" onClick={onClose} aria-label="Close dialog"><X /></button></div><div className="form-grid">{children}</div><div className="modal-actions"><button className="btn light" onClick={onClose}>Cancel</button><button className="btn primary" onClick={onSave}>Save</button></div></div></div>;
}

