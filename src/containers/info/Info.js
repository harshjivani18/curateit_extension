import React, { useState } from "react"
import { AiOutlineCopy } from "react-icons/ai"
import { IoOpenOutline } from "react-icons/io5"
import { Collapse } from "antd"
import CopyToClipboard from "react-copy-to-clipboard"
import { CheckIcon } from "@heroicons/react/24/outline"
import { useSelector } from "react-redux"

import Branding from "../../components/branding/Branding"
import CompanyDetail from "../../components/companyDetail/CompanyDetail"
import MetaDetails from "../../components/metaDetails/MetaDetails"
import Social from "../../components/social/Social"
import Technology from "../../components/technology/Technology"
import Image from "../../components/image/Image"
import SimilarCompanies from "../../components/similarCompany/SimilarCompanies"
import ImageViewer from "../../components/imageViewer/ImageViewer"
import { RiStackLine } from "react-icons/ri"
const { Panel } = Collapse

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

const Info = () => {
  const urlDetails                                 = useSelector((state) => state.domain.urlData)
  const [showImageModal, setShowImageModal]        = useState(false);
  const [imageUrl, setImageUrl]                    = useState("");
  const [showCopied, setShowCopied]                = useState("")

  const openViewer = (url) => {
    setShowImageModal(true);
    setImageUrl(url);
  }

  const hideImageModal = () => {
    setShowImageModal(false);
    setImageUrl("");
  }


  const handleCopy = (text) => {
    setShowCopied(text)
    setTimeout(() => {
      setShowCopied("")
    }, 1000)
  }

  const openOnNewTab = (url) => {
    let defaultUrl = url

    if (
      !defaultUrl.toString().startsWith("http") &&
      !defaultUrl.toString().startsWith("https")
    ) {
      defaultUrl = "https://" + defaultUrl
    }

    window.open(defaultUrl, "_blank")
  }



  const MoreCompaniesHeader = ({ title, numbers }) => (
    <div className="flex justify-start items-center mb-3">
      <RiStackLine className="mr-2 h-5 w-5" />
      <span className="text-md font-bold">
        {title}{" "}
        <span className="ml-5 text-gray-300 font-normal">{numbers}</span>
      </span>
    </div>
  )

  return (
    <>
      <ImageViewer
        showModal={showImageModal}
        hideModal={hideImageModal}
        image={imageUrl}
      />
      <div className="flex flex-col gap-6 pb-5 p-4">
        {(urlDetails?.domain_name ||
          urlDetails?.logo_url ||
          urlDetails?.icon_url) && (
          <div className="flex justify-start items-center gap-2">
            {(urlDetails?.logo_url || urlDetails?.icon_url) && (
              <img
                src={urlDetails?.logo_url || urlDetails?.icon_url}
                alt={urlDetails?.domain_name}
                className="h-6 w-6 object-contain"
              />
            )}
            {urlDetails?.domain_name && <h2>{urlDetails?.domain_name}</h2>}
          </div>
        )}
        {urlDetails?.description ||
          (urlDetails?.summary && (
            <div>
              <span className="text-md font-bold">Info</span>
              {urlDetails?.description && (
                <p className="text-sm text-gray-500 py-2">
                  {urlDetails?.description}
                </p>
              )}
              {urlDetails?.summary && (
                <p className="text-sm text-gray-500 py-2">
                  {urlDetails?.summary}
                </p>
              )}
            </div>
          ))}

        {(urlDetails?.yearFounded ||
          urlDetails?.total_employees_exact ||
          (urlDetails?.address && urlDetails?.address.length > 0) ||
          urlDetails?.revenue ||
          urlDetails?.digital_rank ||
          urlDetails?.codeNaics ||
          urlDetails?.codeSic) && <CompanyDetail payload={urlDetails} />}

        {urlDetails?.social_links && (
          <Social socials={urlDetails?.social_links} />
        )}
        {/* Emails */}
        {urlDetails?.emails &&
          Array.isArray(urlDetails?.emails) &&
          urlDetails?.emails.length > 0 && (
            <div>
              <span className="text-md font-bold">Emails</span>
              <p className="text-sm text-gray-500 py-2">
                {urlDetails?.emails.join(", ")}
              </p>
            </div>
          )}
        {/* <Statistics /> */}
        {urlDetails?.technologystack &&
          Array.isArray(urlDetails?.technologystack) &&
          urlDetails?.technologystack.length > 0 && (
            <Technology technology={urlDetails?.technologystack} />
          )}

        {((urlDetails?.logoColor && urlDetails?.logoColor.length > 0) ||
          (urlDetails?.landingPageColor &&
            urlDetails?.landingPageColor.length > 0)) && (
          <Branding brandColors={urlDetails} />
        )}

        {urlDetails?.keyword &&
          Array.isArray(urlDetails?.keyword) &&
          urlDetails?.keyword.length > 0 && (
            <MetaDetails keywords={urlDetails?.keyword} />
          )}

        <div className="grid grid-cols-2 gap-2">
          <CopyToClipboard
            text={urlDetails?.website_text}
            onCopy={() => handleCopy("website")}
            className="border-[#347AE2] border-2 rounded-md flex justify-center items-center text-[#347AE2] gap-1 py-1 relative"
          >
            <button className="">
              <div
                className={classNames(
                  showCopied == "website" ? "" : "hidden",
                  "text-xs font-bold text-green-800 bg-green-400 absolute break-words text-center rounded-md p-1 right-0 -top-5 flex justify-center items-center gap-1"
                )}
              >
                <CheckIcon className="w-4 h-4" />
                Copied
              </div>
              <span>Copy website text</span>
              <AiOutlineCopy className="w-4 h-4" />
            </button>
          </CopyToClipboard>
          <button
            onClick={() => openOnNewTab(urlDetails.url)}
            className="flex justify-center items-center text-[#347AE2] border-[#347AE2] border-2 rounded-md py-1 gap-1"
          >
            <span>View more options</span>
            <IoOpenOutline className="w-4 h-4" />
          </button>
        </div>
        {(urlDetails?.screenshot_url?.url ||
          urlDetails?.full_screenshot_url?.url ||
          urlDetails?.thumbnail_url) && (
          <div>
            <h2 className="text-md font-bold my-2">Images</h2>
            {/* <ImageViewer
            showModal={showImageModal}
            hideModal={hideImageModal}
            image={imageUrl}
          /> */}
            <div className="grid grid-cols-2 gap-2">
              {urlDetails?.screenshot_url && (
                <Image
                  image={urlDetails?.screenshot_url}
                  openViewer={openViewer}
                />
              )}
              {urlDetails?.full_screenshot_url && (
                <Image
                  image={urlDetails?.full_screenshot_url}
                  openViewer={openViewer}
                />
              )}
              {urlDetails?.thumbnail_url && (
                <Image
                  image={urlDetails?.thumbnail_url}
                  openViewer={openViewer}
                />
              )}
            </div>
          </div>
        )}
        {urlDetails?.companiesSimilar &&
          Array.isArray(urlDetails?.companiesSimilar) &&
          urlDetails?.companiesSimilar.length > 0 && (
            <Collapse bordered={false} expandIconPosition="end">
              <Panel
                header={
                  <MoreCompaniesHeader
                    title="Similar Comapnies"
                    numbers={urlDetails.companiesSimilar.length}
                  />
                }
                key="1"
              >
                <SimilarCompanies
                  simpilar_companies={urlDetails?.companiesSimilar}
                  openUrl={openOnNewTab}
                />
              </Panel>
            </Collapse>
          )}

        {urlDetails?.companiesAcquisitions &&
          Array.isArray(urlDetails?.companiesAcquisitions) &&
          urlDetails?.companiesAcquisitions.length > 0 && (
            <Collapse bordered={false} expandIconPosition="end">
              <Panel
                header={
                  <MoreCompaniesHeader
                    title="Companies Acquisitions"
                    numbers={urlDetails.companiesAcquisitions.length}
                  />
                }
                key="1"
              >
                <SimilarCompanies
                  simpilar_companies={urlDetails?.companiesAcquisitions}
                  openUrl={openOnNewTab}
                />
              </Panel>
            </Collapse>
          )}

        {urlDetails?.companiesSubsidiaries &&
          Array.isArray(urlDetails?.companiesSubsidiaries) &&
          urlDetails?.companiesSubsidiaries.length > 0 && (
            <Collapse bordered={false} expandIconPosition="end">
              <Panel
                header={
                  <MoreCompaniesHeader
                    title="Companies Subsidiaries"
                    numbers={urlDetails.companiesSubsidiaries.length}
                  />
                }
                key="1"
              >
                <SimilarCompanies
                  simpilar_companies={urlDetails?.companiesSubsidiaries}
                  openUrl={openOnNewTab}
                />
              </Panel>
            </Collapse>
          )}
      </div>
    </>
  )
}

export default Info
