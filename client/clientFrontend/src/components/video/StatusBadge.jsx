import clsx from 'clsx';
import { CheckCircle, Clock, AlertCircle, Upload } from 'lucide-react';

const statusConfig = {
  uploaded:   { label: 'Uploaded',   color: 'bg-blue-500/20 text-blue-400',   icon: Upload },
  processing: { label: 'Processing', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  completed:  { label: 'Completed',  color: 'bg-green-500/20 text-green-400',  icon: CheckCircle },
  failed:     { label: 'Failed',     color: 'bg-red-500/20 text-red-400',      icon: AlertCircle },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.uploaded;
  const Icon = config.icon;

  return (
    <span className={clsx('badge gap-1.5', config.color)}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}