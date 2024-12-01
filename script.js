const unfollowEveryone = (async () => {
  // Configuration variables
  const UNFOLLOW_LIMIT = 800; // Max unfollow per session
  const BREAK_DURATION = 2 * 60 * 1000; // 2-minute break
  const TOTAL_DURATION = 10 * 60 * 1000; // 10 minutes runtime
  const MIN_UNFOLLOW_DELAY = 500; // Minimum delay in ms
  const MAX_UNFOLLOW_DELAY = 2000; // Maximum delay in ms

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const findBySelector = (selector) => document.querySelector(selector);

  const findButton = (txt) =>
    [...document.querySelectorAll("button")]
      .find((btn) => btn.textContent.trim().toLowerCase() === txt.toLowerCase());

  const dismissPopup = async () => {
    console.log("Dismissing popup...");
    document.body.click(); // Simulate a click anywhere on the page
    await delay(500); // Short delay to ensure popup is closed
  };

  console.log("Starting the unfollow script...");

  const followingLinkSelector = 'a[role="link"][href*="/following/"]';

  while (true) {
    try {
      console.log("Clicking on the 'Following' link...");
      const followingLink = findBySelector(followingLinkSelector);

      if (!followingLink) {
        console.error("Following link not found. Please check the selector or page structure.");
        return;
      }

      followingLink.click();

      console.log("Waiting for the 'Following' list to load...");
      await delay(3000); // Adjust based on load time

      let startTime = Date.now();

      while (Date.now() - startTime < TOTAL_DURATION) {
        for (let i = 0; i < UNFOLLOW_LIMIT; i++) {
          try {
            const followingButton = findButton("Following");
            if (!followingButton) {
              console.log("No 'Following' button found. Skipping...");
              continue;
            }

            followingButton.scrollIntoView({ behavior: "smooth", block: "center" });
            followingButton.click();
            console.log("Clicked 'Following' button");

            await delay(300); // Small delay before confirming
            const confirmUnfollowButton = findButton("Unfollow");
            if (confirmUnfollowButton) {
              confirmUnfollowButton.click();
              console.log("Confirmed unfollow action");
            } else {
              console.warn("No 'Unfollow' confirmation button found");
            }

            const unfollowDelay =
              Math.floor(Math.random() * (MAX_UNFOLLOW_DELAY - MIN_UNFOLLOW_DELAY)) +
              MIN_UNFOLLOW_DELAY;
            console.log(`Waiting ${unfollowDelay} ms before next unfollow...`);
            await delay(unfollowDelay);
            console.log(`Unfollowed #${i + 1}`);
          } catch (error) {
            console.error("Error during unfollow process:", error.message);
            await delay(500); // Short recovery delay
          }
        }

        console.log(`Taking a short break for ${BREAK_DURATION / 1000} seconds...`);
        await delay(BREAK_DURATION); // Break to avoid rate limiting
        console.log("Break finished.");

        // After the break, dismiss the popup
        await dismissPopup();

        // Re-click the 'Following' link to restart the process
        break; // Exit the inner loop to re-click the link
      }
    } catch (error) {
      console.error("Error in the main loop:", error.message);
      await delay(1000); // Recovery delay
    }
  }
})();
