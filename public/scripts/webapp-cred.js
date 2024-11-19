window.openWebappWithNewCred = (userInformation, webURL,isRegister=false) => {
    const userObj       = userInformation.payload ? userInformation.payload.data : userInformation

    if (userObj && !isRegister) {
      window.open(
        `${webURL}?access_token=${window.btoa(JSON.stringify(userObj))}`,
        "_blank"
      );
    }

    if (userObj && isRegister) {
      window.open(
        `${webURL}?access_token=${window.btoa(JSON.stringify(userObj))}&isRegister=true`,
        "_blank"
      );
    }
}