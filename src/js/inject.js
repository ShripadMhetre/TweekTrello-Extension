document.onreadystatechange = function () {
  if (document.readyState === "complete") {
    chrome.tabs.executeScript({ file: "./myCards.js" });
    chrome.tabs.executeScript({ file: "./listToggle.js" });
  }
};
