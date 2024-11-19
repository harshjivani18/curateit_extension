import React, { useEffect, useState } from "react";
import { FiDownload } from "react-icons/fi";
import { Spin } from "antd";
import { json2csv } from "json-2-csv";

const Links = ({ pageUrl }) => {
  const [totalLinks, setTotalLinks] = useState(0);
  const [uniqueLinks, setUniqueLinks] = useState(0);
  const [internalLinks, setInternalLinks] = useState([]);
  const [externalLinks, setExternalLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchAndParseLinks = async () => {
      try {
        window.chrome.storage.local.get("CT_SEO_LINKS", (data) => {
          if (data && data.CT_SEO_LINKS) {
            const seoDetails = data.CT_SEO_LINKS
            
            setTotalLinks(seoDetails?.linkElements);
            setUniqueLinks(seoDetails?.uniqueLinks);
            setInternalLinks(seoDetails?.internalLinksTemp);
            setExternalLinks(seoDetails?.externalLinksTemp);
            setLoading(false);
          }
        })
      } catch (error) {
        console.error("Error fetching or parsing page content:", error);
        setLoading(false);
      }
    };

    fetchAndParseLinks();
  }, []);

  // Utility function for downloading data as a CSV file
  const downloadCSV = async (data, filename) => {
    try {
      const csvData = await json2csv(data);
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Could not convert JSON to CSV", err);
    }
  };

  // Handlers for button clicks
  const handleExportInternalLinks = () => {
    downloadCSV(internalLinks, "internal-links.csv");
  };

  const handleExportExternalLinks = () => {
    downloadCSV(externalLinks, "external-links.csv");
  };

  // Utility function to truncate strings
  const truncate = (str, num) => {
    return str.length > num ? str.slice(0, num) + "..." : str;
  };

  return (
    <div>
      {loading && (
        <div>
          <Spin className="absolute top-1/2 left-1/2" />
        </div>
      )}
      {/* Statistics display */}
      <div className="flex flex-row justify-evenly">
        <div className="flex flex-col">
          <span className="text-center text-blue-600 font-medium">
            Total Links
          </span>
          <span className="text-center text-gray-500">{totalLinks}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-center text-blue-600 font-medium">Unique</span>
          <span className="text-center text-gray-500">{uniqueLinks}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-center text-blue-600 font-medium">
            Internal
          </span>
          <span className="text-center text-gray-500">
            {internalLinks.length}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-center text-blue-600 font-medium">
            External
          </span>
          <span className="text-center text-gray-500">
            {externalLinks.length}
          </span>
        </div>
      </div>

      {/* Buttons for exporting links (functionality not implemented in this snippet) */}
      <div className="flex flex-row gap-2 mt-2">
        <button
          onClick={handleExportInternalLinks}
          className="bg-gray-200 p-2 rounded-md text-sm flex flex-row gap-1 items-center"
        >
          <FiDownload /> Export Internal Links
        </button>
        <button
          onClick={handleExportExternalLinks}
          className="bg-gray-200 p-2 rounded-md text-sm flex flex-row gap-1 items-center"
        >
          <FiDownload /> Export External Links
        </button>
      </div>

      {/* Internal Links Display */}
      <div className="mt-4">
        <span className="text-blue-600 font-medium border-b-2 block w-full">
          Internal Links
        </span>
        {internalLinks.map((link, index) => (
          <div
            key={index}
            className="flex flex-col text-black border-b-2 w-full"
          >
            <span title={link.url}>{truncate(link.url, 45)}</span>
            <span className="flex flex-row">
              Anchor:
              <span className="text-gray-500" title={link.anchorText}>
                {` ${truncate(link.anchorText, 45)}`}
              </span>
            </span>
          </div>
        ))}
      </div>

      {/* External Links Display */}
      <div className="mt-4">
        <span className="text-blue-600 font-medium border-b-2 block w-full">
          External Links
        </span>
        {externalLinks.map((link, index) => (
          <div
            key={index}
            className="flex flex-col text-black border-b-2 w-full"
          >
            <span title={link.url}>{truncate(link.url, 45)}</span>
            <span className="flex flex-row">
              Anchor:
              <span className="text-gray-500" title={link.anchorText}>
                {` ${truncate(link.anchorText, 45)}`}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Links;
