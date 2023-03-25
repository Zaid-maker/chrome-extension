const UNSPLASH_ACCESS_KEY = "EJ49yYYs-cEuoMtG4Q9dtmWEOyp3A4nJAzUaQV1qqTA";

/**
 * If the response is not ok, throw an error. Otherwise, return the response
 * @param response - The response object returned by the fetch() method.
 * @returns The response object.
 */
function validateResponse(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }

  return response;
}

/**
 * Get the collections from the local storage and return them as a promise.
 * @returns A promise that resolves to a string.
 */
function getCollections() {
  return new Promise((resolve) => {
    chrome.storage.local.get("collections", (result) => {
      const collections = result.collections || "";
      resolve(collections);
    });
  });
}

/**
 * It fetches a random photo from Unsplash, and returns a JSON object containing the photo's URL, its
 * author, and a Blob containing the photo itself.
 *
 * The function is asynchronous, so it returns a Promise.
 *
 * The function first fetches a list of collections from Unsplash. If the user has selected any
 * collections, the function will only fetch photos from those collections.
 *
 * The function then fetches a random photo from Unsplash. If the user has selected any collections,
 * the function will only fetch photos from those collections.
 *
 * The function then fetches the photo itself. The photo is fetched with a query string that specifies
 * the quality (85) and the width (2000). The width is specified so that the photo will be large enough
 * to fill the screen.
 *
 * The function then returns a JSON object containing the photo's URL, its author, and a Bl
 * @returns A promise that resolves to a JSON object.
 */
async function getRandomPhoto() {
  const collections = await getCollections();

  const endpoint =
    "https://api.unsplash.com/photos/random?orientation=landscape";

  if (collections) {
    endpoint += `&collections=${collections}`;
  }

  const headers = new Headers();
  headers.append("Authorization", `Client-ID ${UNSPLASH_ACCESS_KEY}`);

  let response = await fetch(endpoint, { headers });
  const json = await validateResponse(response).json();
  response = await fetch(json.urls.raw + "&q=85&w=2000");
  json.blob = await validateResponse(response).blob();

  return json;
}

/**
 * It gets a random photo from Unsplash, converts it to a base64 string, and saves it to the browser's
 * local storage.
 */
async function nextImage() {
  try {
    const image = await getRandomPhoto();

    const fileReader = new FileReader();
    fileReader.readAsDataURL(image.blob);
    fileReader.addEventListener("load", (event) => {
      const { result } = event.target;
      image.base64 = result;
      chrome.storage.local.set({ nextImage: image });
    });
  } catch (err) {
    console.log(err);
  }
}

/* Adding a listener to the `onInstalled` event. When the extension is installed, the `nextImage`
function will be called. */
chrome.runtime.onInstalled.addListener(nextImage);

/* Listening for a message from the popup.js file. When it receives the message, it calls the
nextImage() function. */
chrome.runtime.onMessage.addListener((request) => {
  if (request.command === "next-image") {
    nextImage();
  }
});
