

let url;
let title;
let desc;
let actorName;
let link;
let imgUrl;

function convertString(str) {
  return str?.toLowerCase().split(" ").join("-");
}

function convertToDateFormat(dateString) {
  const months = {
      'Jan': '01',
      'Feb': '02',
      'Mar': '03',
      'Apr': '04',
      'May': '05',
      'Jun': '06',
      'Jul': '07',
      'Aug': '08',
      'Sep': '09',
      'Oct': '10',
      'Nov': '11',
      'Dec': '12'
  };

  const parts = dateString.split(' ');
  if (parts.length < 3) {
      return 'Invalid date format';
  }

  const month = months[parts[0]];
  const day = parts[1].replace(',', '').padStart(2, '0');
  const year = parts[2];

  if (!month) {
      return 'Invalid month name';
  }

  return `${day}-${month}-${year}`;
}

function convertDateAttractionHotelReviews(dateString) {
  const months = {
      'January': '01',
      'February': '02',
      'March': '03',
      'April': '04',
      'May': '05',
      'June': '06',
      'July': '07',
      'August': '08',
      'September': '09',
      'October': '10',
      'November': '11',
      'December': '12'
  };

  const parts = dateString.split(' ');
  if (parts.length !== 3) {
      return 'Invalid date format';
  }

  const day = parts[0].padStart(2, '0');
  const month = months[parts[1]];
  const year = parts[2];

  if (!month) {
      return 'Invalid month name';
  }

  return `${day}-${month}-${year}`;
}


function convertDateFormat(dateTimeString) {
  const months = {
    'Jan': '01',
    'Feb': '02',
    'Mar': '03',
    'Apr': '04',
    'May': '05',
    'Jun': '06',
    'Jul': '07',
    'Aug': '08',
    'Sep': '09',
    'Oct': '10',
    'Nov': '11',
    'Dec': '12'
};

const parts = dateTimeString.split(' ');
if (parts.length < 3) {
    return 'Invalid date format';
}

const day = parts[0].padStart(2, '0');
const month = months[parts[1]];
const year = parts[2].split(',')[0];

if (!month) {
    return 'Invalid month name';
}

return `${day}-${month}-${year}`;
}

function convertDateFormatv2(dateStr) {
  // Create an array of month names
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Split the input string into its components
  const parts = dateStr.split(" ");

  // Get day, month name and year
  const day = parts[0];
  const monthName = parts[1];
  const year = parts[2];

  // Get month number from month name
  const monthNumber = String(months.indexOf(monthName) + 1).padStart(2, "0");

  // Return the formatted date
  return `${day}-${monthNumber}-${year}`;
}

function convertDateFormatv3(dateStr) {
  const months = {
    January: "01",
    February: "02",
    March: "03",
    April: "04",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    September: "09",
    October: "10",
    November: "11",
    December: "12",
  };

  const parts = dateStr.trim().split(" "); // Split by space to separate month and year
  const month = months[parts[0]]; // Get month numerical representation
  const year = parts[1]; // Get year

  return `01-${month}-${year}`;
}

function formatDate(input) {
  const months = {
    January: "01",
    February: "02",
    March: "03",
    April: "04",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    September: "09",
    October: "10",
    November: "11",
    December: "12",
  };

  const parts = input.split(" ");

  // Extracting day, month, and year from the string
  const day = parseInt(parts[1], 10);
  const month = months[parts[2]];
  const year = parts[3];

  // Formatting day to be 2 digits
  const formattedDay = day < 10 ? "0" + day : day;

  return `${formattedDay}-${month}-${year}`;
}

function convertDate(inputString) {
  const monthNames = {
    January: "01",
    February: "02",
    March: "03",
    April: "04",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    September: "09",
    October: "10",
    November: "11",
    December: "12",
  };

  const match = /Date of travel: (\w+) (\d{4})/.exec(inputString);

  if (!match) return null;

  const monthName = match[1];
  const year = match[2];

  const monthNumber = monthNames[monthName];

  if (!monthNumber) return null;

  return `01-${monthNumber}-${year}`;
}

function extractFirstFloat(str) {
  console.log("Str ===>", str)
  const match = str.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[0]) : null;
}

