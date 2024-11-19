import React from "react";
import { RiBuilding4Line } from "react-icons/ri";

const CompanyDetail = ({ payload }) => {
  return (
    <div className="text-sm">
      <div className="flex justify-start items-center mb-3">
        <RiBuilding4Line className="mr-2 h-5 w-5" />
        <span className="text-md font-bold">Company</span>
      </div>
      <div>
        {/* <div className="grid grid-cols-3">
          <span className="text-gray-600">Name</span>
          <span className="col-span-2 font-semibold">Github</span>
        </div> */}
        {payload?.yearFounded && (
          <div className="grid grid-cols-3">
            <span className="text-gray-600">Founded</span>
            <span className="col-span-2 font-semibold">
              {payload?.yearFounded}
            </span>
          </div>
        )}
        {payload?.total_employees_exact && (
          <div className="grid grid-cols-3">
            <span className="text-gray-600">Employees</span>
            <span className="col-span-2 font-semibold">
              {payload?.total_employees_exact}
            </span>
          </div>
        )}
        {payload?.address && payload?.address.length > 0 && (
          <div className="grid grid-cols-3">
            <span className="text-gray-600">HQ</span>
            <span className="col-span-2 font-semibold">
              {payload?.address.join(", ")}
            </span>
          </div>
        )}
        {payload?.revenue && (
          <div className="grid grid-cols-3">
            <span className="text-gray-600">Revenue</span>
            <span className="col-span-2 font-semibold">{payload?.revenue}</span>
          </div>
        )}
        {payload?.digital_rank && (
          <div className="grid grid-cols-3">
            <span className="text-gray-600">Digital Rank</span>
            <span className="col-span-2 font-semibold">
              {payload?.digital_rank}
            </span>
          </div>
        )}
        {payload?.codeNaics && (
          <div className="grid grid-cols-3">
            <span className="text-gray-600">NAIC</span>
            <span className="col-span-2 font-semibold">
              {payload?.codeNaics}
            </span>
          </div>
        )}
        {payload?.codeSic && (
          <div className="grid grid-cols-3">
            <span className="text-gray-600">SIC</span>
            <span className="col-span-2 font-semibold">{payload?.codeSic}</span>
          </div>
        )}
      </div>
    </div>
  )
};

export default CompanyDetail;
