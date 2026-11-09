import type { ChangeEvent } from 'react';
type Props = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
};
export default function Field({ label, value, onChange, type = 'text' }: Props) {
    return <label className="form-field">{label}<input type={type} value={value} onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}/></label>;
}