function addToCurateitTripAdvisor(
  title,
  desc,
  link,
  imgUrl,
  author,
  product,
  rating,
  dateAdded,
  profilePic=""
) {
  // 
  const importData = chrome?.storage?.sync.get(["importData"]);
  const elem            = document.querySelector("link[rel='icon']") || document.querySelector("link[rel='shortcut icon']");
  const testimonialIcon = elem ? elem.href : null;
  const images1 = Array.from(document?.images)?.map((img) => { return img.src }) || []
  // const icon    = document.querySelector('link[rel="icon"]')?.href || ""
  const message = {
    post: {
      title: title,
      description: desc,
      media_type: "Testimonial",
      platform: "TripAdvisor",
      post_type: "SaveToCurateit",
      type: "TripAdvisor",
      url: link,
      author: author,
      product: product,
      rating: rating,
      dateAdded: dateAdded,
      testimonialIcon,
      media: {
        covers: profilePic !== "" ? [profilePic, imgUrl] : [imgUrl],
      },
      metaData: {
        covers: profilePic !== "" ? [profilePic, imgUrl] : [imgUrl],
        docImages: profilePic !== "" ? [profilePic, imgUrl, ...images1] : [imgUrl, ...images1],
        defaultIcon: elem?.href || null,
        defaultThumbnail: profilePic !== "" ? profilePic : imgUrl,
        icon: elem ? { type: "image", icon: elem?.href } : null,
      },
      collection_gems: importData?.importData?.data?.collection_gems,
      remarks: importData?.importData?.data?.remarks,
      tags: importData?.importData?.data?.tags,
      is_favourite: true,
      socialfeed_obj: {
        id: convertString(title),
        title: title,
        description: desc,
        profile_url: link,
        profile_image_url: profilePic,
        coverImg: imgUrl,
      },
    },
  };
  chrome.storage.local.set({
    socialObject: message,
  });
  window.panelToggle(`?save-testimonial`, true);
  
}

function addButtonAttractionReviews() {
  let bars = document.querySelectorAll('div[data-automation="reviewCard"]');

  for (let bar of bars) {
    if (bar.querySelector(".TripAdvisor-button")) continue;
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src =
      "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "37px";
    img.style.height = "auto";
    img.style.margin = "0 5px";
    img.style.cursor = "pointer";
    img.className = "TripAdvisor-button";
    img.title = "Add to Feed!";

    img.addEventListener("click", async function (e) {
      let titleElement = bar.querySelector("a > span");
      let userElement = bar.querySelector("span > a");
      let title = `${userElement?.textContent.trim()} on TripAdvisor : ${titleElement?.textContent.trim()}`;
      // let spanElements = bar.querySelectorAll("div > span");
      // let reviewElement = spanElements[spanElements.length - 2];
      // Get review element description from bar where div is on the 5th postion and style has line-break
      let reviewElement = bar?.querySelector("div[style*='line-break: normal;']")
      let reviewButton  = reviewElement?.querySelector("button")
      if (reviewButton) {
        reviewButton.click()
      }
      let desc = reviewElement?.textContent?.replace("Read more", "");
      let link = titleElement?.closest("a").href;
      let imgUrl = Array.from(bar.querySelectorAll("img")).find((i) => i.getAttribute("srcset") !== null)?.src?.replace("w=100", "w=200");
      let profilePic  = bar.querySelector("img")?.src || "";

      let author = userElement?.textContent.trim() || "";
      let product = document.querySelector("h1")?.textContent || "";
      // let numberString = bar
      //   .querySelector(":scope > :nth-child(2) svg")
      //   .getAttribute("aria-label");
      let numberString = bar.querySelector("div > svg > title")?.textContent || "";
      let splitStr     = numberString.split(" of 5 bubbles");
      let rating       = splitStr.length > 0 ? extractFirstFloat(numberString[0]) / 1 : 0;
      // get div element from bar where text content starts with "Written"
      let dateElemArr  = Array.from(bar.querySelectorAll("div")).find((elem) => elem.textContent.startsWith("Written"))?.children;
      let dateElem     = Array.from(dateElemArr).find((elem) => elem.textContent.startsWith("Written"));
      let dateAdded =
        dateElem?.textContent?.replace("Written ", "").trim()
        || "";
        
      dateAdded = convertDateAttractionHotelReviews(dateAdded);
      addToCurateitTripAdvisor(
        title,
        desc,
        link,
        imgUrl,
        author,
        product,
        rating,
        dateAdded,
        profilePic
      );
    });

    div.appendChild(img);
    let targetContainer = bar.querySelector("div button").parentElement;

    if (targetContainer) {
      targetContainer.appendChild(div);
    } else {
      console.warn("Target container not found inside the bar!");
    }
  }
}

