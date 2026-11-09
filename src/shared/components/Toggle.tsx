type Props = {
    label: string;
    checked: boolean;
    onChange: (value: boolean) => void;
};
export default function Toggle({ label, checked, onChange }: Props) {
    return <label className="toggle-row"><span>{label}</span><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)}/></label>;
}

