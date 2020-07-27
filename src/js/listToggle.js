// Util/vars
let isDirty = false;

let cachedList = [];

const maxVisible = 0;
let viewingMore = false;
let needsRefresh = false;

function appendDividerTo(element) {
  divider = document.createElement("span");
  divider.classList.add("board-header-btn-divider");
  element.appendChild(divider);

  return divider;
}

// Our main loop

function refresh(data) {
  const showMoreLabelsButton = document.querySelector(
    ".js-add-label + .js-show-more:not(.hide)"
  );

  if (showMoreLabelsButton) {
    showMoreLabelsButton.click();
  }

  ////////////////////////////////////
  // List Toggles
  //

  const boardHeader = document.querySelector(".board-header-btn-text");
  if (!boardHeader) return;

  const board = boardHeader.textContent;

  const boardData =
    data[board] === undefined ? (data[board] = {}) : data[board];

  const lists = document.querySelectorAll(".list-header-name-assist");
  if (cachedList.length != lists.length) {
    needsRefresh = true;
  } else {
    for (const listTitle of lists) {
      if (!cachedList.includes(listTitle.textContent)) {
        needsRefresh = true;
        break;
      }
    }
  }

  if (needsRefresh) {
    needsRefresh = false;

    console.log("refreshed");

    const toRemove = document.querySelectorAll(
      "#list-toggle-buttons-start, #list-toggle-buttons-start ~ *, .birds-eye-button"
    );
    for (const element of toRemove) {
      element.remove();
    }

    const buttonContainerLeft = document.querySelector(
      ".board-header-btns.mod-left"
    );
    appendDividerTo(buttonContainerLeft).id = "list-toggle-buttons-start";

    cachedList = [];

    for (const listTitle of lists) {
      cachedList.push(listTitle.textContent);
      const list = listTitle.closest(".list-wrapper");
      if (!list.hasAttribute("list-visible")) {
        list.setAttribute(
          "list-visible",
          boardData[listTitle.textContent] === undefined
            ? true
            : boardData[listTitle.textContent]
        );
      }

      const toggleButton = document.createElement("a");
      toggleButton.classList.add(
        "board-header-btn",
        "board-header-btn-without-icon"
      );
      toggleButton.textContent = listTitle.textContent;
      toggleButton.href = "#";
      toggleButton.setAttribute(
        "list-visible",
        list.getAttribute("list-visible")
      );

      if (viewingMore || cachedList.length < maxVisible) {
        buttonContainerLeft.appendChild(toggleButton);
      }

      function updateListVisibility(isVisible) {
        toggleButton.setAttribute("list-visible", `${isVisible}`);
        list.setAttribute("list-visible", `${isVisible}`);
        list.style.display = isVisible ? "inline-block" : "none";

        if (boardData[listTitle.textContent] != isVisible) {
          boardData[listTitle.textContent] = isVisible;
          isDirty = true;
        }
      }

      updateListVisibility(
        JSON.parse(toggleButton.getAttribute("list-visible"))
      );

      toggleButton.addEventListener("click", () => {
        const isVisible = !JSON.parse(
          toggleButton.getAttribute("list-visible")
        );
        updateListVisibility(isVisible);
      });
    }

    /**
     * If there are too many lists to show all in one line, we make a button to toggle
     * the visibility of the rest of them.
     * Currently, the max number of lists is 0 (so it always happens). This is because of the
     * members feature. In the future this should probably be done differently?
     */

    if (cachedList.length >= maxVisible) {
      appendDividerTo(buttonContainerLeft);

      const toggleMoreButton = document.createElement("a");
      toggleMoreButton.classList.add(
        "board-header-btn",
        "board-header-btn-without-icon"
      );
      toggleMoreButton.textContent = viewingMore
        ? "Hide List Toggles"
        : "Toggle Lists";
      toggleMoreButton.href = "#";
      buttonContainerLeft.appendChild(toggleMoreButton);

      toggleMoreButton.addEventListener("click", () => {
        viewingMore = !viewingMore;
        needsRefresh = true;
      });
    }

    // Birds Eye Button

    const buttonContainerRight = document.querySelector(
      ".board-header-btns.mod-right"
    );
    const birdsEyeButton = document.createElement("a");
    birdsEyeButton.classList.add(
      "board-header-btn",
      "board-header-btn-without-icon",
      "birds-eye-button"
    );
    birdsEyeButton.textContent =
      boardData.__isBirdsEye === true ? "Normal Size" : "Compressed Size";
    birdsEyeButton.href = "#";
    buttonContainerRight.insertBefore(
      birdsEyeButton,
      document.querySelector(
        ".board-header-btns.mod-right > .js-plugin-header-btns"
      )
    );

    document.body.classList.toggle(
      "birds-eye",
      boardData.__isBirdsEye === true
    );
    birdsEyeButton.addEventListener("click", () => {
      document.body.classList.toggle("birds-eye");
      isDirty = true;
      boardData.__isBirdsEye = document.body.classList.contains("birds-eye");
      birdsEyeButton.textContent =
        boardData.__isBirdsEye === true ? "Normal Size" : "Compressed Size";
    });
  }

  // Save extension data

  if (isDirty) {
    isDirty = false;
    chrome.storage.sync.set(
      { "TrelloListToggle:data": JSON.stringify(data) },
      () => {
        // console.log("saved");
      }
    );
  }
}

// Get the data, wait one second, then refresh every 20ms

chrome.storage.sync.get("TrelloListToggle:data", (data) => {
  data = data["TrelloListToggle:data"];
  data = data ? JSON.parse(data) : {};
  setTimeout(() => {
    setInterval(refresh.bind(null, data), 20);
  }, 1000);
});