function addButtonRestaurantReviews() {
  let bars = document.querySelectorAll("div.reviewSelector");

  for (let bar of bars) {
    if (bar.querySelector(".TripAdvisor-button")) continue;
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src =
      "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "37px";
    img.style.height = "auto";
    img.style.margin = "0 5px";
    img.style.cursor = "pointer";
    img.className = "TripAdvisor-button";
    img.title = "Add to Feed!";

    img.addEventListener("click", async function (e) {
      let titleElement = bar.querySelector("a > span");
      let userElement = bar.querySelector("div.info_text");
      let title = `${userElement?.textContent.trim()} on TripAdvisor : ${titleElement?.textContent.trim()}`;
      let reviewElement = bar.querySelector("p.partial_entry");
      let desc = reviewElement?.textContent;
      let link = titleElement?.closest("a").href;
      let imgUrl = bar.querySelector("img")?.src;
      let profilePic  = bar.querySelector(".member_info .ui_avatar .basicImg")?.src || "";
      
      let author = userElement?.textContent.trim() || "";
      let product = document.querySelector("h1")?.textContent || "";
      let ratingsElement = bar.querySelector("span.ui_bubble_rating");
      let classes = ratingsElement?.className.split(" ");
      let starClass = classes?.find((cls) => cls.startsWith("bubble_"));
      let numberString = starClass?.replace("bubble_", "");
      let rating = parseFloat(numberString) / 10;
      let dateAdded =
        bar.querySelector("span.ratingDate")?.getAttribute("title") || "";
      dateAdded = convertDateFormatv2(dateAdded);

      addToCurateitTripAdvisor(
        title,
        desc,
        link,
        imgUrl,
        author,
        product,
        rating,
        dateAdded, 
        profilePic
      );
    });

    div.appendChild(img);
    let targetContainer = bar.querySelector("div.helpful.redesigned");
    if (targetContainer) {
      targetContainer.style.display = "flex";
      targetContainer.style.alignItems = "center";
      targetContainer.appendChild(div);
    } else {
      console.warn("Target container not found inside the bar!");
    }
  }
}

function addButtonHotelReviews() {
  let bars = document.querySelectorAll('div[data-test-target="HR_CC_CARD"]');

  for (let bar of bars) {
    if (bar.querySelector(".TripAdvisor-button")) continue;
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src =
      "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "37px";
    img.style.height = "auto";
    img.style.margin = "0 5px";
    img.style.cursor = "pointer";
    img.className = "TripAdvisor-button";
    img.title = "Add to Feed!";

    img.addEventListener("click", async function (e) {
      let titleElement = bar.querySelector("a > span");
      let userElem = bar.querySelector("span > a");
      let title = `${userElem?.textContent.trim()} on TripAdvisor : ${titleElement?.textContent.trim()}`;
      let reviewElement =
        titleElement?.parentElement?.parentElement?.parentElement?.querySelector(
          "div > span > span"
        );
      let desc = reviewElement?.textContent.trim();
      let link = titleElement?.closest("a").href;
      let imgUrl = bar.querySelector("img")?.src;
      let profilePic  = bar.querySelector(".member_info .ui_avatar .basicImg")?.src || "";
      
      let author = userElem?.textContent.trim() || "";
      let product = document.querySelector("h1")?.textContent || "";
      let ratingsElement = bar.querySelector('div[data-test-target="review-rating"]');
      let ratingSvgLabel=ratingsElement.querySelector("svg").getAttribute("aria-label")
      let rating = parseInt(ratingSvgLabel.match(/\d+/)[0])
      let dateAdded =bar.querySelector('div > span > span[class]')?.parentNode?.textContent.trim().replace("Date of stay:","01")
      dateAdded = convertDateAttractionHotelReviews(dateAdded);

      addToCurateitTripAdvisor(
        title,
        desc,
        link,
        imgUrl,
        author,
        product,
        rating,
        dateAdded,
        profilePic
      );
    });

    div.appendChild(img);
    let targetContainer = bar.querySelector("div > button")?.parentNode;
    if (targetContainer) {
      targetContainer.style.display = "flex";
      targetContainer.style.alignItems = "center";
      targetContainer.appendChild(div);
    } else {
      console.warn("Target container not found inside the bar!");
    }
  }
}

