import StatusIndicator from '@cloudscape-design/components/status-indicator';
import { eventStatusConfig } from '@/utils/status-config';

export default function StatusBadge({ status, config = eventStatusConfig }) {
    const cfg = config[status] || { label: status, type: 'stopped' };
    return <StatusIndicator type={cfg.type}>{cfg.label}</StatusIndicator>;
}
