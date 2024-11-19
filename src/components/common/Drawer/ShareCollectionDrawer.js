import "./ShareCollectionDrawer.css"

import {
    CheckIcon,
    DocumentDuplicateIcon,
    EnvelopeOpenIcon,
    GlobeAltIcon,
    InformationCircleIcon,
    LinkIcon,
    LockClosedIcon,
    LockOpenIcon,
    PencilSquareIcon,
    TrashIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import {
    Button,
    Select,
    Tabs,
    Input,
    Radio,
    Divider,
    Avatar,
    message,
    Switch,
    DatePicker,
    Tag,
    Modal,
    Collapse,
    List,
} from "antd";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
    changeSecurityEmail,
    changeSecurityLink,
    disablePublicLink,
    getSingleCollection,
    removeAccessEmail,
    removeAccessLink,
    removeSharedCollection,
    setPasswordPublicLink,
    shareCollectionViaEmail,
    shareCollectionViaEmailGroup,
    shareCollectionViaLink,
    shareCollectionViaPublic,
    updateCollection,
    updateCollectionSEODetails,
    updateGroupAccess,
} from "../../../actions/collection";
import { TEXT_MESSAGE } from "../../../utils/constants";
import moment from "moment";
import { RiDeleteBinLine, RiFileCopyLine } from "react-icons/ri";
import session from "../../../utils/session";
import { useSelector } from "react-redux";
import { getAllLevelCollectionPermissions } from "../../../utils/find-collection-id";
import { useNavigate } from "react-router-dom";
import { copyText } from "../../../utils/message-operations";
import slugify from "slugify";
import { PiLinkSimple, PiRocketLaunch, PiUserPlus } from "react-icons/pi";
import SEOModal from "../SEOModal";
import { emailVerification } from "../../../actions/login";
import { addTeam, getAllTeams } from "../../../actions/team";
import { MdGroups } from "react-icons/md";
import { getAllGroup, getAllPublicUsers, getGroup, updateGroup } from "../../../actions/group";
import { Validator } from "../../../utils/validations";

const Option = Select;

const ACCESS_TYPES = {
  viewer: "Viewer",
  editor: "Editor",
  owner: "Owner",
};

