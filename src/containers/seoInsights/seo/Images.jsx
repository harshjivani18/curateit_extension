import React, { useEffect, useState } from "react";
import { FiDownload } from "react-icons/fi";
import { Spin } from "antd";
import { json2csv } from "json-2-csv";

const Images = ({ pageUrl }) => {
  const [images, setImages] = useState([]);
  const [imagesWithoutAlt, setImagesWithoutAlt] = useState(0);
  const [imagesWithoutTitle, setImagesWithoutTitle] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchAndParseImages = async () => {
      try {
        window.chrome.storage.local.get("CT_SEO_IMAGES", (data) => {
          if (data && data.CT_SEO_IMAGES) {
            const seoDetails = data.CT_SEO_IMAGES
            
            setImages(seoDetails?.fetchedImages);
            setImagesWithoutAlt(seoDetails?.withoutAltCount);
            setImagesWithoutTitle(seoDetails?.withoutTitleCount);
            setLoading(false);
          }
        })
      } catch (error) {
        console.error("Error fetching or parsing page content:", error);
        setLoading(false);
      }
    };

    fetchAndParseImages();
  }, []);

  // Function to handle image download
  const handleDownload = (src, alt) => {
    const link = document.createElement("a");
    link.href = src;
    link.download = `${alt || "image"}.jpg`; // Use alt text as filename if available, or default to 'image'
    document.body.appendChild(link); // Append to body to ensure it's in the document
    link.click(); // Simulate click
    document.body.removeChild(link); // Clean up
  };

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

  const handleExportImageLinks = () => {
    downloadCSV(images, "imageLinks.csv");
  };

  return (
    <div>
      {loading && (
        <div>
          <Spin className="absolute top-1/2 left-1/2" />
        </div>
      )}
      <div className="flex flex-row justify-evenly">
        <div className="flex flex-col">
          <span className="text-center text-blue-600 font-medium">Images</span>
          <span className="text-center text-gray-500">{images.length}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-center text-blue-600 font-medium">
            Without Alt
          </span>
          <span className="text-center text-gray-500">{imagesWithoutAlt}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-center text-blue-600 font-medium">
            Without Title
          </span>
          <span className="text-center text-gray-500">
            {imagesWithoutTitle}
          </span>
        </div>
      </div>
      <div className="flex flex-row gap-2 mt-2 justify-center">
        {/* Buttons functionality not implemented in this snippet */}
        <button
          onClick={handleExportImageLinks}
          className="bg-gray-200 p-2 rounded-md text-sm flex flex-row gap-1 items-center"
        >
          <FiDownload /> Export All Images
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {images.map((image, index) => (
          <div key={index} className="w-[7rem] relative">
            <img
              src={image.src}
              className="w-full rounded-md"
              alt={image.alt}
              title={image.title}
            />
            <div
              className="absolute bottom-2 right-2 bg-white p-2 rounded-full"
              onClick={() => handleDownload(image.src, image.alt)}
            >
              <FiDownload className="text-black cursor-pointer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Images;
