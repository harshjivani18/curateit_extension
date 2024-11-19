import { SIDEBAR_MENU } from "./constants";
import { fetchCurrentTab } from "./fetch-current-tab";
import { sendEnableFloatImageMenuToChrome } from "./send-theme-to-chrome";

class Session {
  get token() {
    return localStorage.getItem("token") || null
  }

  setToken = (token) => {
    localStorage.setItem("token", token)
  }
  get email() {
    return localStorage.getItem("email") || null
  }

  setEmail = (email) => {
    localStorage.setItem("user", email)
  }
  get username() {
    return localStorage.getItem("username") || null
  }

  setUser = (username) => {
    localStorage.setItem("username", username)
  }

  setLoginDetails = credObjStr => {
    if (credObjStr) {
      const userDetails = JSON.parse(window.atob(credObjStr))
      if (userDetails.jwt) this.setToken(userDetails.jwt)
      if (userDetails.user) {
          const uObj = userDetails.user
          this.setUser(uObj.username)
          this.setUserId(uObj.id)
          this.setEmail(uObj.email)
          this.setUserProfileImage(uObj.profilePhoto)
          this.setCollectionId(uObj.unfiltered_collection_id)
          // this.setOpenPagesInSession(uObj.openPagesIn)
          // this.setEditPagesInSession(uObj.editPagesIn)
      }
    }
  } 

  get unfiltered_collection_id() {
    return localStorage.getItem("unfiltered_collection_id") || null
  }
  setCollectionId = (unfiltered_collection_id) => {
    localStorage.setItem("unfiltered_collection_id", unfiltered_collection_id)
  }

  get password() {
    return localStorage.getItem("password") || null
  }

  setPassword = (password) => {
    localStorage.setItem("password", password)
  }

  setUserProfileImage = (url) => {
    localStorage.setItem("profileImage", url)
  }

  setIsSyncing = (value) => {
    localStorage.setItem("isBrowserSyncing", value)
  }

  get isSyncing() {
    return localStorage.getItem("isBrowserSyncing") || false
  }

  get userProfileImage() {
    return localStorage.getItem("profileImage") || null
  }

  get checkbox() {
    return localStorage.getItem("checkbox") || null
  }

  setCheckbox = (checkbox) => {
    localStorage.setItem("checkbox", checkbox)
  }

  setMode = (mode) => {
    localStorage.setItem("mode", mode || "light")
  }

  get mode() {
    return localStorage.getItem("mode") || "light"
  }

  setUserId = (id) => {
    localStorage.setItem("userId", id)
  }

  get userId() {
    return localStorage.getItem("userId") || null
  }

  setCurrentSiteTags(tags) {
    localStorage.setItem("currentSiteTags", tags)
  }

  get currentSiteTags() {
    return localStorage.getItem("currentSiteTags") || null
  }

  setCollectionData(data) {
    localStorage.removeItem("collectionData")
    localStorage.setItem("collectionData", data)
  }

  get collectionData() {
    return localStorage.getItem("collectionData") || []
  }

  setCurrentSiteData(data) {
    localStorage.setItem("currentSiteData", data)
  }

  get currentSiteData() {
    return localStorage.getItem("currentSiteData") || null
  }

  setCurrentSiteProcessingLoader(value) {
    localStorage.setItem("currentSiteLoader", value)
  }

  get currentSiteLoader() {
    return localStorage.getItem("currentSiteLoader") || false
  }

  setBookmarkFetchingStatus(status) {
    localStorage.setItem("bookmarkFetchingStatus", status)
  }

  get bookmarkFetchingStatus() {
    return localStorage.getItem("bookmarkFetchingStatus") || "pending"
  }

  setEnableFloatMenu = (value) => {
    localStorage.setItem("enableFloatMenu", value)
  }

  get enableFloatMenu() {
    return localStorage.getItem("enableFloatMenu") || true
  }

  setSidebarPosition = (position) => {
    localStorage.setItem("sidebarPosition", position || "right")
  }

  get sidebarPosition() {
    return localStorage.getItem("sidebarPosition") || "right"
  }

  setSidebarOrder = (data) => {
    localStorage.setItem("sidebarOrder", JSON.stringify(data || SIDEBAR_MENU))
  }

  get sidebarOrder() {
    const storedItemsJSON = localStorage.getItem("sidebarOrder")
    return JSON.parse(storedItemsJSON)
  }

  setShowImageOption = async (value) => {
    localStorage.setItem("showImageOption", value !== undefined ? value : true)
  }

  get showImageOption() {
    return String(localStorage.getItem("showImageOption")) ? localStorage.getItem("showImageOption") : true
  }

  setShowCodeOption = (value) => {
    localStorage.setItem("showCodeOption", value !== undefined ? value : true)
  }

  get showCodeOption() {
    return String(localStorage.getItem("showCodeOption")) ? localStorage.getItem("showCodeOption") : true
  }

  setSidebarView = (value) => {
    localStorage.setItem("sidebarView", value || "auto_hide")
  }

  get sidebarView() {
    return localStorage.getItem("sidebarView") || "auto_hide"
  }

  setCurrentDefaultApp(apps) {
    localStorage.setItem("currentDefaultApp", apps)
  }

  get currentDefaultApp() {
    return localStorage.getItem("currentDefaultApp") || {}
  }

  clearCurrentSiteData() {
    localStorage.removeItem("currentSiteLoader")
    localStorage.removeItem("currentSiteData")
  }

  get bio_collection_id() {
      return localStorage?.getItem("bio_collection_id") || null;
  }

  setBioCollectionId = (bio_collection_id) => {
      localStorage?.setItem("bio_collection_id", bio_collection_id);
  }

  get isBookmarkSynced() {
    return localStorage?.getItem("is_bookmark_synced") || false;
  }

  setIsBookmarkSynced = (is_bookmark_synced) => {
    localStorage?.setItem("is_bookmark_synced", is_bookmark_synced);
  }

  clear = () => {
    localStorage.clear()
  }
}

export default new Session();