const ShareCollectionDrawer = ({
    singleCollectionDetails,
    collectionId,
    existingThumbnails=[]
}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const {sharedCollections} = useSelector(state => state.collection)
    const [tabKey, setTabKey] = useState("Email Invite");

    const [loading, setLoading] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);

    //via email states
    const [emailAddress, setEmailAddress] = useState("");
    const [description, setDescription] = useState("");
    const [accessTypeEmailInvite, setAccessTypeEmailInvite] = useState("viewer");
    const [isEditEmail, setIsEditEmail] = useState({ item: "", value: false });
    const [editEmailData, setEditEmailData] = useState({
        accessType: "",
        allowViews: "",
        allowsDownload: "",
        expiryDate: "",
    });

    //via link states
    const [accessTypeLinkInvite, setAccessTypeLinkInvite] = useState("viewer");
    const [allOrSpecificRadio, setAllOrSpecificRadio] = useState("all");
    const [specificEmailAddressLink, setSpecificEmailAddressLink] = useState("");
    const [isEditLink, setIsEditLink] = useState({ item: "", value: false });
    const [editLinkData, setEditLinkData] = useState({
        accessType: "",
        allowViews: "",
        allowsDownload: "",
        expiryDate: "",
    });

    //public states
    const [publicSwitch, setPublicSwitch] = useState(
        singleCollectionDetails?.isPublicLink
    );
    const [publicLinkUrl, setPublicLinkUrl] = useState(
        singleCollectionDetails?.sharable_links
    );
    
    const [loadingSwitch, setLoadingSwitch] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState(
        singleCollectionDetails?.collectionPassword || ""
    );

    //embed
    const [tabEmbedCodeKey, setTabEmbedCodeKey] = useState("HTML");

    const embedUrl = `${process.env.REACT_APP_WEBAPP_URL}/u/${session.username}/c/${collectionId}/${singleCollectionDetails?.slug || slugify(singleCollectionDetails?.name || "", { lower: true, remove: /[&,+()$~%.'":*?<>{}]/g })}?embeded=true`

    const [isOwnerAccess,setIsOwnerAccess] = useState(null)
    const [isOwnerAccessLink,setIsOwnerAccessLink] = useState(null)
    const [currentCollectionAccessType,setCurrentCollectionAccessType] = useState(null)
    const [renderLinkDetailsInEmail,setRenderLinkDetailsInEmail] = useState([])

    //NEW
    const elm = useRef();
    const memberElm = useRef();
    const [allSharedGroups, setAllSharedGroups] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [newUsers, setNewUsers] = useState([]);

    const [allRegisterUsersList, setAllRegisterUsersList] = useState([]);

    const [seoDetail, setSeoDetail] = useState(
    singleCollectionDetails?.seo || null
  );
    const [loadingSEO, setLoadingSEO] = useState(false);
    const [showMemberBox, setShowMemberBox] = useState(false);
    const [currentGroupId, setCurrentGroupId] = useState(null);
    const [allPublicUsers, setAllPublicUsers] = useState([]);
    const [allFilteredUsers, setAllFilteredUsers] = useState([]);
    const [allNewUsers, setAllNewUsers] = useState([]);
    const [isPublicCollection, setIsPublicCollection] = useState(false);

    const [inviteOptionSelected,setInviteOptionSelected] = useState('private')
    const [privateInviteOption,setPrivateInviteOption] = useState('email')
    const [showSeo,setShowSeo] = useState(singleCollectionDetails?.showSeo)

    const [publicSidebar, setPublicSidebar] = useState(
        singleCollectionDetails?.showSidebar
    );
    const [showPublicSubCollections, setShowPublicSubCollections] = useState(
        singleCollectionDetails?.publicSubCollection
    );
    const [showAllowCopyCollection, setShowAllowCopyCollection] = useState(
        singleCollectionDetails?.allowCopy
    );
    const [allowUserSubmission, setAllowUserSubmission] = useState(
        singleCollectionDetails?.allowUserSubmission
    );

    const [showSocialIcons, setShowSocialIcons] = useState(
        singleCollectionDetails?.showSocialIcons
    );

    useEffect(() => {
        let arr = [];

        dispatch(getAllPublicUsers()).then((res) => {
        if (res?.payload?.data?.data) {
            const pUsersArr = [];
            res?.payload?.data?.data?.forEach((u) => {
            if (u.firstname !== null && u.lastname !== null) {
                pUsersArr.push({
                id: u.id,
                username: u.username,
                name: `${u.firstname} ${u.lastname}`,
                email: u.email,
                avatar: u.profilePhoto,
                });
            }
            });
            setAllRegisterUsersList([...pUsersArr]);
        }
        })

        dispatch(getAllTeams())
        .then((res) => {
            const pUsersArr = []
            if (res?.payload?.data?.members) {
            res?.payload?.data?.members?.forEach((u) => {
                if (u?.username) {
                pUsersArr.push({
                    id: u?.username?.id,
                    username: u?.username?.username,
                    name: `${u?.username?.firstname} ${u?.username?.lastname}`,
                    email: u?.username?.email,
                    avatar: u?.username?.profilePhoto
                })
                }
            })
            }
            if (res?.payload?.data?.guests) {
            res?.payload?.data?.guests?.forEach((u) => {
                if (u?.username) {
                pUsersArr.push({
                    id: u?.username?.id,
                    username: u?.username?.username,
                    name: `${u?.username?.firstname} ${u?.username?.lastname}`,
                    email: u?.username?.email,
                    avatar: u?.username?.profilePhoto
                })
                }
            })
            }
            arr = [...pUsersArr];
            setAllPublicUsers([...pUsersArr]);
            setAllFilteredUsers([...pUsersArr]);

            dispatch(getAllGroup()).then((gRes) => {
            if (gRes?.payload?.data?.data) {
                arr = [
                ...gRes?.payload?.data?.data?.map((g) => {
                    return {
                    id: g?.id,
                    username: g?.name,
                    name: g?.name,
                    email: g?.name,
                    membersCount: g?.members?.length,
                    membersEmail: g?.members?.map((m) => m.email),
                    members: g.members,
                    isGroup: true,
                    };
                }),
                ...arr,
                ];
                setFilteredUsers([...arr]);
                setAllSharedGroups([...gRes?.payload?.data?.data]);
            }
            });
        });
    }, [])

    useEffect(() => {
        if(singleCollectionDetails && singleCollectionDetails?.invitedUsersViaMail && singleCollectionDetails?.invitedUsersViaMail?.length>0){
            const filter = singleCollectionDetails?.invitedUsersViaMail?.filter(item => (item?.accessType === 'owner') && (Number(session?.userId) === item?.id))

            setIsOwnerAccess((filter && filter?.length>0) ? true : false)
        }
        if(singleCollectionDetails && singleCollectionDetails?.invitedUsersViaLinks && singleCollectionDetails?.invitedUsersViaLinks?.length>0){
            const filter = singleCollectionDetails?.invitedUsersViaLinks?.filter(item => (item?.accessType === 'owner') && (session?.emailAddress === (item?.emailArr && item?.emailArr[0])))

            setIsOwnerAccessLink((filter && filter?.length>0) ? true : false)
        }
        if(singleCollectionDetails && singleCollectionDetails?.invitedUsersViaLinks && singleCollectionDetails?.invitedUsersViaLinks?.length>0){
            const filter = singleCollectionDetails?.invitedUsersViaLinks?.filter(item => item?.emailArr && item?.emailArr[0])
            setRenderLinkDetailsInEmail(filter && filter?.length>0 ? filter : [])
        }
    },[singleCollectionDetails])

    useEffect(() => {
        const data = getAllLevelCollectionPermissions(sharedCollections,Number(collectionId))
        setCurrentCollectionAccessType(data)
    },[collectionId,sharedCollections])

    //email flow
    const resetEmailInviteStates = () => {
        setEmailAddress("");
        setDescription("");
        setAccessTypeEmailInvite('viewer');
    };

    const resetLinkInviteStates = () => {
        setAccessTypeLinkInvite('viewer');
        setAllOrSpecificRadio("all");
        setSpecificEmailAddressLink("");
    };

    const handleEmailInvite = async () => {
        const invitedUserGroup = filteredUsers?.filter((user) => {
        return newUsers.indexOf(user.id) !== -1;
        });

    setLoading(true);
    for (const data of invitedUserGroup) {
      if (data?.isGroup !== true) {
        if (!data.email) {
          message.error("Email Address is required");
          return;
        }
        if (accessTypeEmailInvite === null) {
          message.error("Access type is required");
          return;
        }

        if (data.email === session.emailAddress) {
          message.error("Email address entered is your own email");
          return;
        }

        if (
          singleCollectionDetails?.invitedUsersViaMail &&
          singleCollectionDetails?.invitedUsersViaMail?.length > 0 &&
          singleCollectionDetails?.invitedUsersViaMail.some(
            (obj) => obj.emailId === data.email
          )
        ) {
          message.error("Email already added");
          return;
        }

        const payload = {
          email: data.email,
          accessType: accessTypeEmailInvite,
          description: description,
        };
        setLoading(true);

        const res = await dispatch(
          shareCollectionViaEmail(collectionId, payload)
        );

        if (res.error === undefined) {
          message.success("Email sent successfully");
        } else {
          message.error(TEXT_MESSAGE.ERROR_TEXT);
        }
      } else {
        let mArr = [...data.membersEmail];
        const memberIdx = mArr.indexOf(session.emailAddress);

        if (memberIdx !== -1) {
          mArr.splice(memberIdx, 1);
          mArr = [...mArr];
        }

        const payload = {
          emails: mArr,
          accessType: accessTypeEmailInvite,
          description: description,
          groupId: data.id,
          groupName: data.name,
        };

        const res = await dispatch(
          shareCollectionViaEmailGroup(collectionId, payload)
        );
        if (res.error === undefined) {
          message.success("Email sent successfully");
        } else {
        }
      }
    }
    await dispatch(getSingleCollection(collectionId));
    resetEmailInviteStates();
    setLoading(false);
  };

    const handleRemoveAccessEmail = async (token) => {
        setLoadingDelete(true);
        const res = await dispatch(removeAccessEmail(token, collectionId));

        if (res.error === undefined) {
            if(currentCollectionAccessType){
                dispatch(removeSharedCollection(collectionId))
                setLoadingDelete(false);
                message.success("Access removed successfully");
                return navigate(`/search-bookmark`)
            }
            await dispatch(getSingleCollection(collectionId));
            setLoadingDelete(false);
            message.success("Access removed successfully");
        } else {
            setLoadingDelete(false);
            message.error(TEXT_MESSAGE.ERROR_TEXT);
        }
    };

    const handleEditEmail = (item) => {
        setIsEditEmail({
            item: item,
            value: true,
        });
        setEditEmailData({
            accessType: item.accessType,
            allowViews: item.allowViews,
            allowsDownload: item.allowsDownload,
            expiryDate: item.expiryDate,
        });
    };

    const handleCancelEmail = () => {
        setIsEditEmail({ item: "", value: false });
        setEditEmailData({
            accessType: "",
            allowViews: "",
            allowsDownload: "",
            expiryDate: "",
        });
    };

    const handleChangeEditEmailData = (type, value) => {
        setEditEmailData({
            ...editEmailData,
            [type]: value,
        });
    };

    const handleSecurityChangeEmail = async () => {
        setLoading(true);
        const token = isEditEmail?.item?.token;

        const formData = new FormData();

        formData.append("accessType", editEmailData.accessType);
        formData.append("expiryDate", editEmailData.expiryDate);
        formData.append("allowViews", editEmailData.allowViews);
        formData.append("allowsDownload", editEmailData.allowsDownload);

        const res = await dispatch(
            changeSecurityEmail(collectionId, token, formData)
        );

        if (res.error === undefined) {
            await dispatch(getSingleCollection(collectionId));
            message.success("Changes Updated Successfully");
            setLoading(false);
            setIsEditEmail({ item: "", value: false });
            setEditEmailData({
                accessType: "",
                allowViews: "",
                allowsDownload: "",
                expiryDate: "",
            });
        } else {
            setLoading(false);
            setIsEditEmail({ item: "", value: false });
            setEditEmailData({
                accessType: "",
                allowViews: "",
                allowsDownload: "",
                expiryDate: "",
            });
            message.success(TEXT_MESSAGE.ERROR_TEXT);
        }
    };

    //link flow

    const handleCopyLink = (link) => {
        copyText(link)
        message.success('Link copied to clipboard')
    };

    const handleInviteLink = async () => {
        if (accessTypeLinkInvite === null || !allOrSpecificRadio) {
            message.error("All fields are required");
            return;
        }

        if (allOrSpecificRadio === "specific" && !specificEmailAddressLink) {
            message.error("Enter specific domain email address");
            return;
        }

        let regex = new RegExp(
            "^(?!-)[A-Za-z0-9-]+([\\-\\.]{1}[a-z0-9]+)*\\.[A-Za-z]{2,6}$"
        );

        if (
            allOrSpecificRadio === "specific" &&
            specificEmailAddressLink &&
            !regex.test(specificEmailAddressLink)
        ) {
            message.error("Enter valid domain name for specific email");
            return;
        }

        setLoading(true);
        const allowEmail =
            allOrSpecificRadio === "specific" ? specificEmailAddressLink : "all";

        const res = await dispatch(
            shareCollectionViaLink(collectionId, allowEmail, accessTypeLinkInvite)
        );

        if (res.error === undefined) {
            await dispatch(getSingleCollection(collectionId));
            message.success("Link created successfully");
            setLoading(false);
            resetLinkInviteStates();
        } else {
            message.error(TEXT_MESSAGE.ERROR_TEXT);
            setLoading(false);
            resetLinkInviteStates();
        }
    };

    const handleRemoveAccessLink = async (id) => {
        setLoadingDelete(true);
        const res = await dispatch(removeAccessLink(id, collectionId));

        if (res.error === undefined) {
            await dispatch(getSingleCollection(collectionId));
            setLoadingDelete(false);
            message.success("Access removed successfully");
        } else {
            setLoadingDelete(false);
            message.error(TEXT_MESSAGE.ERROR_TEXT);
        }
    };

    const handleEditLink = (item) => {
        setIsEditLink({
            item: item,
            value: true,
        });
        setEditLinkData({
            accessType: item.accessType,
            allowViews: item.allowViews,
            allowsDownload: item.allowsDownload,
            expiryDate: item.expiryDate,
        });
    };

    const handleCancelLink = () => {
        setIsEditLink({ item: "", value: false });
        setEditLinkData({
            accessType: "",
            allowViews: "",
            allowsDownload: "",
            expiryDate: "",
        });
    };

    const handleChangeEditLinkData = (type, value) => {
        setEditLinkData({
            ...editLinkData,
            [type]: value,
        });
    };

    const handleSecurityChangeLink = async () => {
        setLoading(true);
        const token = isEditLink?.item?.id;

        const formData = new FormData();

        formData.append("accessType", editLinkData.accessType);
        formData.append("expiryDate", editLinkData.expiryDate);
        formData.append("allowViews", editLinkData.allowViews);
        formData.append("allowsDownload", editLinkData.allowsDownload);

        const res = await dispatch(
            changeSecurityLink(collectionId, token, formData)
        );

        if (res.error === undefined) {
            await dispatch(getSingleCollection(collectionId));
            message.success("Changes Updated Successfully");
            setLoading(false);
            setIsEditLink({ item: "", value: false });
            setEditLinkData({
                accessType: "",
                allowViews: "",
                allowsDownload: "",
                expiryDate: "",
            });
        } else {
            setLoading(false);
            setIsEditLink({ item: "", value: false });
            setEditLinkData({
                accessType: "",
                allowViews: "",
                allowsDownload: "",
                expiryDate: "",
            });
            message.success(TEXT_MESSAGE.ERROR_TEXT);
        }
    };

    const handlePublicSwitch = async (checked) => {
        if (checked === true) {
            setLoadingSwitch(true);
            const payload = {
                viewSettings: singleCollectionDetails?.viewSettingObj,
            };
            const res = await dispatch(
                shareCollectionViaPublic(collectionId, payload)
            );

            if (res.error === undefined) {
                setLoadingSwitch(false);
                setPublicSwitch(checked);
                setPublicLinkUrl(res.payload.data.link);
                setLoading(false);
                await dispatch(getSingleCollection(collectionId));
                message.success("Link created for public access successfully");
            } else {
                setLoadingSwitch(false);
                message.error(TEXT_MESSAGE.ERROR_TEXT);
                setLoading(false);
            }

            return;
        }

        if (checked === false) {
            setLoadingSwitch(true);
            const res = await dispatch(disablePublicLink(collectionId));
            if (res.error === undefined) {
                setLoadingSwitch(false);
                setPublicSwitch(checked);
                setPassword("");
                await dispatch(getSingleCollection(collectionId));
                message.success("Link disabled successfully");
            } else {
                setLoadingSwitch(false);
                message.error(TEXT_MESSAGE.ERROR_TEXT);
            }
        }
    };

    const handleSetPasswordPublic = async (action) => {
        if(action === 'delete'){
        setLoading(true);
        const formData = new FormData();

        formData.append("password", null);

        const res = await dispatch(setPasswordPublicLink(formData, collectionId));

        if (res.error === undefined) {
            setPassword('')
            await dispatch(getSingleCollection(collectionId));
            setShowPassword(false);
            message.success("Password removed Successfully");
            setLoading(false);
        } else {
            setPassword(password)
            await dispatch(getSingleCollection(collectionId));
            setShowPassword(false);
            setLoading(false);
            message.success(TEXT_MESSAGE.ERROR_TEXT);
        }
        return
        }

        if(action === 'update'){
        setLoading(true);
        const formData = new FormData();

        formData.append("password", password ? password : null);

        const res = await dispatch(setPasswordPublicLink(formData, collectionId));

        if (res.error === undefined) {
            await dispatch(getSingleCollection(collectionId));
            setShowPassword(false);
            message.success("Password Updated Successfully");
            setLoading(false);
        } else {
            await dispatch(getSingleCollection(collectionId));
            setShowPassword(false);
            setLoading(false);
            message.success(TEXT_MESSAGE.ERROR_TEXT);
        }
        }
    };

    //embed
    const handleTabEmbedCodeChange = (key) => {
        setTabEmbedCodeKey(key);
    };

    const copyEmbedCode = () => {
        if (tabEmbedCodeKey === "HTML") {
            try {
                copyText(`<iframe style="border: 0; width: 100%; height: 450px;" allowfullscreen frameborder="0" src="${embedUrl}"/>`);
                message.success('Embed code copied to clipboard');
            } catch (err) {
                message.error('Not have permission')
            }
        } else {
            try {
            copyText(`<iframe title='embed' style={{border: 0, width: '100%', height: '450px',overflow:'auto'}} allowFullScreen frameBorder="0" src={"${embedUrl}"}>`);
            message.success('Embed code copied to clipboard');
        } catch (err) {
            message.error('Not have permission')
        }
        }
    };

    const renderGroupPanelHeader = (header) => {
    return (
      <div className="flex flex-row justify-between w-full">
        <div className="flex flex-row items-center justify-between w-full">
          <div className="flex items-center">
            {header?.group && (
              <Avatar>{header?.group?.charAt(0).toUpperCase()}</Avatar>
            )}

            <div className="mx-3">
              <span className="text-[#101828] block text-sm font-medium">
                {header?.group || "New Group"}
              </span>
            </div>
          </div>
          {isEditEmail && isEditEmail.item.token === header.token ? (
            <Select
              className=""
              placeholder="Select"
              value={editEmailData?.accessType || null}
              onChange={(value) =>
                handleChangeEditEmailData("accessType", value)
              }
            >
              <Option value={"viewer"}>Viewer</Option>
              <Option value={"editor"}>Editor</Option>
            </Select>
          ) : (
            <label>{ACCESS_TYPES[header?.accessType]}</label>
          )}
        </div>
      </div>
    );
  };

    const handleKeyUp = async (e) => {
    if ((e.code === "Enter" || e.code === "NumpadEnter") && e.target.value.trim() !== "") {
      const inputValue = e.target.value.trim();
      const uIdx = allFilteredUsers.findIndex((u) => (u?.email === inputValue || u?.username === inputValue))
      if (uIdx !== -1 ) {
          const user = allFilteredUsers[uIdx]
          setNewUsers([...newUsers, user.id])
          return
      }

      const filteredArr = allFilteredUsers.filter((u) => `${u.username}-${u.email}`.toLowerCase().includes(inputValue.toLowerCase()))
      if (filteredArr.length > 0) {
          setNewUsers([...newUsers, filteredArr[0].id])
          return
      }
      const msg = Validator.validate("email", inputValue, 6, 50, true)

      if (elm.current) {
        elm.current.blur();
      }
      if (msg !== "") {
        message.error(msg);
        return;
      }
      const idx = allRegisterUsersList.findIndex((u) => u.email === inputValue);
      const guestObj = {
        email: idx === -1 ? inputValue.toLowerCase() : inputValue,
        isGuest: true,
        author: session.userId,
        username: idx !== -1 ? allRegisterUsersList[idx].id : null,
        collections: parseInt(collectionId)
      }
      const teamRes = await dispatch(addTeam(guestObj))
      if (teamRes?.error) {
        return
      }
      const ENV = process.env.REACT_APP_ENV;
      if (ENV === "production") {
        const emailVerificationResult = await dispatch(
          emailVerification(inputValue)
        );
        const invalidStatuses = ["invalid", "disposable", "disabled"];
        const status = emailVerificationResult?.payload?.data?.status;

        if (invalidStatuses.includes(status)) {
          message.error("Please enter a valid email address");
          return;
        }
      }
      const newUser = {
        id: inputValue.toLowerCase(),
        email: inputValue.toLowerCase(),
        avatar: null,
        username: null,
        name: inputValue.toLowerCase(),
      };
      setFilteredUsers([...filteredUsers, newUser]);
      setNewUsers([...newUsers, newUser.id]);
    }
  };

    // all tabs
    const renderEmailInviteTab = () => {
    return (
      <>
        <div className="bg-[#FAFCFF] rounded-[6px] border border-solid border-[#DADEE8] p-3 mb-3">
          <div>

            <div className="flex">
              <Select
                mode="multiple"
                ref={elm}
                placeholder='Enter email'
                style={{
                  width: 286
                }}
                className="ct-share-invite-select"
                tagRender={(props) => {
                  const { value } = props;
                  const idx = filteredUsers.findIndex(
                    (user) => user.id === value
                  );
                  if (idx !== -1) {
                    const user = filteredUsers[idx];
                    return (
                      <Tag
                        key={user.id}
                        className="flex p-2"
                        closable={true}
                        onClose={() => onUserRemove(user.id)}
                      >
                        <div className="flex flex-row items-center">
                          <Avatar src={user.avatar} className="mr-2">
                            {user?.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <span>{user.name}</span>
                        </div>
                      </Tag>
                    );
                  }
                  return null;
                }}
                value={newUsers}
                onInputKeyDown={handleKeyUp}
                onChange={(e, users) => {
                  setNewUsers(e);
                }}
                optionFilterProp="title"
                filterOption={(inputVal, option) => {
                  return option.title
                    .toLowerCase()
                    .includes(inputVal.toLowerCase());
                }}
                allowClear
                autoFocus
              >
                {filteredUsers.map((user) => {
                  return (
                    <Option
                      key={user.id}
                      value={user.id}
                      title={`${user.name}-${user.email}`}
                    >
                      <div className="flex flex-row items-center">
                        <Avatar src={user.avatar} className="mr-2">
                          {user?.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <span>{user.name}</span>
                        <span>
                          {user?.isGroup ? (
                            <MdGroups className="ml-2" />
                          ) : (
                            <></>
                          )}
                        </span>
                      </div>
                    </Option>
                  );
                })}
              </Select>

              <Select
                className="ml-3 h-[max-content]"
                placeholder="Select"
                value={accessTypeEmailInvite}
                onChange={(value) => setAccessTypeEmailInvite(value)}
              >
                <Option value={"viewer"}>Viewer</Option>
                <Option value={"editor"}>Editor</Option>
                <Option value={"owner"}>Owner</Option>
              </Select>
            </div>
          </div>

          <div className="mt-2">

            <div className="flex">
              <Input
                placeholder="Add a message...(recommended)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="custom-ant-input"
              />

              {(!currentCollectionAccessType ||
                (currentCollectionAccessType &&
                  (currentCollectionAccessType?.accessType === "editor" ||
                    currentCollectionAccessType?.accessType === "owner"))) && (
                  <Button
                    type="primary"
                    className="rounded-full ml-3 bg-[#347AE2] hover:bg-[#347AE2]"
                    onClick={handleEmailInvite}
                    disabled={loading}
                  >
                    Invite
                  </Button>
                )}
            </div>
          </div>
        </div>

        {singleCollectionDetails?.invitedUsersViaMail &&
          singleCollectionDetails?.invitedUsersViaMail.length > 0 && (
            <div className="bg-[#FAFCFF] rounded-[6px] border border-solid border-[#DADEE8] p-3">
              {parseInt(session.userId) !== parseInt(singleCollectionDetails?.author?.data?.id) &&
                <div className="flex w-full justify-between items-center">
                  <div>
                    <span className="text-[#101828] font-bold block text-md mr-2">Owner</span>
                  </div>
                  <div className="flex flex-row justify-between items-center" onClick={() => window.open(`${process.env.REACT_APP_WEBAPP_URL}/${singleCollectionDetails?.author?.data?.attributes?.username}`, "_blank")}>
                    <Avatar className="mr-2" src={singleCollectionDetails?.author?.data?.attributes?.profilePhoto}>{singleCollectionDetails?.author?.data?.attributes?.firstname ? singleCollectionDetails?.author?.data?.attributes?.firstname?.charAt(0).toUpperCase() : singleCollectionDetails?.author?.data?.attributes?.username?.charAt(0).toUpperCase()}</Avatar>
                    <span className="text-[#667085] block text-md mr-2">{singleCollectionDetails?.author?.data?.attributes?.firstname && singleCollectionDetails?.author?.data?.attributes?.lastname ? `${singleCollectionDetails?.author?.data?.attributes?.firstname} ${singleCollectionDetails?.author?.data?.attributes?.lastname}` : singleCollectionDetails?.author?.data?.attributes?.username}</span>
                  </div>
                </div>
              }
              <div className="flex items-center mb-3">
                <h6 className="text-[#347AE2] block text-xs">
                  Workspace collaborators
                </h6>
              </div>
              {singleCollectionDetails?.invitedUsersViaMail &&
                singleCollectionDetails.invitedUsersViaMail?.map((item, i) => {
                  if (item.isViaLink) return null;
                  if (item.isGroupShare) return renderGroupDetails(item);
                  if (isEditEmail && isEditEmail?.item.id === item.id) {
                    return (
                      <div key={i}>
                        <div className="flex my-4 items-center">
                          {item?.userName ? (
                            <Avatar>
                              {item?.userName?.charAt(0).toUpperCase()}
                            </Avatar>
                          ) : (
                            <Avatar>
                              {item?.emailId
                                ?.split("@")[0]
                                ?.charAt(0)
                                .toUpperCase()}
                            </Avatar>
                          )}

                          <div className={`mx-3`}>
                            <span
                              className={`text-[#101828] block text-sm font-medium`}
                            >
                              {item?.userName || "UnRegister User"}
                            </span>
                            <span
                              className={`text-[#667085] block text-sm`}
                            >
                              {item?.emailId || ""}
                            </span>
                          </div>

                          <Select
                            className=""
                            placeholder="Select"
                            value={editEmailData?.accessType || null}
                            onChange={(value) =>
                              handleChangeEditEmailData("accessType", value)
                            }
                          >
                            <Option value={"viewer"}>Viewer</Option>
                            <Option value={"editor"}>Editor</Option>
                            <Option value={"owner"}>Owner</Option>
                          </Select>
                        </div>

                        <div className="flex justify-between">
                          <div
                            className={`border-r border-[#D0D5DD] pr-1 w-[30%]`}
                          >
                            <h6 className="text-[#505050] block text-xs font-medium mb-2">
                              Expire on
                            </h6>
                            <DatePicker
                              onChange={(date, dateStirng) =>
                                handleChangeEditEmailData(
                                  "expiryDate",
                                  dateStirng
                                )
                              }
                              format={"DD/MM/YYYY"}
                              value={moment(
                                editEmailData.expiryDate,
                                "DD/MM/YYYY"
                              )}
                              showToday={false}
                              allowClear={false}
                              style={{
                                width: "120px",
                              }}
                            />
                          </div>

                          <div
                            className={`border-r border-[#D0D5DD] px-1 w-[40%]`}
                          >
                            <h6 className="text-[#505050] block text-xs font-medium mb-2">
                              Expire after
                            </h6>

                            <div
                              className={`flex flex-row`}
                            >
                              <div
                                className={`flex mr-1 flex-col`}
                              >
                                <Input
                                  placeholder=""
                                  value={editEmailData?.allowViews || ""}
                                  onChange={(e) =>
                                    handleChangeEditEmailData(
                                      "allowViews",
                                      e.target.value
                                    )
                                  }
                                  className="custom-ant-input"
                                />
                                <span className="text-xs text-[#667085]">
                                  Views
                                </span>
                              </div>
                              <div
                                className={`flex mr-1 flex-col`}
                              >
                                <Input
                                  placeholder=""
                                  value={editEmailData?.allowsDownload || ""}
                                  onChange={(e) =>
                                    handleChangeEditEmailData(
                                      "allowsDownload",
                                      e.target.value
                                    )
                                  }
                                  className="custom-ant-input"
                                />
                                <span className="text-xs text-[#667085]">
                                  Downloads
                                </span>
                              </div>
                            </div>
                          </div>

                          <div
                            className={`w-[28%] pl-1`}
                          >
                            <h6 className="text-[#505050] block text-xs font-medium mb-2">
                              Actions
                            </h6>
                            <div
                              className={`flex items-center flex-row`}
                            >
                              <Button
                                disabled={loading}
                                onClick={() => handleCancelEmail(item.token)}
                                className={`mr-1`}
                              >
                                <XMarkIcon className="h-5 w-5 m-0" />
                              </Button>

                              <Button
                                disabled={loading}
                                onClick={() => handleSecurityChangeEmail()}
                              >
                                <CheckIcon className="h-5 w-5 m-0" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  const isViewerAllowedDelete =
                    item?.accessType === "viewer" &&
                    item?.id === Number(session.userId);

                  const isEditorAllowedDelete =
                    item?.accessType === "editor" &&
                    item?.id === Number(session.userId);

                  return (
                    <>
                      <div key={i}>
                        <div className="flex my-4 items-center justify-between">
                          <div className="flex items-center">
                            {item?.userName ? (
                              <Avatar>
                                {item?.userName?.charAt(0).toUpperCase()}
                              </Avatar>
                            ) : (
                              <Avatar>
                                {item?.emailId
                                  ?.split("@")[0]
                                  ?.charAt(0)
                                  .toUpperCase()}
                              </Avatar>
                            )}

                            <div className="mx-2">
                              <span
                                className={`text-[#101828] block text-sm font-medium`}
                              >
                                {item?.userName || "UnRegister User"}
                              </span>
                              <span
                                className={`"text-[#667085] block text-sm`}
                              >
                                {item?.emailId || ""}
                              </span>
                            </div>
                          </div>

                          <label
                            className={`text-sm`}
                          >
                            {ACCESS_TYPES[item?.accessType] || ""}
                          </label>
                          
                        </div>

                        <div className="flex justify-between">

                          <div className="border-r border-[#D0D5DD] pr-1 w-[28%]">
                            <h6 className="text-[#505050] block text-xs font-medium mb-2">
                              Expire on
                            </h6>
                            <label
                              className={`text-sm`}
                            >
                              {item?.expiryDate || ""}
                            </label>
                          </div>

                          <div
                            className={`border-r border-[#D0D5DD] w-[40%] px-1`}
                          >
                            <h6 className="text-[#505050] block text-xs font-medium mb-2">
                              Expire after
                            </h6>

                            <div className="flex justify-between">
                              <div className="flex flex-col mr-2">
                                <label
                                  className={`
                                  ? "text-xs" : "text-sm"
                                    }`}
                                >
                                  {item?.allowViews || ""}
                                </label>
                                <span className="text-xs text-[#667085]">
                                  Views
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <label
                                  className={`text-sm`}
                                >
                                  {item?.allowsDownload || ""}
                                </label>
                                <span className="text-xs text-[#667085]">
                                  Downloads
                                </span>
                              </div>
                            </div>
                          </div>

                          {singleCollectionDetails?.author?.data?.id ===
                            Number(session.userId) ||
                            isOwnerAccess ||
                            isViewerAllowedDelete ||
                            isEditorAllowedDelete ? (
                            <div
                              className={`w-[28%]`}
                            >
                              <h6 className="text-[#505050] block text-xs font-medium mb-2">
                                Remove access
                              </h6>
                             
                              <div
                                className={`flex items-center flex-row`}
                              >
                                <Button
                                  disabled={loadingDelete}
                                  onClick={() =>
                                    handleRemoveAccessEmail(item.token)
                                  }
                                  className={`mr-1`}
                                >
                                  <TrashIcon className="h-5 w-5 m-0" />
                                </Button>
                                {isViewerAllowedDelete ||
                                  isEditorAllowedDelete ? (
                                  ""
                                ) : (
                                  <Button
                                    disabled={loadingDelete}
                                    onClick={() => handleEditEmail(item)}
                                  >
                                    <PencilSquareIcon className="h-5 w-5 m-0" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="w-[28%]"></div>
                          )}
                        </div>
                      </div>

                      <Divider className="m-0 my-4" />
                    </>
                  );
                })}
            </div>
          )}

        {/* render link details  */}

        {renderLinkDetailsInEmail && renderLinkDetailsInEmail.length > 0 && (
          <div className="bg-[#FAFCFF] rounded-[6px] border border-solid border-[#DADEE8] p-3 mt-4">
            <div className="flex items-center mb-3">
              <h6 className="text-[#667085] block text-xs mr-2">
                Invite links
              </h6>
              <InformationCircleIcon className="h-4 w-4 text-[#97A0B5]" />
            </div>
            {renderLinkDetailsInEmail &&
              renderLinkDetailsInEmail?.map((item, i) => {
                if (isEditEmail && isEditEmail?.item.id === item.id) {
                  return (
                    <div key={i}>
                      <div className="flex my-4 items-center">
                        {item?.userName ? (
                          <Avatar>
                            {item?.userName?.charAt(0).toUpperCase()}
                          </Avatar>
                        ) : (
                          <Avatar>
                            {item?.emailId
                              ?.split("@")[0]
                              ?.charAt(0)
                              .toUpperCase()}
                          </Avatar>
                        )}

                        <div className="mx-3">
                          <span className="text-[#101828] block text-sm font-medium">
                            {item?.userName || "UnRegister User"}
                          </span>
                          <span className="text-[#667085] block text-sm">
                            {item?.emailId || ""}
                          </span>
                        </div>

                        <Select
                          className=""
                          placeholder="Select"
                          value={editEmailData?.accessType || null}
                          onChange={(value) =>
                            handleChangeEditEmailData("accessType", value)
                          }
                        >
                          <Option value={"viewer"}>Viewer</Option>
                          <Option value={"editor"}>Editor</Option>
                          <Option value={"owner"}>Owner</Option>
                        </Select>
                      </div>

                      <div className="flex justify-between">
                        <div className="border-r border-[#D0D5DD] pr-1 w-[35%]">
                          <h6 className="text-[#505050] block text-xs font-medium mb-2">
                            Expire on
                          </h6>
                          <DatePicker
                            onChange={(date, dateStirng) =>
                              handleChangeEditEmailData(
                                "expiryDate",
                                dateStirng
                              )
                            }
                            format={"DD/MM/YYYY"}
                            value={moment(
                              editEmailData.expiryDate,
                              "DD/MM/YYYY"
                            )}
                            showToday={false}
                            allowClear={false}
                            style={{ width: "120px" }}
                          />
                        </div>

                        <div className="border-r border-[#D0D5DD] px-1 w-[40%]">
                          <h6 className="text-[#505050] block text-xs font-medium mb-2">
                            Expire after
                          </h6>

                          <div className="flex">
                            <div className="flex flex-col mr-1">
                              <Input
                                placeholder=""
                                value={editEmailData?.allowViews || ""}
                                onChange={(e) =>
                                  handleChangeEditEmailData(
                                    "allowViews",
                                    e.target.value
                                  )
                                }
                                className="custom-ant-input"
                              />
                              <span className="text-xs text-[#667085]">
                                Views
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <Input
                                placeholder=""
                                value={editEmailData?.allowsDownload || ""}
                                onChange={(e) =>
                                  handleChangeEditEmailData(
                                    "allowsDownload",
                                    e.target.value
                                  )
                                }
                                className="custom-ant-input"
                              />
                              <span className="text-xs text-[#667085]">
                                Downloads
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="w-[28%] pl-1">
                          <h6 className="text-[#505050] block text-xs font-medium mb-2">
                            Actions
                          </h6>
                          <div className="flex items-center">
                            <Button
                              disabled={loading}
                              onClick={() => handleCancelEmail(item.token)}
                              className="mr-1"
                            >
                              <XMarkIcon className="h-5 w-5 m-0" />
                            </Button>

                            <Button
                              disabled={loading}
                              onClick={() => handleSecurityChangeEmail()}
                            >
                              <CheckIcon className="h-5 w-5 m-0" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                const isViewerAllowedDelete =
                  item?.accessType === "viewer" &&
                  item?.id === Number(session.userId);

                const isEditorAllowedDelete =
                  item?.accessType === "editor" &&
                  item?.id === Number(session.userId);

                return (
                  <>
                    <div key={i}>
                      <div className="flex my-4 items-center justify-between">
                        <div className="flex items-center">
                          {item?.userName ? (
                            <Avatar>
                              {item?.userName?.charAt(0).toUpperCase()}
                            </Avatar>
                          ) : (
                            <Avatar>
                              {item?.emailId
                                ?.split("@")[0]
                                ?.charAt(0)
                                .toUpperCase()}
                            </Avatar>
                          )}

                          <div className="mx-3">
                            <span className="text-[#101828] block text-sm font-medium">
                              {item?.userName || "UnRegister User"}
                            </span>
                            <span className="text-[#667085] block text-sm">
                              {item?.emailId || ""}
                            </span>
                          </div>
                        </div>
                        <label>{ACCESS_TYPES[item?.accessType]}</label>
                        {/* <Select
                                                        className=""
                                                        placeholder="Select"
                                                        value={item?.accessType || null}
                                                        disabled
                                                    >
                                                        <Option value={"viewer"}>Viewer</Option>
                                                        <Option value={"editor"}>Editor</Option>
                                                        <Option value={"owner"}>Owner</Option>
                                                    </Select> */}
                      </div>

                      <div className="flex justify-between">
                        <div className="border-r border-[#D0D5DD] pr-1 w-[28%]">
                          <h6 className="text-[#505050] block text-xs font-medium mb-2">
                            Expire on
                          </h6>
                          <label>{item?.expiryDate || ""}</label>
                          {/* <Input
                                                            placeholder=""
                                                            value={item?.expiryDate || ""}
                                                            disabled
                                                            style={{ width: "94px" }}
                                                            className="custom-ant-input"
                                                        /> */}
                        </div>

                        <div className="border-r border-[#D0D5DD] px-1 w-[40%]">
                          <h6 className="text-[#505050] block text-xs font-medium mb-2">
                            Expire after
                          </h6>

                          <div className="flex justify-between">
                            <div className="flex flex-col mr-1">
                              {/* <Input
                                                                    placeholder=""
                                                                    disabled
                                                                    value={item?.allowViews || ""}
                                                                    className="custom-ant-input"
                                                                /> */}
                              <label>{item?.allowViews || ""}</label>
                              <span className="text-xs text-[#667085]">
                                Views
                              </span>
                            </div>
                            <div className="flex flex-col">
                              {/* <Input
                                                                    placeholder=""
                                                                    disabled
                                                                    value={item?.allowsDownload || ""}
                                                                    className="custom-ant-input"
                                                                /> */}
                              <label>{item?.allowsDownload || ""}</label>
                              <span className="text-xs text-[#667085]">
                                Downloads
                              </span>
                            </div>
                          </div>
                        </div>

                        {singleCollectionDetails?.author?.data?.id ===
                          Number(session.userId) || isOwnerAccessLink ? (
                          <div className="w-[28%]">
                            <h6 className="text-[#505050] block text-xs font-medium mb-2">
                              Remove access
                            </h6>
                            <div className="flex items-center">
                              <Button
                                className="mr-1"
                                disabled={loadingDelete}
                                onClick={() =>
                                  handleRemoveAccessEmail(item.token)
                                }
                              >
                                <TrashIcon className="h-5 w-5 m-0" />
                              </Button>
                              {isViewerAllowedDelete ||
                                isEditorAllowedDelete ? (
                                ""
                              ) : (
                                <Button
                                  disabled={loadingDelete}
                                  onClick={() => handleEditEmail(item)}
                                >
                                  <PencilSquareIcon className="h-5 w-5 m-0" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="w-[28%]"></div>
                        )}
                      </div>
                    </div>

                    <Divider className="m-0 my-4" />
                  </>
                );
              })}
          </div>
        )}
      </>
    );
  };

  const renderLinkInviteTab = () => {
    return (
      <>
        <div className="bg-[#FAFCFF] rounded-[6px] border border-solid border-[#DADEE8] p-3 mb-3">
          <h6 className="text-[#667085] block text-xs mb-2">
            These links are great for group emails or chat to get your team
            on-board.
          </h6>

          <h6 className="text-[#505050] block text-sm mb-3 font-medium">
            Create an invite link that grants
            <Select
              className={`mx-3`}
              placeholder="Select"
              value={accessTypeLinkInvite}
              onChange={(value) => setAccessTypeLinkInvite(value)}
            >
              <Option value={"viewer"}>Viewer</Option>
              <Option value={"editor"}>Editor</Option>
              <Option value={"owner"}>Owner</Option>
            </Select>
            access to anyone who opens it.
          </h6>

          <Radio.Group
            onChange={(e) => setAllOrSpecificRadio(e.target.value)}
            value={allOrSpecificRadio}
            style={{
              color: "#505050",
            }}
          >
            <Radio value={"all"} style={{ color: "#505050" }}>
              Allow any email address
            </Radio>
            <Radio value={"specific"}>
              <div
                className="flex items-center justify-center"
                style={{ width: "100%" }}
              >
                <span
                  className="block mr-1"
                  style={{ width: "20%", textWrap: "no-wrap" }}
                >
                  Only allow
                </span>
                <Input
                  placeholder="company.com"
                  style={{ width: "50%" }}
                  value={specificEmailAddressLink}
                  onChange={(e) => setSpecificEmailAddressLink(e.target.value)}
                  className="custom-ant-input"
                />
                <span className="block ml-1" style={{ width: "30%" }}>
                  email address
                </span>
              </div>
            </Radio>
          </Radio.Group>

          {(!currentCollectionAccessType ||
            (currentCollectionAccessType &&
              (currentCollectionAccessType?.accessType === "editor" ||
                currentCollectionAccessType?.accessType === "owner"))) && (
              <Button
                className="bg-[#347AE2] border-[#347AE2] text-white hover:bg-[#347AE2] hover:border-[#347AE2] hover:text-white mt-4"
                onClick={handleInviteLink}
                disabled={loading}
              >
                Create Link
              </Button>
            )}
        </div>

        {singleCollectionDetails?.invitedUsersViaLinks &&
          singleCollectionDetails?.invitedUsersViaLinks.length > 0 && (
            <div className="bg-[#FAFCFF] rounded-[6px] border border-solid border-[#DADEE8] p-3">
              <div className="flex items-center mb-2">
                <h6 className="text-[#667085] block text-xs mr-2">
                  Invite links
                </h6>
                <InformationCircleIcon className="h-4 w-4 text-[#97A0B5]" />
              </div>

              {singleCollectionDetails?.invitedUsersViaLinks &&
                singleCollectionDetails?.invitedUsersViaLinks?.map(
                  (item, i) => {
                    if (isEditLink && isEditLink?.item.id === item.id) {
                      return (
                        <div key={i}>
                          <div className="flex my-4">
                            <Input
                              placeholder="you@company.com"
                              disabled
                              suffix={
                                <DocumentDuplicateIcon
                                  className="h-5 w-5 text-[#515151] cursor-pointer"
                                  onClick={() => handleCopyLink(item?.url)}
                                />
                              }
                              value={item?.url || ""}
                            />
                            <Select
                              className="ml-3"
                              placeholder="Select"
                              value={editLinkData?.accessType || null}
                              onChange={(value) =>
                                handleChangeEditLinkData("accessType", value)
                              }
                            >
                              <Option value={"viewer"}>Viewer</Option>
                              <Option value={"editor"}>Editor</Option>
                              <Option value={"owner"}>Owner</Option>
                            </Select>
                          </div>

                          <div className="flex justify-between">
                            <div
                              className={`border-r border-[#D0D5DD] pr-1 w-[35%]`}
                            >
                              <h6 className="text-[#505050] block text-xs font-medium mb-2">
                                Expire on
                              </h6>
                              <DatePicker
                                onChange={(date, dateStirng) =>
                                  handleChangeEditLinkData(
                                    "expiryDate",
                                    dateStirng
                                  )
                                }
                                format={"DD/MM/YYYY"}
                                value={moment(
                                  editLinkData.expiryDate,
                                  "DD/MM/YYYY"
                                )}
                                showToday={false}
                                allowClear={false}
                                style={{
                                  width: "120px",
                                }}
                              />
                            </div>

                            <div
                              className={`border-r border-[#D0D5DD] px-1 w-[40%]`}
                            >
                              <h6 className="text-[#505050] block text-xs font-medium mb-2">
                                Expire after
                              </h6>

                              <div
                                className={`flex flex-row`}
                              >
                                <div
                                  className={`flex flex-col mr-1`}
                                >
                                  <Input
                                    placeholder=""
                                    value={editLinkData?.allowViews || ""}
                                    onChange={(e) =>
                                      handleChangeEditLinkData(
                                        "allowViews",
                                        e.target.value
                                      )
                                    }
                                    className="custom-ant-input"
                                  />
                                  <span className="text-xs text-[#667085]">
                                    Views
                                  </span>
                                </div>
                                <div
                                  className={`flex flex-col`}
                                >
                                  <Input
                                    placeholder=""
                                    value={editLinkData?.allowsDownload || ""}
                                    onChange={(e) =>
                                      handleChangeEditLinkData(
                                        "allowsDownload",
                                        e.target.value
                                      )
                                    }
                                    className="custom-ant-input"
                                  />
                                  <span className="text-xs text-[#667085]">
                                    Downloads
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div
                              className={`w-[28%] pl-1`}
                            >
                              <h6 className="text-[#505050] block text-xs font-medium mb-2">
                                Actions
                              </h6>
                              <div
                                className={`flex items-center flex-row`}
                              >
                                <Button
                                  disabled={loading}
                                  onClick={() => handleCancelLink(item.token)}
                                  className={`mr-1`}
                                >
                                  <XMarkIcon className="h-5 w-5 m-0" />
                                </Button>

                                <Button
                                  disabled={loading}
                                  onClick={() => handleSecurityChangeLink()}
                                >
                                  <CheckIcon className="h-5 w-5 m-0" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <>
                        <div key={i}>
                          <div className="flex items-center mb-2 justify-end font-bold">
                            {item.allowAllMail !== ""
                              ? `Allowed Domain: ${item.allowAllMail}`
                              : "Allowed all domains"}
                          </div>
                          <div className="flex items-center my-4">
                            <Input
                              placeholder="you@company.com"
                              disabled
                              suffix={
                                <DocumentDuplicateIcon
                                  className="h-5 w-5 text-[#515151] cursor-pointer"
                                  onClick={() => handleCopyLink(item?.url)}
                                />
                              }
                              value={item?.url || ""}
                            />
                            <label className="ml-10">
                              {ACCESS_TYPES[item?.accessType] || ""}
                            </label>
                          </div>

                          <div className="flex justify-between">
                            <div className="border-r border-[#D0D5DD] pr-1 w-[28%]">
                              <h6 className="text-[#505050] block text-xs font-medium mb-2">
                                Expire on
                              </h6>
                              <label
                                className={`text-sm`}
                              >
                                {item?.expiryDate || ""}
                              </label>
                            </div>

                            <div
                              className={`border-r border-[#D0D5DD] px-1 w-[40%]`}
                            >
                              <h6 className="text-[#505050] block text-xs font-medium mb-2">
                                Expire after
                              </h6>

                              <div className="flex justify-between">
                                <div className="flex flex-col mr-1">
                                  <label
                                    className={`text-sm`}
                                  >
                                    {item?.allowViews || ""}
                                  </label>
                                  <span className="text-xs text-[#667085]">
                                    Views
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <label
                                    className={`text-sm`}
                                  >
                                    {item?.allowsDownload || ""}
                                  </label>
                                  <span className="text-xs text-[#667085]">
                                    Downloads
                                  </span>
                                </div>
                              </div>
                            </div>

                            {singleCollectionDetails?.author?.data?.id ===
                              Number(session.userId) || isOwnerAccessLink ? (
                              <div
                                className={`w-[28%]`}
                              >
                                <h6 className="text-[#505050] block text-xs font-medium mb-2">
                                  Remove access
                                </h6>
                                <div
                                  className={`flex items-center flex-row`}
                                >
                                  <Button
                                    className={`mr-1`}
                                    disabled={loadingDelete}
                                    onClick={() =>
                                      handleRemoveAccessLink(item.id)
                                    }
                                  >
                                    <TrashIcon className="h-5 w-5 m-0" />
                                  </Button>
                                  <Button
                                    disabled={loadingDelete}
                                    onClick={() => handleEditLink(item)}
                                  >
                                    <PencilSquareIcon className="h-5 w-5 m-0" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="w-[28%]"></div>
                            )}
                          </div>
                        </div>

                        <Divider className="m-0 my-4" />
                      </>
                    );
                  }
                )}
            </div>
          )}
      </>
    );
  };

    const renderSharePubliclyTab = () => {
        return (
            <>
                <div className="bg-[#FAFCFF] rounded-[6px] border border-solid border-[#DADEE8] p-3">
                    <div className="flex items-center">
                        <Switch
                            checked={publicSwitch}
                            onChange={handlePublicSwitch}
                            style={{ background: publicSwitch ? "#1890ff" : "#00000040" }}
                            size="small"
                            loading={loadingSwitch}
                        />
                        <h6 className="text-[#505050] block text-sm font-medium ml-2">
                            Enable shared base link (Public)
                        </h6>
                    </div>

                    <Divider className="text-[#D0D5DD] m-0 w-full my-3" />

                    {singleCollectionDetails?.isPublicLink && (
                        <>
                            <div className="flex items-center ">
                                <Input
                                    placeholder=""
                                    disabled
                                    suffix={
                                        <DocumentDuplicateIcon
                                            className="h-5 w-5 text-[#515151] cursor-pointer"
                                            onClick={() => {
                                                handleCopyLink(publicLinkUrl);
                                            }}
                                        />
                                    }
                                    value={publicLinkUrl || ""}
                                />
                                <Button
                                    className="ml-2"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                {password ?   <LockClosedIcon className="h-5 w-5 m-0" /> : <LockOpenIcon className="h-5 w-5 m-0"/>}
                                </Button>
                            </div>

                            {showPassword && (
                                <div className="my-2 flex items-center">
                                    <Input
                                        placeholder="Enter password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="false"
                                        className="custom-ant-input"
                                    />
                                    <Button
                                        className="mx-1"
                                        onClick={() => handleSetPasswordPublic('update')}
                                        disabled={loading}
                                    >
                                        Update
                                    </Button>
                                    {
                                    password && <Button
                                        onClick={() => handleSetPasswordPublic('delete')}
                                        disabled={loading}
                                    >
                                        <TrashIcon className="h-4 w-4 text-[#EB5757]"/>
                                    </Button>
                                    }
                                </div>
                            )}
                        </>
                    )}
                </div>
            </>
        );
    };

    const renderEmbedTab = () => {
        return (
            <>
                <div className="flex items-center">
                    <Switch
                        checked={publicSwitch}
                        onChange={handlePublicSwitch}
                        style={{ background: publicSwitch ? "#1890ff" : "#00000040" }}
                        size="small"
                        loading={loadingSwitch}
                    />
                    <h6 className="text-[#505050] block text-sm font-medium ml-2">
                        {publicSwitch ? "Disable (If you disbale it will make your collection private)" : "Enable (If you enable it will make your collection public)"}
                    </h6>
                </div>
                {publicSwitch && <div className="bg-[#FAFCFF] rounded-[6px] border border-solid border-[#DADEE8] p-3 mt-4">
                    <div className="flex items-center justify-between">
                        <h6 className="text-[#505050] block text-sm font-medium ml-2">
                            Embed
                        </h6>
                        <Button
                            className="bookmark-addBtn"
                            icon={<RiFileCopyLine />}
                            onClick={copyEmbedCode}
                        >
                            Copy Code
                        </Button>
                    </div>

                    <div className="my-3">
                        <div className="flex items-center justify-between">
                            <span className="block mr-4 text-[#70767A]">Code</span>

                            <Tabs
                                defaultActiveKey={tabEmbedCodeKey}
                                onChange={handleTabEmbedCodeChange}
                                items={[
                                    {
                                        label: `HTML`,
                                        key: "HTML",
                                        children: (
                                            <div
                                                name=""
                                                id=""
                                                className="p-2 w-full border-none outline-[#3169FF] bg-[#F3F5F6] h-fit text-[#1E1E1E]"
                                            >
                                                {`<iframe style="border: 0; width: 100%; height: 450px;" allowfullscreen frameborder="0" src=${embedUrl} />`}
                                            </div>
                                        ),
                                    },
                                    {
                                        label: `React`,
                                        key: "React",
                                        children: (
                                            <div
                                                name=""
                                                id=""
                                                className="p-2 w-full border-none outline-[#3169FF] bg-[#F3F5F6] h-fit text-[#1E1E1E]"
                                            >
                                                {`<iframe title='embed' style={{border: 0, width: '100%', height: '450px',overflow:'auto'}} allowFullScreen frameBorder="0" src=${embedUrl}>`}
                                            </div>
                                        ),
                                    },
                                ]}
                            />
                        </div>

                        
                    </div>

                   

                    <div className="flex flex-col items-center justify-between mt-4">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md" 
                        onClick={() => window.open(embedUrl, '_blank')}>
                            Preview
                        </button>
                    </div>
                </div>}
            </>
        );
    };

    const handleTabChange = (key) => {
        setTabKey(key);
    };

    const onSEOUpdate = async (data) => {
    setLoadingSEO(true);
    let obj = {
      seo: data,
      slug: data?.seo?.slug
    }
    if (singleCollectionDetails?.background?.type === "upload" || singleCollectionDetails?.background?.type === "unsplash") {
      obj = {
        ...obj,
        background: {
          ...singleCollectionDetails?.background,
          altInfo: data?.seo?.altInfo
        }
      }
    }
    const seoRes = await dispatch(
      updateCollectionSEODetails(
        obj,
        collectionId
      )
    );
    setLoadingSEO(false);
    if (seoRes?.payload?.status === 200) {
      setSeoDetail({ ...seoDetail, ...data });
      message.success(`Collection ${TEXT_MESSAGE.SEO_UPDATE}`);
    }
  };

    const renderSEODetails = () => {
        return (
        <SEOModal
            onSubmit={onSEOUpdate}
            seoObj={seoDetail || null}
            baseDetails={{ id: collectionId, type: "c" }}
            defaultImg={`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/logo192.png`}
            isMobile={false}
            loading={loadingSEO}
            existingThumbnails={existingThumbnails || []}
            typeId={collectionId}
            showAltInfo={singleCollectionDetails?.background?.type === "upload" || singleCollectionDetails?.background?.type === "unsplash"}
            altInfo={singleCollectionDetails?.background?.altInfo || singleCollectionDetails?.name || singleCollectionDetails?.description}
            type="collection"
        />
        );
  };

    const handlePublicSidebar = async (isToggled) => {
    if (isToggled === true) {
      setPublicSidebar(isToggled);
      const payload = {
        showSidebar: isToggled,
      };
      const res = await dispatch(updateCollection(collectionId, payload));

      if (res.error === undefined) {
        message.success("Sidebar enabled successfully");
      } else {
        message.error("Unable to enable Sidebar");
      }
    }

    if (isToggled === false) {
      setPublicSidebar(isToggled);
      const payload = {
        showSidebar: isToggled,
      };
      const res = await dispatch(updateCollection(collectionId, payload));

      if (res.error === undefined) {
        message.success("Sidebar disabled successfully");
      } else {
        message.error("Unable to enable Sidebar");
      }
    }
  };

  const handleShowPublicSubCollections = async (isToggled) => {
    setShowPublicSubCollections(isToggled);

    const payload = {
      publicSubCollection: isToggled,
    };
    const res = await dispatch(updateCollection(collectionId, payload));

    if (res.error === undefined) {
      message.success("Settings updated successfully");
    } else {
      message.error(TEXT_MESSAGE.ERROR_TEXT);
    }
  };

  // update payload for copy collection
  const handleShowCopyCollections = async (isToggled) => {
    setShowAllowCopyCollection(isToggled);

    const payload = {
      allowCopy: isToggled,
    };
    const res = await dispatch(updateCollection(collectionId, payload));
    if (res.error === undefined) {
      message.success("Settings updated successfully");
    } else {
       message.error(TEXT_MESSAGE.ERROR_TEXT);
    }
  };

  const handleShowSeo = async (isToggled) => {
    setShowSeo(isToggled);

    const payload = {
      showSeo: isToggled,
    };
    const res = await dispatch(updateCollection(collectionId, payload));
    if (res.error === undefined) {
      message.success("Settings updated successfully");
    } else {
        message.error(TEXT_MESSAGE.ERROR_TEXT);
    }
  };

  const handleAllowUserSubmission = async (isToggled) => {
    if (isToggled === true) {
      setAllowUserSubmission(isToggled);
      const payload = {
        allowUserSubmission: isToggled,
      };
      const res = await dispatch(updateCollection(collectionId, payload));

      if (res.error === undefined) {
        message.success("User submission enabled successfully");
      } else {
        message.error("Unable to enable Sidebar");
      }
    }

    if (isToggled === false) {
      setAllowUserSubmission(isToggled);
      const payload = {
        allowUserSubmission: isToggled,
      };
      const res = await dispatch(updateCollection(collectionId, payload));

      if (res.error === undefined) {
        message.success("User submission disabled successfully");
      } else {
        message.error("Unable to enable Sidebar");
      }
    }
  };

  const handleShowSocialIcons = async (isToggled) => {
    if (isToggled === true) {
      setShowSocialIcons(isToggled);
      const payload = {
        showSocialIcons: isToggled,
      };
      const res = await dispatch(updateCollection(collectionId, payload));

      if (res.error === undefined) {
        message.success("Settings updated successfully");
      } else {
        message.error("Unable to enable Sidebar");
      }
    }

    if (isToggled === false) {
      setShowSocialIcons(isToggled);
      const payload = {
        showSocialIcons: isToggled,
      };
      const res = await dispatch(updateCollection(collectionId, payload));

      if (res.error === undefined) {
        message.success("Settings updated successfully");
      } else {
        message.error("Unable to enable Sidebar");
      }
    }
  };

  const onMembersAdd = async () => {
    const idx = filteredUsers.findIndex((g) => g.id === currentGroupId);
    if (idx !== -1) {
      const userArr = [];
      allNewUsers.forEach((id) => {
        const existingIdx = filteredUsers[idx].members.findIndex(
          (m) => m.id === id
        );
        if (existingIdx === -1) {
          const uIdx = allPublicUsers.findIndex((u) => u.id === id);
          if (uIdx !== -1) {
            userArr.push({ ...allPublicUsers[uIdx], role: "user" });
          }
        }
      });
      filteredUsers[idx] = {
        ...filteredUsers[idx],
        members: [...filteredUsers[idx].members, ...userArr],
        membersCount: userArr.length + filteredUsers[idx].membersCount,
      };
      const res = await dispatch(
        updateGroup(
          {
            ...filteredUsers[idx],
          },
          currentGroupId
        )
      );
      setAllNewUsers([]);
      if (res.error === undefined) {
        setFilteredUsers([...filteredUsers]);
        setLoading(true);
        const gIdx = singleCollectionDetails?.invitedUsersViaMail?.findIndex(
          (u) => {
            return u.id === parseInt(currentGroupId);
          }
        );
        if (gIdx !== -1) {
          let g = singleCollectionDetails?.invitedUsersViaMail[gIdx];
          const mArr = [];
          userArr.forEach((u) => {
            mArr.push({
              id: u.id,
              name: u.name,
              role: "user",
              email: u.email,
              avatar: u.avatar,
              username: u.username,
              accessType: g.accessType,
            });
          });
          const formData = new FormData();

          formData.append("accessType", g.accessType);
          formData.append("expiryDate", g.expiryDate);
          formData.append("allowViews", g.allowViews);
          formData.append("allowsDownload", g.allowsDownload);
          formData.append("members", JSON.stringify([...g.members, ...mArr]));

          const gRes = await dispatch(
            updateGroupAccess(collectionId, g.token, formData)
          );

          if (gRes.error === undefined) {
            await dispatch(getSingleCollection(collectionId));
            message.success("Changes Updated Successfully");
            setLoading(false);
          } else {
            setLoading(false);
          }
        }
        setCurrentGroupId(null);
        setShowMemberBox(false);
        message.success("Group updated successfully");
      } else {
        message.error("An error occurred while updating");
      }
    }
  };

  const onAddMemberClick = (groupId) => {
    setShowMemberBox(true);
    setCurrentGroupId(groupId);
    const gIdx = filteredUsers.findIndex((g) => g.id === groupId);
    if (gIdx !== -1) {
      const group = filteredUsers[gIdx];
      const fUsers = [];
      allPublicUsers.forEach((user) => {
        const idx = group.members.findIndex((m) => m.id === user.id);
        if (idx === -1) {
          fUsers.push(user);
        }
      });
      setAllFilteredUsers([...fUsers]);
    } else {
      setAllFilteredUsers([...allPublicUsers]);
    }
  };

  const onMemberRemove = async (group, member) => {
    let newArr = [...group.members];

    const idx = newArr.findIndex((m) => m.id === member.id);
    if (idx === -1) return;
    newArr.splice(idx, 1);
    newArr = [...newArr];
    setLoading(true);

    const formData = new FormData();

    formData.append("accessType", group.accessType);
    formData.append("expiryDate", group.expiryDate);
    formData.append("allowViews", group.allowViews);
    formData.append("allowsDownload", group.allowsDownload);
    formData.append("members", JSON.stringify(newArr));

    const res = await dispatch(
      updateGroupAccess(collectionId, group.token, formData)
    );

    if (res.error === undefined) {
      await dispatch(getSingleCollection(collectionId));
      message.success("Changes Updated Successfully");
      setLoading(false);
    } else {
      setLoading(false);
    }

    const groupData = await dispatch(getGroup(group?.id));
    let members = groupData?.payload?.data?.data?.attributes?.members;
    const memberIdx = members?.findIndex((m) => m.id === member.id);

    if (memberIdx === -1) return;
    members.splice(memberIdx, 1);
    members = [...members];
    
  };

  const onGroupItemUpdated = async () => {
    setLoading(true);
    const token = isEditEmail?.item?.token;

    const formData = new FormData();

    formData.append("accessType", editEmailData.accessType);
    formData.append("expiryDate", editEmailData.expiryDate);
    formData.append("allowViews", editEmailData.allowViews);
    formData.append("allowsDownload", editEmailData.allowsDownload);
    formData.append("members", JSON.stringify(editEmailData.members));

    const res = await dispatch(
      updateGroupAccess(collectionId, token, formData)
    );

    if (res.error === undefined) {
      await dispatch(getSingleCollection(collectionId));
      message.success("Changes Updated Successfully");
      setLoading(false);
      setIsEditEmail({ item: "", value: false });
      setEditEmailData({
        accessType: "",
        allowViews: "",
        allowsDownload: "",
        expiryDate: "",
        members: [],
      });
    } else {
      setLoading(false);
      setIsEditEmail({ item: "", value: false });
      setEditEmailData({
        accessType: "",
        allowViews: "",
        allowsDownload: "",
        expiryDate: "",
        members: [],
      });
    }
  };

  const onGroupMemberUpdate = async (value, group, userId) => {
    const token = group.token;
    const data = {
      accessType: value
    }
    const res = await dispatch(
      updateGroupAccess(collectionId, token, data, userId)
    );

    if (res.error === undefined) {
      await dispatch(getSingleCollection(collectionId));
      message.success("Changes Updated Successfully");
      setLoading(false);
      setIsEditEmail({ item: "", value: false });
      setEditEmailData({
        accessType: "",
        allowViews: "",
        allowsDownload: "",
        expiryDate: "",
        members: [],
      });
    } else {
      setLoading(false);
      setIsEditEmail({ item: "", value: false });
      setEditEmailData({
        accessType: "",
        allowViews: "",
        allowsDownload: "",
        expiryDate: "",
        members: [],
      });
    }
  }

  const onTagRemove = (userId) => {
    const idx = allNewUsers.findIndex((user) => user.id === userId);
    if (idx !== -1) {
      allNewUsers.splice(idx, 1);
      setAllNewUsers([...newUsers]);
    }
  };

  const onUserRemove = (userId) => {
    const idx = filteredUsers.findIndex((user) => user.id === userId);
    if (idx !== -1) {
      filteredUsers.splice(idx, 1);
      setFilteredUsers([...filteredUsers]);
    }
  };

  const renderGroupDetails = (item) => {
    const isOwner =
      singleCollectionDetails?.author?.data?.id === Number(session.userId);
    const gIdx = allSharedGroups?.findIndex((g) => g.id === item.id);
    const group = (gIdx === -1) ? null : allSharedGroups[gIdx];
    const mIdx = group?.members?.findIndex((m) => {
      return m.id === Number(session.userId);
    });
    const cMember = mIdx !== -1 ? group?.members[mIdx] : null;
    const isRoleOwner = !cMember && currentCollectionAccessType?.accessType === "owner";
    
    return (
      <div key={item.id}>
        <Collapse bordered={false}>
          <Collapse.Panel key={"members"} header={renderGroupPanelHeader(item)}>
            <div className="">
              <List
                className="demo-loadmore-list"
                itemLayout="horizontal"
                dataSource={item.members || []}
                renderItem={(member) => {
                  return (
                    <List.Item
                      actions={
                          [
                            <div className="flex items-center">
                              {(isRoleOwner || isOwner || (cMember?.accessType !== "viewer" &&
                                cMember?.role === "admin")) ||
                                (member?.id === parseInt(session.userId) && cMember?.accessType !== "viewer" && cMember?.role === "admin") 
                                ? <Select
                                className="mr-2"
                                placeholder="Select"
                                value={member?.accessType || null}
                                onChange={(value) =>
                                  onGroupMemberUpdate(value, item, member?.id)
                                }
                                >
                                <Option value={"viewer"}>Viewer</Option>
                                <Option value={"editor"}>Editor</Option>
                                  </Select> 
                                : <label className="mr-2">{ACCESS_TYPES[member?.accessType]}</label> 
                              }
                              {(isRoleOwner || member?.id === parseInt(session.userId) || (cMember?.role === "admin" && cMember?.accessType !== "viewer")) &&
                                <RiDeleteBinLine
                                  style={{ color: "red" }}
                                  onClick={() => onMemberRemove(item, member)}
                                />
                              }
                            </div>
                          ]
                      }
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar src={member.avatar}>
                            {member.name.charAt(0).toUpperCase()}
                          </Avatar>
                        }
                        title={member.name}
                        description={member.username}
                      />
                    </List.Item>
                  );
                }}
              />
            </div>
            {(isOwner ||
              (cMember?.accessType !== "viewer" && cMember?.role === "admin")) && (
                <div className="flex flex-row items-center">
                  <button
                    className="p-2"
                    onClick={() => onAddMemberClick(item.id)}
                  >
                    + Add Members
                  </button>
                </div>
              )}
          </Collapse.Panel>
        </Collapse>
        <div className="flex justify-between">

          <div className="border-r border-[#D0D5DD] pr-1 w-[28%]">
            <h6 className="text-[#505050] block text-xs font-medium mb-2">
              Expire on
            </h6>
            {isEditEmail?.item?.token === item.token &&
              isEditEmail?.item?.expiryDate &&
              editEmailData?.expiryDate ? (
              <DatePicker
                onChange={(date, dateStirng) =>
                  handleChangeEditEmailData("expiryDate", dateStirng)
                }
                format={"DD/MM/YYYY"}
                value={moment(editEmailData.expiryDate, "DD/MM/YYYY")}
                showToday={false}
                allowClear={false}
                style={{
                  width: "120px",
                }}
              />
            ) : (
              <label className={`text-sm`}>
                {item?.expiryDate || ""}
              </label>
            )}
          </div>

          <div
            className={`border-r border-[#D0D5DD] w-[40%] px-1`}
          >
            <h6 className="text-[#505050] block text-xs font-medium mb-2">
              Expire after
            </h6>

            <div className="flex justify-between">
              <div className="flex flex-col mr-2">
                {isEditEmail?.item?.token === item.token &&
                  isEditEmail?.item?.allowViews &&
                  editEmailData?.allowViews ? (
                  <Input
                    placeholder=""
                    value={editEmailData?.allowViews || ""}
                    onChange={(e) =>
                      handleChangeEditEmailData("allowViews", e.target.value)
                    }
                    className="custom-ant-input"
                  />
                ) : (
                  <label className={`text-sm`}>
                    {item?.allowViews || ""}
                  </label>
                )}

                <span className="text-xs text-[#667085]">Views</span>
              </div>
              <div className="flex flex-col">
                {isEditEmail?.item?.token === item.token &&
                  isEditEmail?.item?.allowsDownload &&
                  editEmailData?.allowsDownload ? (
                  <Input
                    placeholder=""
                    value={editEmailData?.allowsDownload || ""}
                    onChange={(e) =>
                      handleChangeEditEmailData(
                        "allowsDownload",
                        e.target.value
                      )
                    }
                    className="custom-ant-input"
                  />
                ) : (
                  <label className={`text-sm`}>
                    {item?.allowsDownload || ""}
                  </label>
                )}
                <span className="text-xs text-[#667085]">Downloads</span>
              </div>
            </div>
          </div>

          {isEditEmail && isEditEmail.item.id === item.id ? (
            <div className={`w-[28%] pl-1`}>
              <h6 className="text-[#505050] block text-xs font-medium mb-2">
                Actions
              </h6>
              <div
                className={`flex items-center flex-row`}
              >
                <Button
                  disabled={loading}
                  onClick={() => handleCancelEmail(item.token)}
                  className={`mr-1`}
                >
                  <XMarkIcon className="h-5 w-5 m-0" />
                </Button>

                <Button disabled={loading} onClick={() => onGroupItemUpdated()}>
                  <CheckIcon className="h-5 w-5 m-0" />
                </Button>
              </div>
            </div>
          ) : (
            <div className={`w-[28%]`}>
              {(isRoleOwner || isOwner ||
                cMember?.role === "admin" || cMember?.accessType === "editor")
                && <h6 className="text-[#505050] block text-xs font-medium mb-2">
                  Remove access
                </h6>}

              <div
                className={`flex items-center flex-row`}
              >
                {(isRoleOwner || isOwner ||
                  (cMember?.accessType !== "viewer" && cMember?.role === "admin"))
                  && <Button
                    disabled={loadingDelete}
                    onClick={() => handleRemoveAccessEmail(item.token)}
                    className={`mr-1`}
                  >
                    <TrashIcon className="h-5 w-5 m-0" />
                  </Button>}
                {(isRoleOwner || isOwner || cMember?.accessType === "editor") && (
                  <Button
                    disabled={loadingDelete}
                    onClick={() => handleEditEmail(item)}
                  >
                    <PencilSquareIcon className="h-5 w-5 m-0" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
        <Divider className="m-0 my-4" />
      </div>
    );
  };


    const renderInviteUI = () => {
    return(
      <>
      {
      currentCollectionAccessType &&
                  (currentCollectionAccessType?.accessType === "editor" ||
                    currentCollectionAccessType?.accessType === "viewer") ?
      <>
      <div className="flex p-1 rounded-md bg-[#F8FAFB] cursor-pointer items-center justify-between mb-6">
            <div className={`shareInviteBtn ${inviteOptionSelected === 'private' ? 'rounded shadow border-[0.4px] border-solid border-[#78A6EC] bg-white' : ''}  w-fit`} onClick={() => {
              setInviteOptionSelected('private')
              setPrivateInviteOption('email')
            }}>
              <PiUserPlus className={`h-5 w-5 ${inviteOptionSelected === 'private' ? 'text-[#347AE2]' : 'text-[#74778B]'}`}/> 
              <div className={`${inviteOptionSelected === 'private' ? 'text-[#347AE2]' : 'text-[#74778B]'} font-medium text-sm`}>Private</div>
            </div>
      </div>
      </>
      :
      <div className="w-fit flex p-1 rounded-md bg-[#F8FAFB] cursor-pointer items-center justify-between mb-6">
            <div className={`shareInviteBtn ${inviteOptionSelected === 'private' ? 'rounded shadow border-[0.4px] border-solid border-[#78A6EC] bg-white' : ''} w-fit`} onClick={() => {
              setInviteOptionSelected('private')
              setPrivateInviteOption('email')
            }}>
              <PiUserPlus className={`h-5 w-5 ${inviteOptionSelected === 'private' ? 'text-[#347AE2]' : 'text-[#74778B]'}`}/> 
              <div className={`${inviteOptionSelected === 'private' ? 'text-[#347AE2]' : 'text-[#74778B]'} font-medium text-sm`}>Private</div>
            </div>

            <div className={`shareInviteBtn ${inviteOptionSelected === 'public' ? 'rounded shadow border-[0.4px] border-solid border-[#78A6EC] bg-white' : ''} w-fit`} onClick={() => setInviteOptionSelected('public')}>
              <GlobeAltIcon className={`h-5 w-5 ${inviteOptionSelected === 'public' ? 'text-[#347AE2]' : 'text-[#74778B]'}`}/> 
              <div className={`font-medium text-sm ${inviteOptionSelected === 'public' ? 'text-[#347AE2]' : 'text-[#74778B]'}`}>Public</div>
            </div>

            {showSeo && <div 
            disabled={!showSeo}
            className={`${!showSeo ? 'cursor-not-allowed' : ''} shareInviteBtn ${inviteOptionSelected === 'seo' ? 'rounded shadow border-[0.4px] border-solid border-[#78A6EC] bg-white' : ''} w-fit : 'w-[120px]'}`} 
            onClick={() => {
              if(!showSeo) return
              if(showSeo){
                setInviteOptionSelected('seo')
              }
            }}>
              <PiRocketLaunch className={`h-5 w-5 ${inviteOptionSelected === 'seo' ? 'text-[#347AE2]' : 'text-[#74778B]'}`}/> 
              <div className={`${inviteOptionSelected === 'seo' ? 'text-[#347AE2]' : 'text-[#74778B]'} font-medium text-sm`}>SEO</div>
            </div>}
      </div>
      }


          {
          inviteOptionSelected === 'private' &&
          <div>
            <div className="w-full flex items-center justify-between mb-2">
              <div className="text-[#347AE2] text-sm font-medium">
                {privateInviteOption === 'email' ? 'Invite by email' : 'Universal Link'}
              </div>

              <div className="flex p-[2px] items-center bg-white rounded border-[0.6px] border-solid border-[#ABB7C9]">

                <div className={`cursor-pointer inviteOptionDiv ${privateInviteOption === 'email' ? 'bg-[#347AE2]' : 'bg-white'}`}
                onClick={() => setPrivateInviteOption('email')}
                >
                  <EnvelopeOpenIcon className={`h-4 w-4 ${privateInviteOption === 'email' ? 'text-white' : 'text-black'}`}/>
                </div>
                <div className={`cursor-pointer inviteOptionDiv ${privateInviteOption === 'link' ? 'bg-[#347AE2]' : 'bg-white'}`} onClick={() => setPrivateInviteOption('link')}>
                  <PiLinkSimple className={`h-4 w-4 ${privateInviteOption === 'link' ? 'text-white' : 'text-black'}`}/>
                </div>
              </div>
            </div>

            
            {
            privateInviteOption === 'email' &&
            <div>
              {renderEmailInviteTab()}
            </div>
            }

            {
            privateInviteOption === 'link' &&
            <div>
              {renderLinkInviteTab()}
            </div>
            }

          </div>
          }

          {
          inviteOptionSelected === 'public' &&
          <div>
            <div className="flex items-center justify-between">
             
              <div className="flex items-center gap-2">
                <div className="items-start gap-[10px] flex p-[7px] bg-[#ECEDEE] rounded-[52px]">
                  <LinkIcon className="h-5 w-5"/>
                </div>

                <div className="flex flex-col items-start gap-[2px]">
                    <div className="font-medium text-sm text-[#292B38]">Public access</div>
                    <div className="text-[#74778B] text-xs">Anyone with the link can view</div>
                </div>
              </div>

               
              <div>
                <Switch
                  checked={publicSwitch}
                  onChange={handlePublicSwitch}
                  style={{ background: publicSwitch ? "#1890ff" : "#00000040" }}
                  size="small"
                  loading={loadingSwitch}
                />
              </div>
            </div>

            <div className="mt-4">
              {singleCollectionDetails?.isPublicLink && (
            <>
              <div className="flex items-center ">
                <Input
                  placeholder=""
                  disabled
                  suffix={
                    <DocumentDuplicateIcon
                      className="h-5 w-5 text-[#515151] cursor-pointer"
                      onClick={() => {
                        handleCopyLink(publicLinkUrl);
                      }}
                    />
                  }
                  value={publicLinkUrl || ""}
                />
                <Button
                  className="ml-2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {password ? (
                    <LockClosedIcon className="h-5 w-5 m-0" />
                  ) : (
                    <LockOpenIcon className="h-5 w-5 m-0" />
                  )}
                </Button>
              </div>

              {showPassword && (
                <div className="my-2 flex items-center">
                  <Input
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="false"
                    className="custom-ant-input"
                  />
                  <Button
                    className="mx-1"
                    onClick={() => handleSetPasswordPublic("update")}
                    disabled={loading}
                  >
                    Update
                  </Button>
                  {password && (
                    <Button
                      onClick={() => handleSetPasswordPublic("delete")}
                      disabled={loading}
                    >
                      <TrashIcon className="h-4 w-4 text-[#EB5757]" />
                    </Button>
                  )}
                </div>
              )}
            </>
          )}

              <div className="flex w-full items-center justify-between mt-2">
                <div>
                  {singleCollectionDetails?.isPublicLink && (
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={allowUserSubmission}
                        onChange={(checked) => handleAllowUserSubmission(checked)}
                        style={{ background: allowUserSubmission ? "#1890ff" : "#00000040" }}
                        size="small"
                      />
                      <h6 className="text-[#505050] block text-sm font-medium">
                        Allow user submission
                      </h6>
                    </div>
                  )}

                  {singleCollectionDetails?.isPublicLink && (
                    <div className="flex items-center gap-2 my-2">
                      <Switch
                        checked={publicSidebar}
                        onChange={(checked) => handlePublicSidebar(checked)}
                        style={{ background: publicSidebar ? "#1890ff" : "#00000040" }}
                        size="small"
                      />
                      <h6 className="text-[#505050] block text-sm font-medium">
                        Enable sidebar
                      </h6>
                    </div>
                  )}

                  {singleCollectionDetails?.isPublicLink && (
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={showSocialIcons}
                        onChange={(checked) => handleShowSocialIcons(checked)}
                        style={{ background: showSocialIcons ? "#1890ff" : "#00000040" }}
                        size="small"
                      />
                      <h6 className="text-[#505050] block text-sm font-medium">
                        Always show social icon
                      </h6>
                    </div>
                  )}
                </div>

                <div>
                  {singleCollectionDetails?.isPublicLink && (
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={showPublicSubCollections}
                        onChange={(checked) => handleShowPublicSubCollections(checked)}
                        style={{
                          background: showPublicSubCollections
                            ? "#1890ff"
                            : "#00000040",
                        }}
                        size="small"
                      />
                      <h6 className="text-[#505050] block text-sm font-medium">
                        Show sub collections
                      </h6>
                    </div>
                  )}

                
                  {singleCollectionDetails?.isPublicLink && (
                    <div className="flex items-center gap-2 my-2">
                      <Switch
                        checked={showAllowCopyCollection}
                        onChange={(checked) => handleShowCopyCollections(checked)}
                        style={{
                          background: showAllowCopyCollection ? "#1890ff" : "#00000040",
                        }}
                        size="small"
                      />
                      <h6 className="text-[#505050] block text-sm font-medium ">
                        Allow copy collection
                      </h6>
                    </div>
                  )}

                  {singleCollectionDetails?.isPublicLink && (
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={showSeo}
                        onChange={(checked) => handleShowSeo(checked)}
                        style={{
                          background: showSeo ? "#1890ff" : "#00000040",
                        }}
                        size="small"
                      />
                      <h6 className="text-[#505050] block text-sm font-medium ">
                        Search Engine Indexing
                      </h6>
                    </div>
                  )}
                </div>

              </div>

            </div>

            <Divider className="block text-[#ABB7C9] m-0 w-full my-5" />
            
            {publicSwitch && (
          <div className="bg-[#FAFCFF] rounded-[6px] border border-solid border-[#DADEE8] p-3 mt-4">
            <div className="flex items-center justify-between">
              <h6 className="text-[#347AE2] block text-sm font-medium ml-2">
                Embed
              </h6>

              <Button
                className="bookmark-addBtn"
                icon={<RiFileCopyLine />}
                onClick={copyEmbedCode}
              >
                Copy Code
              </Button>
            </div>

            <div className="my-3">
              <div className="flex items-center justify-between">
                <span className="block mr-4 text-[#70767A]">Code</span>

                <Tabs
                  style={{ overflowX: "auto" }}
                  defaultActiveKey={tabEmbedCodeKey}
                  onChange={handleTabEmbedCodeChange}
                  items={[
                    {
                      label: `HTML`,
                      key: "HTML",
                      children: (
                        <div
                          name=""
                          id=""
                          className="p-2 w-full border-none outline-[#3169FF] bg-[#F3F5F6] h-fit text-[#1E1E1E] break-words"
                        >
                          {`<iframe style="border: 0; width: 100%; height: 450px;" allowfullscreen frameborder="0" src=${embedUrl} />`}
                        </div>
                      ),
                    },
                    {
                      label: `React`,
                      key: "React",
                      children: (
                        <div
                          name=""
                          id=""
                          className="p-2 w-full border-none outline-[#3169FF] bg-[#F3F5F6] h-fit text-[#1E1E1E] break-words"
                        >
                          {`<iframe title='embed' style={{border: 0, width: '100%', height: '450px',overflow:'auto'}} allowFullScreen frameBorder="0" src=${embedUrl}>`}
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            </div>

            <div className="flex flex-col items-center justify-between mt-4">
              <span className="block text-center mb-2 font-medium text-[#505050]">
                Preview
              </span>
              <div className="group relative w-full">
                <iframe
                  title="embed"
                  style={{
                    border: 0,
                    width: "100%",
                    height: "450px",
                    overflow: "auto",
                    zIndex: 9999998,
                  }}
                  allowFullScreen
                  frameBorder="0"
                  src={`${embedUrl}`}
                ></iframe>
                <div className="hidden group-hover:flex absolute top-0 left-0 w-full h-full justify-center items-center z-[9999999] bg-gray-800 bg-opacity-10">
                  <button
                    className="px-4 py-2 bg-gray-500 hover:bg-blue-600 text-white rounded-md"
                    onClick={() => window.open(embedUrl, "_blank")}
                  >
                    Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
            )}
          </div>
          }

            {
          inviteOptionSelected === 'seo' &&
          <div>
              {renderSEODetails()}
          </div>
          } 
      </>
    ) 
  }

    return (
        <>
        {renderInviteUI()}

        {showMemberBox && (
        <Modal
          open={showMemberBox}
          onCancel={() => {
            setShowMemberBox(false);
            setCurrentGroupId(null);
            setAllNewUsers([])
          }}
          onOk={onMembersAdd}
          okText="Add"
          title={"Add new members"}
          okButtonProps={{
            className: "bg-[#40a9ff] border-[#40a9ff]",
          }}
        >
          <Select
            mode="multiple"
            ref={memberElm}
            className="ct-share-member-select w-full"
            placeholder="Select members or type email to add new member"
            tagRender={(props) => {
              const { value } = props;
              const idx = allFilteredUsers.findIndex(
                (user) => user.id ? user.id === value : user.email === value
              );
              if (idx !== -1) {
                const user = allFilteredUsers[idx];
                return (
                  <Tag
                    className="flex p-1"
                    key={user.id ? user.id : user.email}
                    closable={true}
                    onClose={() => onTagRemove(user.id ? user.id : user.email)}
                  >
                    <div className="flex flex-row items-center">
                      <Avatar src={user.avatar} className="mr-2">
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <span>{user.name}</span>
                    </div>
                  </Tag>
                );
              }
              return null;
            }}
            value={allNewUsers}
            onChange={(users) => {
              setAllNewUsers(users);
            }}
            optionFilterProp="title"
            filterOption={(inputVal, option) => {
              return option.title
                .toLowerCase()
                .includes(inputVal.toLowerCase());
            }}
            allowClear
            autoFocus
          >
            {allFilteredUsers.map((user) => {
              return (
                <Option
                  key={user.id ? user.id : user.email}
                  value={user.id ? user.id : user.email}
                  title={`${user.name}-${user.email}`}
                >
                  <div className="flex flex-row items-center">
                    <Avatar src={user.avatar} className="mr-2">
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <span>{user.name}</span>
                  </div>
                </Option>
              );
            })}
          </Select>
        </Modal>
      )}
        </>
    );
};

export default ShareCollectionDrawer;