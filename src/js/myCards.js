/**
 * Inserts the card toggle button to DOM
 * @param {DOM Node} newNode
 * @param {DOM Node} referenceNode
 */

function insertAfter(newNode, referenceNode) {
  if (isNaN(referenceNode.parentNode)) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }
}

/**
 * Gets the logged in users initials
 * @return {String} logged in users initials
 */

const getUserAvatarUrl = () => {
  const userAvatarNode = document.querySelectorAll(
    "button.js-open-header-member-menu span"
  )[0];
  const userText = userAvatarNode.innerHTML;
  return userText;
};

const toggleCardFilter = () => {
  const filterBtn = document.getElementById("card-filter-btn");
  const filter = filterBtn.getAttribute("data-card-filter");
  if (filter === "all") {
    showMyCards();
  } else if (filter === "my") {
    showAllCards();
  }
};

/**
 * Method to show only logged in users cards.
 * Hides cards assigned to other users
 */
const showMyCards = () => {
  const allCards = document.getElementsByClassName("list-card");
  const memberAvatarUrl = getUserAvatarUrl();

  const filterBtn = document.getElementById("card-filter-btn");
  filterBtn.setAttribute("data-card-filter", "my");

  const filterText = document.getElementById("card-filter-text");
  filterText.innerHTML = "My Cards";

  Array.from(allCards).map((card) => {
    let assignedToMember = false;
    const members = card.querySelectorAll(
      ".list-card-members .member .member-initials"
    );
    Array.from(members).map((member) => {
      //   const imgUrl = member.getAttribute("src");
      const imgUrl = member.innerHTML;
      assignedToMember = assignedToMember || imgUrl === memberAvatarUrl;
    });
    if (!assignedToMember) {
      // card.classList.add("smc-is-hidden");
      card.style.display = "none";
    }
  });
  return allCards;
};

/**
 * Method to show all the cards again
 * Unhides the card assigned to other members
 */
const showAllCards = () => {
  const allCards = document.getElementsByClassName("list-card");
  const filterBtn = document.getElementById("card-filter-btn");
  filterBtn.setAttribute("data-card-filter", "all");

  const filterText = document.getElementById("card-filter-text");
  filterText.innerHTML = "All Cards";

  Array.from(allCards).map((card) => {
    // card.classList.remove("smc-is-hidden");
    card.style.display = "block";
  });
  return allCards;
};

/**
 * Method to create the filter button and append to DOM
 */
const appendFilterButton = () => {
  const filterBtn = document.getElementById("card-filter-btn");
  if (filterBtn) {
    return;
  }

  const filterNode = document.createElement("a");
  filterNode.setAttribute("class", "board-header-btn");
  filterNode.setAttribute("id", "card-filter-btn");
  filterNode.setAttribute("data-card-filter", "all");

  const iconNode = document.createElement("img");
  iconNode.setAttribute("class", "board-header-btn-icon icon-sm");
  iconNode.setAttribute("src", chrome.extension.getURL("/icons/filter-32.png"));

  const spanTextNode = document.createElement("span");
  spanTextNode.setAttribute("class", "board-header-btn-text");
  spanTextNode.setAttribute("id", "card-filter-text");
  spanTextNode.innerHTML = "All Cards";

  filterNode.appendChild(iconNode);
  filterNode.appendChild(spanTextNode);

  filterNode.addEventListener("click", toggleCardFilter, true);

  const permissionLevelNode = document.getElementById("permission-level");

  insertAfter(filterNode, permissionLevelNode);
};

/**
 * Method to check if activeTabs URL is Trello's domain
 * And then only append the filter button to DOM
 */
const initFilter = () => {
  const TRELLO_BOARD_REGEX = /(?:(?:http|https):\/\/)?(?:www.)?trello.com\/b\/\/?/;

  setInterval(() => {
    if (TRELLO_BOARD_REGEX.test(window.location.href)) {
      appendFilterButton();
    }
  }, 1500);
};

/**
 * Adds the filter button when everythin on DOM is loaded.
 */
// document.onreadystatechange = function () {
//   if (document.readyState === "complete") {
//     initFilter();
//   }
// };

initFilter();