//?
function addButtonForum() {
  let bars = document.querySelectorAll(".balance .post");

  for (let bar of bars) {
    if (bar.querySelector(".TripAdvisor-button")) continue;
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src =
      "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "37px";
    img.style.height = "auto";
    img.style.margin = "0 5px";
    img.style.cursor = "pointer";
    img.className = "TripAdvisor-button";
    img.title = "Add to Feed!";

    img.addEventListener("click", async function (e) {
      let titleElement = bar.querySelector("a > span");
      let title = `${titleElement?.textContent} on TripAdvisor`;
      let reviewElement = bar.querySelector(".postBody");
      let desc = reviewElement?.textContent.trim();
      let link = window.location.href;
      let imgUrl = bar.querySelector("img")?.src;
      let profilePic  = bar.querySelector(".member_info .ui_avatar .basicImg")?.src || "";
      let author = titleElement?.textContent.trim() || "";
      let product = document.querySelector("h1")?.textContent || "";
      // let numberString = bar
      //   .querySelector(":scope > :nth-child(2) svg")
      //   .getAttribute("aria-label");
      let rating = 0;
      let dateAdded =
        bar.querySelector("div.postDate")?.textContent.trim() || "";
        
      dateAdded = convertDateFormat(dateAdded);

      addToCurateitTripAdvisor(
        title,
        desc,
        link,
        imgUrl,
        author,
        product,
        rating,
        dateAdded,
        profilePic
      );
    });

    div.appendChild(img);
    let targetContainer = bar.querySelector(".wrpBtn");
    if (targetContainer) {
      targetContainer.style.display = "flex";
      targetContainer.style.alignItems = "center";
      targetContainer.appendChild(div);
    } else {
      console.warn("Target container not found inside the bar!");
    }
  }
}

function addButtonVacationRentalReviews() {
  let bars = document.querySelectorAll(".WjEkL button");
  for (let bar of bars) {
    bar = bar.parentElement.parentElement.parentElement;
    if (bar.querySelector(".TripAdvisor-button")) continue;
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src =
      "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "37px";
    img.style.height = "auto";
    img.style.margin = "0 5px";
    img.style.cursor = "pointer";
    img.className = "TripAdvisor-button";
    img.title = "Add to Feed!";

    img.addEventListener("click", async function (e) {
      let titleElement = bar.querySelector("span > a");
      let title = `${titleElement?.textContent} on TripAdvisor`;
      let reviewElement = bar.querySelector("._T > ._T > ._P");
      let desc = reviewElement?.textContent;
      let link = window.location.href;
      let imgUrl = document.querySelector("a picture img")?.src;
      let profilePic  = bar.querySelector(".member_info .ui_avatar .basicImg")?.src || "";

      

      let author = titleElement?.textContent.trim() || "";
      let product = document.querySelector("h1")?.textContent || "";
      let numberString = bar
        .querySelector(":scope > :nth-child(2) svg")
        .getAttribute("aria-label");
      let rating = extractFirstFloat(numberString) / 1;
      let dateAdded =
        bar
          .querySelector(".biGQs._P.pZUbB.ncFvv.osNWb")
          .childNodes[0].textContent.trim() || "";
      dateAdded = formatDate(dateAdded);

      addToCurateitTripAdvisor(
        title,
        desc,
        link,
        imgUrl,
        author,
        product,
        rating,
        dateAdded,
        profilePic
      );
    });

    div.appendChild(img);
    let targetContainer = bar.querySelector(".WjEkL button").parentElement;
    if (targetContainer) {
      targetContainer.style.display = "flex";
      targetContainer.style.alignItems = "center";
      targetContainer.appendChild(div);
    } else {
      console.warn("Target container not found inside the bar!");
    }
  }
}

function addButtonArticles() {
  let bars = document.querySelectorAll("div > article");

  for (let bar of bars) {
    if (bar.querySelector(".TripAdvisor-button")) continue;
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src =
      "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "37px";
    img.style.height = "auto";
    img.style.margin = "0 5px";
    img.style.cursor = "pointer";
    img.className = "TripAdvisor-button";
    img.title = "Add to Feed!";

    img.addEventListener("click", async function (e) {
      let titleElement = document.querySelector("article h1");
      let title = `${titleElement?.textContent} on TripAdvisor`;
      let desc = document.querySelector("div.biGQs._P.pZUbB.KxBGd")?.textContent;
      let link = window.location.href;
      let imgUrl = bar.querySelector("img")?.src;
      let profilePic  = bar.querySelector(".member_info .ui_avatar .basicImg")?.src || "";

      let author = document.querySelector("div.biGQs._P.fiohW.uPlAb.ngXxk")?.textContent.trim() || "";
      let product = document.querySelector("h1")?.textContent || "";
      let dateAdded =document.querySelector("span.XHvWJ span")?.textContent.trim()
      dateAdded = convertToDateFormat(dateAdded);
      let rating = undefined;
      addToCurateitTripAdvisor(
        title,
        desc,
        link,
        imgUrl,
        author,
        product,
        rating,
        dateAdded,
        profilePic
      );
    });

    div.appendChild(img);
    let targetContainer = bar.querySelector("footer .j");
    if (targetContainer) {
      targetContainer.style.display = "flex";
      targetContainer.style.alignItems = "center";
      targetContainer.appendChild(div);
    } else {
      console.warn("Target container not found inside the bar!");
    }
  }
}

