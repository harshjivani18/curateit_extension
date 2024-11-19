import React from 'react'
import SimilarCompany from './SimilarCompany'
import { RiStackLine } from 'react-icons/ri'

const SimilarCompanies = ({ simpilar_companies, openUrl }) => {
  return (
    <div className="text-sm">
      <div className="grid grid-cols-2 gap-4">
        {simpilar_companies.map((company) => (
          <SimilarCompany company={company} openUrl={openUrl} />
        ))}
      </div>
    </div>
  )
}

export default SimilarCompanies