import { Spin } from "antd";
import React, { useEffect, useState } from "react";

const Schema = ({ pageUrl }) => {
  const [schemaItems, setSchemaItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState("Schema");

  useEffect(() => {
    setLoading(true);
    const fetchAndParseLinks = async () => {
      try {
        window.chrome.storage.local.get("CT_SEO_SCHEMA", (data) => {
          if (data && data.CT_SEO_SCHEMA) {
            const seoDetails = data.CT_SEO_SCHEMA
            
            setSchemaItems(seoDetails?.scriptElement);
            setLoading(false);
          }
        })
      } catch (error) {
        console.error("Error fetching or parsing page script:", error);
        setLoading(false);
      }
    };

    fetchAndParseLinks();
  }, []);

  const truncate = (str, num) => {
    return str.length > num ? str.slice(0, num) + "..." : str;
  };

  // Function to recursively render schema items, updated to use truncate
  const renderSchemaItems = (item, indent = 0, path = "") => {
    if (!item) {
      return <></>;
    }

    // Function to handle the rendering of each value based on its type
    const renderValue = (key, value, newPath, paddingLeftStyle) => {
      if (typeof value === "object" && !Array.isArray(value) && value !== null) {
        // For objects, we recurse without immediately showing their content
        return (
          <>
            <tr>
              <td style={paddingLeftStyle} className="detailed-purple font-semibold">
                {key}
              </td>
              <td></td>
            </tr>
            {renderSchemaItems(value, indent + 1, newPath)}
          </>
        );
      } else if (Array.isArray(value)) {
        // For arrays, we recurse for each item in the array
        return value.map((val, valIndex) => {
          const arrayPath = `${newPath}.${valIndex}`;
          return renderSchemaItems({ [key]: val }, indent, arrayPath);
        });
      } else {
        // For primitive values, we simply show them
        return (
          <tr key={newPath}>
            <td style={paddingLeftStyle} className="detailed-purple font-semibold">
              {key}
            </td>
            <td>
              <p className="break-words text-black" title={value.toString()}>
                {value.toString()}
              </p>
            </td>
          </tr>
        );
      }
    };

    // Main rendering logic
    return Object.entries(item).map(([key, value], index) => {
      const newPath = `${path}.${key}.${index}`; // Construct a unique path for each item
      const paddingLeftStyle = { paddingLeft: `${indent * 1.5}rem` }; // Adjust the padding based on the indentation level

      // Render each value according to its type
      return renderValue(key, value, newPath, paddingLeftStyle);
    });
  };

  const exportData = () => {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(schemaItems));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "schema.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  return (
    <div style={{ overflow: "overlay" }}>
      {loading && (
        <div>
          <Spin className="absolute top-1/2 left-1/2" />
        </div>
      )}
      <div className="flex flex-col gap-3 border border-gray-300 rounded-md p-4">
        <div className="flex flex-row gap-2 cursor-pointer">
          <span
            className={`p-2 ${showContent === "Schema"
              ? "bg-blue-500 text-white"
              : "bg-white text-blue-500"
              } border border-blue-500 rounded-md`}
            onClick={() => setShowContent("Schema")}
          >
            Schema
          </span>
          <span
            className={`p-2 ${showContent === "Hreflang"
              ? "bg-blue-500 text-white"
              : "bg-white text-blue-500"
              } border border-blue-500 rounded-md`}
            onClick={() => setShowContent("Hreflang")}
          >
            Hreflang
          </span>
          <span
            className={`p-2 bg-blue-500 text-white border border-blue-500 rounded-md ml-auto`}
            onClick={() => exportData()}
          >
            Export Schema
          </span>
        </div>
        {showContent === "Schema" && (
          <div className="w-[21rem]">
            Schema is a form of microdata which helps add context for search
            engines regarding what a web page is about. You don't need to have
            it, though it has many use cases. It's usually fine if this tab is
            empty.
          </div>
        )}
        {showContent === "Hreflang" && (
          <div className="w-[21rem]">
            Hreflang is a markup attribute used in website coding to indicate
            the language and regional targeting of a web page. It helps search
            engines understand which language versions of a page should be shown
            to users in different regions. While not mandatory, implementing
            Hreflang can improve the accuracy of search engine results for
            multilingual websites and enhance the user experience for
            international audiences.
          </div>
        )}
      </div>
      {showContent === "Schema" && (
        <table className="min-w-full divide-y divide-gray-200">
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.values(schemaItems).map((item, index) => (
              <React.Fragment key={index}>
                {renderSchemaItems(item)}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Schema;
