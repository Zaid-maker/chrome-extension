/**
 * It sets the background image of the body to the image that was passed in
 * @param image - The image to set as the background.
 */
function setImage(image) {
  document.body.setAttribute(
    "style",
    `background-image: url(${image.base64});`
  );
}

/* Listening for the DOM to load and then it is retrieving the next image object from the storage and
then it is sending a message to the background script to get the next image. */
document.addEventListener("DOMContentLoaded", () => {
  // Retrieve the next image object
  chrome.storage.local.get("nextImage", (data) => {
    if (data.nextImage) {
      setImage(data.nextImage);
    }
  });

  chrome.runtime.sendMessage({ command: "next-image" });
});
