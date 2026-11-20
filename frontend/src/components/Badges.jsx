import { PRIORITY_STYLES, STATUS_STYLES, label } from '../utils/format';

const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium';
export const PriorityBadge = ({ value }) => <span className={`${base} ${PRIORITY_STYLES[value]}`}>{label(value)}</span>;
export const StatusBadge = ({ value }) => <span className={`${base} ${STATUS_STYLES[value]}`}>{label(value)}</span>;
