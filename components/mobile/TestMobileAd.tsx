'use client'

import React from 'react'

interface TestMobileAdProps {
  className?: string
}

const TestMobileAd: React.FC<TestMobileAdProps> = ({ className = '' }) => {
  return (
    <div className={`p-4 border rounded ${className}`}>
      <h3>Test Mobile Ad Component</h3>
      <p>This is a test component to verify import/export functionality.</p>
    </div>
  )
}

export { TestMobileAd }
export default TestMobileAd