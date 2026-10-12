import { useTranslation } from 'react-i18next'
import Badge from '../ui/Badge'
import { STATUS_TONES } from '../../utils/resourceMeta'

const STATUS_KEYS = {
  published: 'common.published',
  draft: 'common.draft',
  archived: 'common.archived',
  pending_review: 'common.pendingReview',
  rejected: 'common.rejected',
}

export default function ResourceStatusBadge({ status }) {
  const { t } = useTranslation()
  return <Badge tone={STATUS_TONES[status] || 'slate'}>{t(STATUS_KEYS[status] || status)}</Badge>
}
