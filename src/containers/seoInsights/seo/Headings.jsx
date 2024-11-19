import React, { useEffect, useState } from "react";
import { Spin } from "antd";
import { ImParagraphCenter } from "react-icons/im";
import { MdContentCopy } from "react-icons/md";
import "./headings.css"
import axios from "axios";

const Headings = ({ pageUrl }) => {
  const [headings, setHeadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heading, setHeading] = useState(0);
  const [images, setImages] = useState(0);
  const [links, setLinks] = useState(0);

  useEffect(() => {
    setLoading(true);
    const fetchAndParseHeadings = async () => {
      try {
        window.chrome.storage.local.get("CT_SEO_HEADINGS", (data) => {
          if (data && data.CT_SEO_HEADINGS) {
            const seoDetails = data.CT_SEO_HEADINGS
            
            setHeading(seoDetails?.headings)
            setImages(seoDetails?.imagesWithSrc)
            setLinks(seoDetails?.anchorsWithHref)
            setHeadings(seoDetails?.headingsList);
            setLoading(false);
          }
        })
      } catch (error) {
        console.error("Error fetching or parsing page content:", error);
        setLoading(false);
      }
    };

    fetchAndParseHeadings();
  }, []);

  const extractDomain = (urlString) => {
    if (urlString) {
      if (
        !urlString.startsWith("http://") &&
        !urlString.startsWith("https://")
      ) {
        urlString = "https://" + urlString;
      }

      try {
        const urlObj = new URL(urlString);
        return urlObj.protocol + "//" + urlObj.hostname;
      } catch (error) {
        console.error("Invalid URL", error);
        return null; // or return an appropriate value indicating the error
      }
    }
  };

  function copyToClipboard(tag) {
    const elem = document.querySelector(`#${tag}`);
    if (!elem) {
      console.error(`Element with ID ${tag} not found.`);
      return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = elem.innerText || elem.textContent;
    document.body.appendChild(textarea);

    textarea.select();
    document.execCommand('copy');

    document.body.removeChild(textarea);
    
  }

  function copyAll() {
    function copyText(text) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);

      textarea.select();
      document.execCommand('copy');

      document.body.removeChild(textarea);
      
    }
    let allText = '';

    for (let i = 1; i <= 6; i++) {
      const headings = document.querySelectorAll(`h${i}`);
      headings.forEach(heading => {
        allText += heading.innerText + "\n"; // Concatenate the text of each heading
      });
    }

    copyText(allText);
    alert("All Text Copied")
  }

  const [sitemapUrl, setSitemapUrl] = useState();
  const [robotsUrl, setRobotsUrl] = useState();
  useEffect(() => {
    const fetchFirstSitemapUrl = async (robotsTxtUrl) => {
      try {
        const response = await axios.get(robotsTxtUrl);
        const data = response.data;
        const lines = data.split('\n');
        const sitemapLine = lines.find(line => line.startsWith('Sitemap:'));

        if (sitemapLine) {
          const url = sitemapLine.split('Sitemap:')[1].trim();
          setSitemapUrl(url); // Set the sitemap URL state
          setRobotsUrl(robotsTxtUrl)
        } else {
          console.log('No sitemap found.');
        }
      } catch (error) {
        console.error('Failed to fetch the robots.txt:', error);
      }
    };

    if (pageUrl) {
      const robotsTxtUrl = `${extractDomain(pageUrl)}/robots.txt`
      fetchFirstSitemapUrl(robotsTxtUrl);
    }
  }, [pageUrl]);

  useEffect(() => {
    const checkSitemap = async () => {
      try {
        const response = await fetch(`${extractDomain(pageUrl)}/sitemap.xml`);
        if (response.ok) {
          if (!sitemapUrl) {
            setSitemapUrl(`${extractDomain(pageUrl)}/sitemap.xml`);
          }
        } else {
          console.log('Sitemap.xml does not exist or could not be fetched.');
        }
      } catch (error) {
        console.error('Error fetching sitemap.xml:', error);
      }
    };
    if (!sitemapUrl) {
      checkSitemap();
    }
  }, [pageUrl]);

  return (
    <div className="flex flex-col gap-2">
      {loading && (
        <div>
          <Spin className="absolute top-1/2 left-1/2" />
        </div>
      )}
      {headings.map((heading, index) => {
        const Tag = heading.level; // Capitalize to use as a JSX tag
        return (
          <div
            key={`${Tag}-${index}`}
            style={{
              marginLeft: index === 0 ? 0 : `${Math.pow(2, parseInt(Tag[1]) - 1) * 10}px`,
            }}
          >
            <div className="flex flex-row items-center gap-1 headingParent">
              <span className="flex flex-col p-1 bg-blue-200 text-blue-500 w-fit rounded-md headingTag">
                {"<"}
                {Tag}
                {">"}
              </span>
              <span className="flex flex-col p-2 bg-blue-200 text-blue-500 w-fit rounded-md headingCopy cursor-pointer">
                <MdContentCopy onClick={() => {
                  copyToClipboard(`heading-${index}`)
                  alert("Text Copied")
                }} />
              </span>
              <Tag id={`heading-${index}`}>{heading.text}</Tag>
            </div>
          </div>
        );
      })}


      <div class="bg-white shadow rounded-lg p-6 mb-2">
        <div class="flex text-sm justify-between">
          <ImParagraphCenter />
          <div class="text-center leading-tight">
            <h2 class="text-gray-900 font-semibold mb-1">H1</h2>
            <span class="text-sm text-[#b3b0c6]">{heading?.h1 || "0"}</span>
          </div>
          <div class="text-center leading-tight">
            <h2 class="text-gray-900 font-semibold mb-1">H2</h2>
            <span class="text-sm text-[#b3b0c6]">{heading?.h2 || "0"}</span>
          </div>
          <div class="text-center leading-tight">
            <h2 class="text-gray-900 font-semibold mb-1">H3</h2>
            <span class="text-sm text-[#b3b0c6]">{heading?.h3 || "0"}</span>
          </div>
          <div class="text-center leading-tight">
            <h2 class="text-gray-900 font-semibold mb-1">H4</h2>
            <span class="text-sm text-[#b3b0c6]">{heading?.h4 || "0"}</span>
          </div>
          <div class="text-center leading-tight">
            <h2 class="text-gray-900 font-semibold mb-1">H5</h2>
            <span class="text-sm text-[#b3b0c6]">{heading?.h5 || "0"}</span>
          </div>
          <div class="text-center leading-tight">
            <h2 class="text-gray-900 font-semibold mb-1">H6</h2>
            <span class="text-sm text-[#b3b0c6]">{heading?.h6 || "0"}</span>
          </div>
          <div class="text-center leading-tight">
            <h2 class="text-gray-900 font-semibold mb-1">Images</h2>
            <span class="text-sm text-[#b3b0c6]">{images || "0"}</span>
          </div>
          <div class="text-center leading-tight">
            <h2 class="text-gray-900 font-semibold mb-1">Links</h2>
            <span class="text-sm text-[#b3b0c6]">{links || "0"}</span>
          </div>
        </div>
        <hr class="mt-4 text-hr" />
        <div class="mt-4">
          <div class="w-full flex justify-evenly">
            <div class="text-sm text-[#b3b0c6] flex items-center gap-4">
              {extractDomain(pageUrl) &&
                <>
                  {robotsUrl &&
                    <a href={robotsUrl} target="_blank" class="underline mr-10">Robots.txt</a>
                  }
                  {sitemapUrl &&
                    <a href={sitemapUrl} target="_blank" class="underline">Sitemap.xml</a>
                  }
                </>
              }
              <span onClick={() => copyAll()} class="flex flex-col p-2 bg-blue-200 text-blue-500 w-fit rounded-md cursor-pointer">Copy All</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Headings;
