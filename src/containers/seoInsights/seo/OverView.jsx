import React, { useEffect, useState } from "react";
import { MdOutlineElectricBolt, MdOutlineTitle } from "react-icons/md";
import { FaCheck, FaLink, FaRegDotCircle } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";
import { ImParagraphCenter, ImParagraphLeft } from "react-icons/im";
import { GoTag } from "react-icons/go";
import { GrCircleQuestion } from "react-icons/gr";
import { PiAddressBookLight, PiBookBookmarkLight } from "react-icons/pi";
import { HiLanguage } from "react-icons/hi2";
import { Spin } from "antd";
import "./overview.css"
import axios from "axios";

const OverView = ({ pageUrl }) => {
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("");
  const [canonical, setCanonical] = useState(null);
  const [headings, setHeadings] = useState(0);
  const [images, setImages] = useState(0);
  const [links, setLinks] = useState(0);
  const [wordCount, setWordCount] = useState(0)
  const [metaTags, setMetaTags] = useState({})

  // Utility function to truncate strings
  const truncate = (str, num) => {
    return str?.length > num ? str.slice(0, num) + "..." : str;
  };

  useEffect(() => {
    setLoading(true);
    const fetchAndParseMeta = async () => {
      try {
        window.chrome.storage.local.get("CT_SEO_OVERVIEW", (data) => {
          if (data && data.CT_SEO_OVERVIEW) {
            const seoDetails = data.CT_SEO_OVERVIEW
            
            setMetaTags(seoDetails?.metaDetails)
            setHeadings(seoDetails?.headings)
            setImages(seoDetails?.imagesWithSrc)
            setLinks(seoDetails?.anchorsWithHref)
            setWordCount(seoDetails?.words)
            setLang(seoDetails?.lang);
            setCanonical(seoDetails?.canonical)
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
    <div className="flex flex-col gap-4">
      {loading && (
        <div>
          <Spin className="absolute top-1/2 left-1/2" />
        </div>
      )}
      <div className="flex flex-col gap-3 border border-gray-300 rounded-md">
        <div className="block flex-row  p-4">
          <div className="flex flex-row justify-between">
            <div className="flex flex-row gap-1 items-center">
              <span className="p-1 bg-blue-200 text-blue-500 h-fit rounded-md flex flex-row w-fit">
                <MdOutlineTitle />
              </span>
              <h2 className="">Title</h2>
              <GrCircleQuestion
                className="text-gray-400"
                title="This is what shows as the text in your browser tab, and often in your page headings in search results (sometimes Google rewrite them). The current maximum that will display fully on search results is around 65 characters, or 568 pixels."
              />
            </div>
            {metaTags["name=\"og:title\""]?.length > 45 ? (
              <span className="bg-green-400 p-1 rounded-md text-sm text-white flex flex-row justify-center items-center gap-1">
                <FaCheck />{" "}
                <span>{metaTags["name=\"og:title\""]?.length || "0"} Characters</span>
              </span>
            ) : (
              <span className="bg-red-400 p-1 rounded-md text-sm text-white flex flex-row justify-center items-center gap-1">
                <RxCross1 />{" "}
                <span>{metaTags["name=\"og:title\""]?.length || "0"} Characters</span>
              </span>
            )}
          </div>
          <p>{metaTags["name=\"og:title\""] || "Missing"}</p>
        </div>
        <div className="block flex-row  p-4">
          <div className="flex flex-row justify-between">
            <div className="flex flex-row gap-1 items-center">
              <span className="p-1 bg-blue-200 text-blue-500 h-fit rounded-md flex flex-row w-fit">
                <ImParagraphLeft />
              </span>
              <h2>Description</h2>
              <GrCircleQuestion
                className="text-gray-400"
                title="A snippet of text designed to summarise a page. Though not critically important, an ideal length would be 70-155 characters."
              />
            </div>
            {((metaTags["name=\"description\""] ?? metaTags["name=\"og:description\""])?.length > 70 &&
              (metaTags["name=\"description\""] ?? metaTags["name=\"og:description\""])?.length <= 155) ? (
              <span className="bg-green-400 p-1 rounded-md text-sm text-white flex flex-row justify-center items-center gap-1">
                <FaCheck />{" "}
                <span>
                  {(metaTags["name=\"description\""] ?? metaTags["name=\"og:description\""])?.length || "0"} Characters
                </span>
              </span>
            ) : (
              <span className="bg-red-400 p-1 rounded-md text-sm text-white flex flex-row justify-center items-center gap-1">
                <RxCross1 />{" "}
                <span>
                  {(metaTags["name=\"description\""] ?? metaTags["name=\"og:description\""])?.length || "0"} Characters
                </span>
              </span>
            )}
          </div>
          <p>{metaTags["name=\"description\""] || metaTags["name=\"og:description\""] || "Missing"}</p>
        </div>

        <div className="block flex-row  p-4">
          <div className="flex flex-row justify-between">
            <div className="flex flex-row gap-1 items-center">
              <span className="p-1 bg-blue-200 text-blue-500 h-fit rounded-md flex flex-row w-fit">
                <FaLink />
              </span>
              <h2>Url</h2>{" "}
              <GrCircleQuestion
                className="text-gray-400"
                title="The URL of the page you are currently on. URL stands for Uniform Resource Locator."
              />
            </div>
            {(metaTags["name=\"og:url\""] || pageUrl) ? (
              <span className="bg-green-400 p-1 rounded-md text-sm text-white flex flex-row justify-center items-center gap-1">
                <FaCheck /> <span>Indexable</span>
                <GrCircleQuestion
                  className="text-white"
                  title="Search engines like Google can index this page. There is no Robots Meta Tag or X-Robots-Tag in place to suggest otherwise. An exception would be if you found this page behind a log-in screen."
                />
              </span>
            ) : (
              <span className="bg-red-400 p-1 rounded-md text-sm text-white flex flex-row justify-center items-center gap-1">
                <RxCross1 /> <span>Not Indexable</span>
                <GrCircleQuestion
                  className="text-white"
                  title="Due to either the contents of the Robots Meta Tag or X-Robots Tag, this page should not be indexable in search engines like Google."
                />
              </span>
            )}
          </div>
          <p>{truncate(metaTags["name=\"og:url\""] || pageUrl, 94) || "NA"}</p>
        </div>
        <div className="block flex-row  p-4">
          <div className="flex flex-row justify-between">
            <div className="flex flex-row gap-1 items-center">
              <span className="p-1 bg-blue-200 text-blue-500 h-fit rounded-md flex flex-row w-fit">
                <FaRegDotCircle />
              </span>
              <h2>Canonical</h2>{" "}
              <GrCircleQuestion
                className="text-gray-400"
                title="A canonical tag tells search engines like Google what the 'preferred' or 'main' URL of a page should be."
              />
            </div>
            {extractDomain(metaTags["name=\"og:url\""] || pageUrl) ===
              extractDomain(canonical) ? (
              <span className="bg-green-400 p-1 rounded-md text-sm text-white flex flex-row justify-center items-center gap-1">
                <FaCheck /> <span>Self Referencing</span>
                <GrCircleQuestion
                  className="text-white"
                  title="The current URL has a self-referencing canonical tag, meaning the canonical is the same as the URL. This is good, especially if you want this page to be indexed."
                />
              </span>
            ) : (
              <span className="bg-red-400 p-1 rounded-md text-sm text-white flex flex-row justify-center items-center gap-1">
                <RxCross1 />
                <span>Canonicalised</span>
                <GrCircleQuestion
                  className="text-white"
                  title="The current URL is canonicalised, meaning the canonical tag points to a different URL than the page you're on. This essentially tells search engines another URL is the 'main' version of this page. This is fine if it's intentional."
                />
              </span>
            )}
          </div>
          <p>{canonical || "NA"}</p>
        </div>
      </div>
      <div className="flex flex-row justify-between gap-3 border border-gray-300 rounded-md">
        <div className="block flex-row p-4">
          <div className="flex flex-row gap-1 items-start">
            <span className="p-1 bg-blue-200 text-blue-500 h-fit rounded-md flex flex-row w-fit">
              <GoTag />
            </span>
            <div className="flex flex-col">
              <div className="flex flex-row gap-1 items-center">
                <h2>Robots Tag</h2>
                <GrCircleQuestion
                  className="text-gray-400"
                  title="Let's you control if an individual page should be indexed in search results."
                />
              </div>
              <h2>{metaTags["name=\"robots\""] || "Missing"}</h2>
            </div>
          </div>
        </div>
        <div className="block flex-row p-4">
          <div className="flex flex-row gap-1 items-start">
            <span className="p-1 bg-blue-200 text-blue-500 h-fit rounded-md flex flex-row w-fit">
              <GoTag />
            </span>
            <div className="flex flex-col">
              <div className="flex flex-row gap-1 items-center">
                <h2>X-Robots Tag</h2>
                <GrCircleQuestion
                  className="text-gray-400"
                  title="Let's you control if an individual page should be indexed in search results."
                />
              </div>
              <h2>Missing</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border border-gray-300 rounded-md">
        <div className="grid grid-cols-2" style={{ gridTemplateRows: "repeat(2, minmax(0, auto))" }}>
          <div className="block flex-row  p-4">
            <div className="flex flex-row gap-1 items-start">
              <span className="p-1 bg-blue-200 text-blue-500 h-fit rounded-md flex flex-row w-fit">
                <MdOutlineElectricBolt />
              </span>
              <div className="flex flex-col">
                <div className="flex flex-row gap-1 items-center">
                  <h2>Keywords</h2>
                  <GrCircleQuestion
                    className="text-gray-400"
                    title="Meta keywords were primarily used to help tell search engines like Google what a page was about. Google no longer read them, though other tools and services may."
                  />
                </div>
                <h2>{metaTags["name=\"keywords\""] || "Missing"}</h2>
              </div>
            </div>
          </div>
          <div className="block flex-row p-4">
            <div className="flex flex-row gap-1 justify-end items-start">
              <span className="p-1 bg-blue-200 text-blue-500 h-fit rounded-md flex flex-row w-fit">
                <PiBookBookmarkLight />
              </span>
              <div className="flex flex-col">
                <div className="flex flex-row gap-1 items-center">
                  <h2>Word Count</h2>
                </div>
                <h2>{wordCount}</h2>
              </div>
            </div>
          </div>
          <div className="block flex-row  p-4">
            <div className="flex flex-row gap-1 items-start">
              <span className="p-1 bg-blue-200 text-blue-500 h-fit rounded-md flex flex-row w-fit">
                <PiAddressBookLight />
              </span>
              <div className="flex flex-col">
                <div className="flex flex-row gap-1 items-center">
                  <h2>Publisher</h2>
                  <GrCircleQuestion
                    className="text-gray-400"
                    title="The publisher of a particular page or website.This is not a requirement to have."
                  />
                </div>
                <h2>{metaTags["name=\"publisher\""] || "Missing"}</h2>
              </div>
            </div>
          </div>
          <div className="block flex-row p-4">
            <div className="flex flex-row gap-1 justify-end items-start">
              <span className="p-1 bg-blue-200 text-blue-500 h-fit rounded-md flex flex-row w-fit">
                <HiLanguage />
              </span>
              <div className="flex flex-col">
                <div className="flex flex-row gap-1 items-center">
                  <h2>Language</h2>
                  <GrCircleQuestion
                    className="text-gray-400"
                    title="The specified language of the page."
                  />
                </div>
                <h2>{lang || "Missing"}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white shadow rounded-lg p-6 mb-2">
        <div class="flex text-sm justify-between">
          <ImParagraphCenter />
          <div class="text-center leading-tight">
            <h2 class="text-gray-900 font-semibold mb-1">H1</h2>
            <span class="text-sm text-[#b3b0c6]">{headings?.h1 || "0"}</span>
          </div>
          <div class="text-center leading-tight">
            <h2 class="text-gray-900 font-semibold mb-1">H2</h2>
            <span class="text-sm text-[#b3b0c6]">{headings?.h2 || "0"}</span>
          </div>
          <div class="text-center leading-tight">
            <h2 class="text-gray-900 font-semibold mb-1">H3</h2>
            <span class="text-sm text-[#b3b0c6]">{headings?.h3 || "0"}</span>
          </div>
          <div class="text-center leading-tight">
            <h2 class="text-gray-900 font-semibold mb-1">H4</h2>
            <span class="text-sm text-[#b3b0c6]">{headings?.h4 || "0"}</span>
          </div>
          <div class="text-center leading-tight">
            <h2 class="text-gray-900 font-semibold mb-1">H5</h2>
            <span class="text-sm text-[#b3b0c6]">{headings?.h5 || "0"}</span>
          </div>
          <div class="text-center leading-tight">
            <h2 class="text-gray-900 font-semibold mb-1">H6</h2>
            <span class="text-sm text-[#b3b0c6]">{headings?.h6 || "0"}</span>
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
            {extractDomain(pageUrl) &&
              <div class="text-sm text-[#b3b0c6]">
                {robotsUrl &&
                  <a href={robotsUrl} target="_blank" class="underline mr-10">Robots.txt</a>
                }
                {sitemapUrl &&
                  <a href={sitemapUrl} target="_blank" class="underline">Sitemap.xml</a>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverView;