function addButtonAirlineReviews() {
  let bars = document.querySelectorAll(".lgfjP.Gi.pBVnE.MD.bZHZM");

  for (let bar of bars) {
    if (bar.querySelector(".TripAdvisor-button")) continue;
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src =
      "https://d3jrelxj5ogq5g.cloudfront.net/icons/logo_zhtams.svg";
    img.style.width = "37px";
    img.style.height = "auto";
    img.style.margin = "0 5px";
    img.style.cursor = "pointer";
    img.className = "TripAdvisor-button";
    img.title = "Add to Feed!";

    img.addEventListener("click", async function (e) {
      let titleElement = bar.querySelector("a > span");
      let userElement = bar.querySelector("span > a");
      let title = `${userElement?.textContent.trim()} on TripAdvisor : ${titleElement?.textContent.trim()}`;
      let reviewElement =
        titleElement?.parentElement?.parentElement?.parentElement?.querySelector(
          "div > span > span"
        );
      let desc = reviewElement?.textContent;
      let link = titleElement?.closest("a").href;
      let imgUrl = bar.querySelector("img")?.src;
      let profilePic  = bar.querySelector(".member_info .ui_avatar .basicImg")?.src || "";

      

      let author = userElement?.textContent.trim() || "";
      let product = document.querySelector("h1")?.textContent || "";
      let ratingsElement = bar.querySelector("span.ui_bubble_rating");
      let classes = ratingsElement?.className.split(" ");
      let starClass = classes?.find((cls) => cls.startsWith("bubble_"));
      let numberString = starClass?.replace("bubble_", "");
      let rating = parseFloat(numberString) / 10;
      let dateAdded =
        bar.querySelector("span.teHYY._R.Me.S4.H3")?.textContent.trim() || "";
      dateAdded = convertDate(dateAdded);

      addToCurateitTripAdvisor(
        title,
        desc,
        link,
        imgUrl,
        author,
        product,
        rating,
        dateAdded,
        profilePic
      );
    });

    div.appendChild(img);
    let targetContainer = bar.querySelector(".qIICj.f._T.Me.z");
    if (targetContainer) {
      targetContainer.style.display = "flex";
      targetContainer.style.alignItems = "center";
      targetContainer.appendChild(div);
    } else {
      console.warn("Target container not found inside the bar!");
    }
  }
}

// Run the addButton function once the page is loaded
window.addEventListener("load", function () {
  // Run the function once at the start
  addButtonAttractionReviews();
  addButtonRestaurantReviews();
  addButtonHotelReviews();
  addButtonForum();
  addButtonVacationRentalReviews();
  addButtonArticles();
  addButtonAirlineReviews();

  // Create a MutationObserver to watch for changes in the page for addButtons
  let observer1 = new MutationObserver(addButtonAttractionReviews);
  let observer2 = new MutationObserver(addButtonRestaurantReviews);
  let observer3 = new MutationObserver(addButtonHotelReviews);
  let observer4 = new MutationObserver(addButtonForum);
  let observer5 = new MutationObserver(addButtonVacationRentalReviews);
  let observer6 = new MutationObserver(addButtonArticles);
  let observer7 = new MutationObserver(addButtonAirlineReviews);

  // Start observing
  observer1.observe(document.body, { childList: true, subtree: true });
  observer2.observe(document.body, { childList: true, subtree: true });
  observer3.observe(document.body, { childList: true, subtree: true });
  observer4.observe(document.body, { childList: true, subtree: true });
  observer5.observe(document.body, { childList: true, subtree: true });
  observer6.observe(document.body, { childList: true, subtree: true });
  observer7.observe(document.body, { childList: true, subtree: true });
});
