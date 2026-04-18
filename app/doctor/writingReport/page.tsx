export const dynamic = 'force-dynamic'

import WritingReport from '@/components/WritingReport'
import { Suspense } from 'react'

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WritingReport />
    </Suspense>
  )
}

export default page

