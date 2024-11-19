import React from "react";
import { HiOutlineChartBar } from "react-icons/hi";

const Statistics = () => {
  return (
    <div className="text-sm">
      <div className="flex justify-start items-center mb-3">
        <HiOutlineChartBar className="mr-2 h-5 w-5" />
        <span className="text-md font-bold">Statistics</span>
      </div>
      <div>
        <div className="grid grid-cols-3">
          <span className="text-gray-600">Monthly Visits</span>
          <span className="col-span-2 font-semibold">
            398.01M{" "}
            <span className="text-red-600 text-xs ml-2 font-medium">
              (-4.90%)
            </span>
          </span>
        </div>
        <div className="grid grid-cols-3">
          <span className="text-gray-600">Founded</span>
          <span className="col-span-2 font-semibold">2008</span>
        </div>
        <div className="grid grid-cols-3">
          <span className="text-gray-600">Employees</span>
          <span className="col-span-2 font-semibold">501-1000</span>
        </div>
        <div className="grid grid-cols-3">
          <span className="text-gray-600">HQ</span>
          <span className="col-span-2 font-semibold">United States</span>
        </div>
        <div className="grid grid-cols-3">
          <span className="text-gray-600">Last Funding</span>
          <span className="col-span-2 font-semibold">Series B</span>
        </div>
        <div className="grid grid-cols-3">
          <span className="text-gray-600">Status</span>
          <span className="col-span-2 font-semibold">Private</span>
        </div>
        <div className="grid grid-cols-3">
          <span className="text-gray-600">Aquired By</span>
          <span className="col-span-2 font-semibold">Microsft</span>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
