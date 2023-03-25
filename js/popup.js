const input = document.getElementById("js-collections");
const form = document.getElementById("js-form");
const message = document.getElementById("js-message");

const UNSPLASH_ACCESS_KEY = "EJ49yYYs-cEuoMtG4Q9dtmWEOyp3A4nJAzUaQV1qqTA";

/**
 * It takes a string of comma separated collection IDs, splits it into an array, verifies that each
 * collection ID is a number, and then verifies that each collection exists.
 *
 * If all of that is successful, it saves the string to local storage.
 *
 * If any of that fails, it displays an error message.
 * @param event - The event object that was passed to the event handler.
 * @returns The response object is being returned.
 */
async function saveCollections(event) {
  event.preventDefault();
  const value = input.value.trim();
  if (!value) return;

  try {
    // split the string into an array of collection IDs
    const collections = value.split(",");
    for (let i = 0; i < collections.length; i++) {
      const result = Number.parseInt(collections[i], 10);
      // Ensure each collection ID is a number
      if (Number.isNaN(result)) {
        throw Error(`${collections[i]} is not a number`);
      }

      message.textContent = "Loading...";
      const headers = new Headers();
      headers.append("Authorization", `Client-ID ${UNSPLASH_ACCESS_KEY}`);

      // Verify that the collection exists
      const response = await fetch(
        `https://api.unsplash.com/collections/${result}`,
        { headers }
      );

      if (!response.ok) {
        throw Error(`Collection not found: ${result}`);
      }
    }

    // Save the collecion to local storage
    chrome.storage.local.set(
      {
        collections: value,
      },
      () => {
        message.setAttribute("class", "success");
        message.textContent = "Collections saved successfully!";
      }
    );
  } catch (err) {
    message.setAttribute("class", "error");
    message.textContent = err;
  }
}

/* Adding an event listener to the form element. When the form is submitted, the saveCollections
function will be called. */
form.addEventListener("submit", saveCollections);

/* Retrieving the collection IDs from the local storage (if present) and setting them as the value of
the input. */
document.addEventListener("DOMContentLoaded", () => {
  // Retrieve collecion IDs from the local storage (if present)
  // and set them as the value of the input
  chrome.storage.local.get("collections", (result) => {
    const collections = result.collections || "";
    input.value = collections;
  });
});
