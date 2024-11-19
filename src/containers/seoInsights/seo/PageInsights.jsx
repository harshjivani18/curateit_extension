import axios from "axios";
import React, { useEffect, useState } from "react";
import { BsBootstrap, BsFiletypeHtml, BsFiletypeTxt, BsFiletypeXml } from "react-icons/bs";
import { FaExternalLinkAlt, FaCheck, FaRegQuestionCircle, FaCity, FaCheckCircle, FaShieldAlt } from "react-icons/fa";
import { ImEarth, ImTree } from "react-icons/im";
import { RxCross2 } from "react-icons/rx";

const PageInsights = ({ pageUrl }) => {

  const extractDomain = (url) => {
    if (!url) return "";
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (e) {
      console.error("Invalid URL : ", e);
      return "";
    }
  };

  const [sitemapUrl, setSitemapUrl] = useState('');

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
        } else {
          console.log('No sitemap found.');
        }
      } catch (error) {
        console.error('Failed to fetch the robots.txt:', error);
      }
    };

    // URL of the robots.txt file
    if (pageUrl) {
      const robotsTxtUrl = `https://${extractDomain(pageUrl)}/robots.txt`
      fetchFirstSitemapUrl(robotsTxtUrl);
    }
  }, [pageUrl]);

  const openInNewTab = (url) => {
    // Check if URL is provided
    if (!url) return;

    // Open URL in a new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-[23rem]">
      <div className="flex flex-col gap-4 mt-4">
        <div className="bg-white p-2 border rounded-md">
          <div id="h_onsite" className="report_title">
            <div className="text-xl text-center">On-site</div>
          </div>
          <div className="report_items">
            <table id="tbl_onsite" className="w-full">
              <tbody>
                <tr className="noborder tr_a" id="tr_on_builtwith">
                  <td className="td_1" title="BuiltWith">
                    <BsBootstrap />
                  </td>
                  <td className="td_2" title="BuiltWith">
                    <div className="td_2_txt" id="lnk_on_builtwith">
                      <a
                        href="#"
                        id="a_on_builtwith"
                      >
                        BuiltWith
                      </a>
                    </div>
                  </td>
                  <td className="td_3" id="val_on_builtwith">
                    <div id="on_builtwith" className="td_3_txt">
                      <a
                        href={`https://builtwith.com/${extractDomain(pageUrl)}`}
                        title="Click here to get more information"
                        target="_blank"
                        id="a_on_builtwith_val"
                      >
                        <FaExternalLinkAlt />
                      </a>
                    </div>
                  </td>
                </tr>
                <tr className="tr_b" id="tr_on_robots">
                  <td className="td_1" title="robots.txt">
                    <BsFiletypeTxt />
                  </td>
                  <td className="td_2" title="robots.txt">
                    <div className="td_2_txt" id="lnk_on_robots">
                      <a
                        href="#"
                        id="a_on_robots"
                      >
                        robots.txt
                      </a>
                    </div>
                  </td>
                  <td className="td_3" id="val_on_robots">
                    <div id="on_robots" className="td_3_txt">
                      <a
                        href={`https://${extractDomain(pageUrl)}/robots.txt`}
                        title="robots.txt"
                        target="_blank"
                        id="a_on_robots_val"
                      >
                        <FaCheck />
                      </a>
                    </div>
                  </td>
                </tr>
                <tr className="tr_a" id="tr_on_sitemap">
                  <td className="td_1" title="sitemap.xml">
                    <BsFiletypeXml />
                  </td>
                  <td className="td_2" title="sitemap.xml">
                    <div className="td_2_txt" id="lnk_on_sitemap">
                      <a
                        href="#"
                        id="a_on_sitemap"
                      >
                        XML Sitemap
                      </a>
                    </div>
                  </td>
                  <td className="td_3" id="val_on_sitemap">
                    <div id="on_sitemap" className="td_3_txt">
                      {
                        sitemapUrl && <a
                          href={sitemapUrl}
                          title="XML Sitemap"
                          target="_blank"
                          id="a_on_sitemap_val"
                        >
                          <FaCheck />
                        </a>
                      }

                      {
                        !sitemapUrl && <a
                          href="#"
                          title="XML Sitemap"
                          id="a_on_sitemap_val"
                        >
                          <RxCross2 />
                        </a>
                      }
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white p-2 border rounded-md">
          <div id="h_domain" className="report_title">
            <div className="text-xl text-center">Domain information</div>
          </div>
          <div className="report_items">
            <table id="tbl_domain" className="w-full">
              <tbody>
                <tr className="noborder tr_a" id="tr_domain_whois">
                  <td className="td_1" title="WHOIS Lookup">
                    <FaRegQuestionCircle />
                  </td>
                  <td className="td_2" title="WHOIS Lookup">
                    <div className="td_2_txt" id="lnk_domain_whois">
                      <a
                        href="#"
                        id="a_domain_whois"
                      >
                        WHOIS Lookup
                      </a>
                    </div>
                  </td>
                  <td className="td_3" id="val_domain_whois">
                    <div id="domain_whois" className="td_3_txt">
                      <a
                        href={`https://whois.chromefans.org/${extractDomain(pageUrl)}`}
                        title="WHOIS Lookup"
                        target="_blank"
                        id="a_domain_whois_val"
                      >
                        <FaExternalLinkAlt />
                      </a>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white p-2 border rounded-md">
          <div id="h_geoip" className="report_title">
            <div className="text-xl text-center">Geolocation information</div>
          </div>
          <div className="report_items">
            <table id="tbl_geoip" className="w-full">
              <tbody>
                <tr className="noborder tr_a" id="tr_geoip_ip">
                  <td className="td_1" title="IP">
                    <svg
                      fill="#888"
                      width="1.25rem"
                      height="1.25rem"
                      xmlns="http://www.w3.org/2000/svg"
                      className="bi bi-hdd-network"
                      viewBox="0 0 16 16"
                    >
                      <path d="M4.5 5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zM3 4.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"></path>
                      <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8.5v3a1.5 1.5 0 0 1 1.5 1.5h5.5a.5.5 0 0 1 0 1H10A1.5 1.5 0 0 1 8.5 14h-1A1.5 1.5 0 0 1 6 12.5H.5a.5.5 0 0 1 0-1H6A1.5 1.5 0 0 1 7.5 10V7H2a2 2 0 0 1-2-2V4zm1 0v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1zm6 7.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5z"></path>
                    </svg>
                  </td>
                  <td className="td_2_ip" title="IP">
                    <div className="td_2_ip_txt" id="lnk_geoip_ip">
                      <a
                        href="#"
                        id="a_geoip_ip"
                      >
                        IP
                      </a>
                    </div>
                  </td>
                  <td className="td_3_ip" id="val_geoip_ip">
                    <div id="geoip_ip" className="td_3_ip_txt">
                      <a
                        href={`https://www.nslookup.io/domains/${extractDomain(pageUrl)}/webservers/`}
                        id="a_geoip_ip_val"
                        target="_blank"
                      >
                        <FaExternalLinkAlt />
                      </a>
                    </div>
                  </td>
                </tr>
                <tr className="tr_b" id="tr_geoip_whois">
                  <td className="td_1" title="IP WHOIS">
                    <FaRegQuestionCircle />
                  </td>
                  <td className="td_2_ip" title="IP WHOIS">
                    <div className="td_2_ip_txt" id="lnk_geoip_whois">
                      <a
                        href="#"
                        id="a_geoip_whois"
                      >
                        IP WHOIS
                      </a>
                    </div>
                  </td>
                  <td className="td_3_ip" id="val_geoip_whois">
                    <div id="geoip_whois" className="td_3_ip_txt">
                      <a
                        href={`https://whois.chromefans.org/${extractDomain(pageUrl)}`}
                        target="_blank"
                        title="Click here to get more information"
                        id="a_geoip_whois_val"
                      >
                        <FaExternalLinkAlt />
                      </a>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white p-2 border rounded-md">
          <div id="h_sec" className="report_title">
            <div className="text-xl text-center">Site Security</div>
          </div>
          <div className="report_items">
            <table id="tbl_sec" className="w-full">
              <tbody>
                <tr className="noborder tr_a" id="tr_sec_siteadv">
                  <td className="td_1" title="McAfee SiteAdvisor">
                    <FaCheckCircle />
                  </td>
                  <td className="td_2" title="McAfee SiteAdvisor">
                    <div className="td_2_txt" id="lnk_sec_siteadv">
                      <a href="#" id="a_sec_siteadv">
                        McAfee SiteAdvisor
                      </a>
                    </div>
                  </td>
                  <td className="td_3" id="val_sec_siteadv">
                    <div id="sec_siteadv" className="td_3_txt">
                      <a
                        href={`https://www.siteadvisor.com/sitereport.html?url=${extractDomain(pageUrl)}`}
                        id="a_sec_siteadv_val"
                        target="_blank"
                      >
                        <FaShieldAlt />
                      </a>
                    </div>
                  </td>
                </tr>
                <tr className="tr_b" id="tr_sec_norton">
                  <td className="td_1" title="Norton Safe Web">
                    <FaCheckCircle />
                  </td>
                  <td className="td_2" title="Norton Safe Web">
                    <div className="td_2_txt" id="lnk_sec_norton">
                      <a href="#" id="a_sec_norton">
                        Norton Safe Web
                      </a>
                    </div>
                  </td>
                  <td className="td_3" id="val_sec_norton">
                    <div id="sec_norton" className="td_3_txt">
                      <a
                        href={`https://safeweb.norton.com/report/show?ulang=eng&url=${extractDomain(pageUrl)}`}
                        target="_blank"
                        id="a_sec_norton_val"
                      >
                        <FaShieldAlt />
                      </a>
                    </div>
                  </td>
                </tr>
                <tr className="tr_a" id="tr_sec_wot">
                  <td className="td_1" title="WOT">
                    <FaCheckCircle />
                  </td>
                  <td className="td_2" title="WOT">
                    <div className="td_2_txt" id="lnk_sec_wot">
                      <a
                        href="#"
                        id="a_sec_wot"
                      >
                        WOT
                      </a>
                    </div>
                  </td>
                  <td className="td_3" id="val_sec_wot">
                    <div id="sec_wot" className="td_3_txt">
                      <a
                        href={`https://www.mywot.com/scorecard/${extractDomain(pageUrl)}`}
                        target="_blank"
                        id="a_sec_wot_val"
                      >
                        <FaExternalLinkAlt />
                      </a>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageInsights;
