/*global chrome*/
import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button, Collapse, Modal, Spin, Table } from "antd";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { TEXT_MESSAGE } from "../../utils/constants";
import { getBlockDomainList, removeDomainFromBlockList } from "../../actions/user";
import { useDispatch } from "react-redux";
import { fetchCurrentTab } from "../../utils/fetch-current-tab";

const { Panel } = Collapse

const BlockDomainComponent = ({}) => {
    const [loading,setLoading] = useState(false)
    const dispatch = useDispatch()
    const blocked_sites = useSelector(state => state.user.blocked_sites)

    useEffect(() => {
      const getCall = async () => {
        setLoading(true)
        await dispatch(getBlockDomainList())
        setLoading(false)
      }

      getCall()
    },[])

    const setupRows = (data) => {
    return data?.map((o) => {
        return {
            blockedDomains: o.domain,
            id: o.id
        };
        });
    }

    const deleteBlockedDomain = (val) => {
          Modal.confirm({
            title: TEXT_MESSAGE.REMOVE_BLOCKED_DOMAIN_CONFIRMATION,
            okText: 'Yes',
            cancelText: 'No',
            onOk: () =>deleteYes(val),
            okType:'primary',
        });
    }

    const deleteYes = async (val) => {
        const payload = {
            "siteId": val.id
            }
        await dispatch(removeDomainFromBlockList(payload))
        const tObj = await fetchCurrentTab()
        window.chrome.tabs.sendMessage(tObj.id, { type: "CHECK_GEM_URL" })
    }

    const columns = [
    {
      title: 'Disabled Domains',
      dataIndex: 'blockedDomains',
      key: 'blockedDomains'
    },
    {
          title: "",
          dataIndex: "actions",
          render: (_, record) => {
            return (
              <div className="action-btns-container">
                <Button
                    className="btn-style"
                    onClick={() => deleteBlockedDomain(record)}
                  >
                    <TrashIcon className="h-4 w-4 text-red-400" />
                  </Button>
              </div>
            );
          },
    },
  ];
    if (blocked_sites?.length === 0) return null
    return(
        <>
        <Collapse
        bordered={false}
        expandIcon={(status) => {
          return (
            <div>
              {status.isActive ? (
                <ChevronUpIcon className="h-5 w-5" />
              ) : (
                <ChevronDownIcon className="h-5 w-5" />
              )}
            </div>
          )
        }}
        expandIconPosition="end"
      >
        <Panel
          header={
            <div>
              <h2 className="font-bold text-gray-600">HIGHLIGHTS DISABLED DOMAINS</h2>
            </div>
          }
          key="1"
        >
            {
            loading ?
            <div className="spinDiv">
                <Spin size="middle" tip="Loading..." />
            </div>
            :
            <div>
                <Table
                    columns={columns}
                    dataSource={setupRows(blocked_sites)}
                    pagination={{
                    total: blocked_sites?.length,
                    showSizeChanger: false,
                    showQuickJumper: false,
                    showTotal: (total) => `Total ${total} items`,
                    position: ["bottomLeft"],         
                    defaultPageSize: 10,}}
                />
            </div>
            }
        </Panel>
      </Collapse>
        </>
    )
}

export default BlockDomainComponent;