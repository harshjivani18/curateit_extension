import React, { useEffect, useState } from "react";
import { Spin } from "antd";

const Socials = ({ pageUrl }) => {
  const [ogMeta, setOgMeta] = useState([]);
  const [twitterMeta, setTwitterMeta] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchAndParseMeta = async () => {
      try {
        window.chrome.storage.local.get("CT_SEO_SOCIALS", (data) => {
          if (data && data.CT_SEO_SOCIALS) {
            const seoDetails = data.CT_SEO_SOCIALS
            
            setOgMeta(seoDetails?.ogMetaList);
            setTwitterMeta(seoDetails?.twitterMetaList);
            setLoading(false);
          }
        })
      } catch (error) {
        console.error("Error fetching or parsing page content:", error);
        setLoading(false);
      }
    };

    fetchAndParseMeta();
  }, []);

  // Utility function to truncate strings
  const truncate = (str, num) => {
    return str.length > num ? str.slice(0, num) + "..." : str;
  };

  return (
    <div className="flex flex-col gap-2">
      {loading && (
        <div>
          <Spin className="absolute top-1/2 left-1/2" />
        </div>
      )}
      <div>
        <span className="text-blue-600 font-medium my-2 text-xl border-b-2 block w-full">
          Open Graph (Facebook)
        </span>
        {ogMeta.map((tag, index) => (
          <div key={index} className="flex flex-col">
            <span className="text-blue-600 font-medium">
              {truncate(tag.property, 45)}
            </span>
            <span className="text-gray-500 font-medium">
              {truncate(tag.content, 45)}
            </span>
          </div>
        ))}
      </div>
      <div>
        <span className="text-blue-600 font-medium my-2 text-xl border-b-2 block w-full">
          Twitter
        </span>
        {twitterMeta.map((tag, index) => (
          <div key={index} className="flex flex-col">
            <span className="text-blue-600 font-medium">
              {truncate(tag.name, 45)}
            </span>
            <span className="text-gray-500 font-medium">
              {truncate(tag.content, 45)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Socials;
