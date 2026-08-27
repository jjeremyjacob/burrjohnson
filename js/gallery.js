/* =========================================================
   CLIENT IMAGE GALLERY
   gallery.js

   Loads:
   - images.json
   - vimeo.json

   Features:
   - Single-column image gallery
   - Image selection
   - Image notes
   - Typing a note automatically selects image
   - File name
   - Dimensions
   - Aspect ratio
   - File size
   - Vimeo thumbnail previews
   - Clicking Vimeo preview opens review link
   - Formspree submission
   - Mobile footer
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const gallery =
  document.getElementById("gallery");

const vimeoSection =
  document.getElementById("vimeoSection");

const vimeoGrid =
  document.getElementById("vimeoGrid");

const selectionCount =
  document.getElementById("selectionCount");

const mobileSelectionCount =
  document.getElementById("mobileSelectionCount");

const selectedImagesInput =
  document.getElementById("selectedImages");

const selectionCountField =
  document.getElementById("selectionCountField");

const totalImagesField =
  document.getElementById("totalImagesField");

const selectionForm =
  document.getElementById("selectionForm");

const submitButton =
  document.getElementById("submitButton");

const clearSelectionButton =
  document.getElementById("clearSelection");

const mobileFooterToggle =
  document.getElementById("mobileFooterToggle");

const selectionFooter =
  document.getElementById("selectionFooter");

const submissionConfirmation =
  document.getElementById(
    "submissionConfirmation"
  );


/* =========================================================
   STATE
========================================================= */

let allImages = [];

let selectedItems = [];


/* =========================================================
   NATURAL SORT
========================================================= */

function naturalSort(a, b) {

  return a.localeCompare(
    b,
    undefined,
    {
      numeric: true,
      sensitivity: "base"
    }
  );

}


/* =========================================================
   FORMAT FILE SIZE
========================================================= */

function formatFileSize(bytes) {

  if (
    !bytes ||
    isNaN(bytes)
  ) {
    return "";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB"
  ];

  let size = bytes;

  let unitIndex = 0;

  while (
    size >= 1024 &&
    unitIndex <
      units.length - 1
  ) {

    size /= 1024;

    unitIndex++;

  }

  return `${size.toFixed(
    unitIndex === 0 ? 0 : 1
  )} ${units[unitIndex]}`;

}


/* =========================================================
   GCD
========================================================= */

function getGCD(a, b) {

  while (b !== 0) {

    const temp = b;

    b = a % b;

    a = temp;

  }

  return a;

}


/* =========================================================
   ASPECT RATIO
========================================================= */

function formatAspectRatio(
  width,
  height
) {

  if (
    !width ||
    !height
  ) {
    return "";
  }

  const gcd =
    getGCD(
      width,
      height
    );

  return `${width / gcd}:${height / gcd}`;

}


/* =========================================================
   IMAGE METADATA
========================================================= */

function getImageMetadata(
  filename
) {

  return new Promise(
    resolve => {

      const image =
        new Image();

      image.onload =
        function () {

          resolve({

            width:
              image.naturalWidth,

            height:
              image.naturalHeight

          });

        };

      image.onerror =
        function () {

          resolve({

            width: null,

            height: null

          });

        };

      image.src =
        `images/${encodeURIComponent(
          filename
        )}`;

    }
  );

}


/* =========================================================
   FILE SIZE
========================================================= */

async function getFileSize(
  filename
) {

  try {

    const response =
      await fetch(
        `images/${encodeURIComponent(
          filename
        )}`,
        {
          method:
            "HEAD",

          cache:
            "no-cache"
        }
      );

    const length =
      response.headers.get(
        "content-length"
      );

    if (length) {

      return Number(length);

    }

  } catch (error) {

    console.warn(
      "Could not determine file size:",
      filename
    );

  }

  return null;

}


/* =========================================================
   LOAD GALLERY
========================================================= */

async function loadGallery() {

  try {

    const response =
      await fetch(
        "images.json",
        {
          cache:
            "no-cache"
        }
      );


    if (!response.ok) {

      throw new Error(
        "Could not load images.json"
      );

    }


    const data =
      await response.json();


    if (!Array.isArray(data)) {

      throw new Error(
        "images.json is not an array."
      );

    }


    allImages =
      data.filter(
        item =>
          typeof item === "string"
      );


    allImages.sort(
      naturalSort
    );


    buildGallery();

    updateSelection();


  } catch (error) {

    console.error(error);

    gallery.innerHTML = `
      <div class="gallery-error">
        Unable to load gallery.
      </div>
    `;

  }

}


/* =========================================================
   BUILD GALLERY
========================================================= */

function buildGallery() {

  gallery.innerHTML = "";


  if (
    allImages.length === 0
  ) {

    gallery.innerHTML = `
      <div class="gallery-empty">
        No images found.
      </div>
    `;

    return;

  }


  allImages.forEach(
    (filename, index) => {

      /* ---------------------------------------------------
         ITEM
      --------------------------------------------------- */

      const item =
        document.createElement(
          "article"
        );

      item.className =
        "media-item";

      item.dataset.filename =
        filename;


      /* ---------------------------------------------------
         IMAGE BUTTON
      --------------------------------------------------- */

      const button =
        document.createElement(
          "button"
        );

      button.type =
        "button";

      button.className =
        "media-select";

      button.setAttribute(
        "aria-pressed",
        "false"
      );

      button.setAttribute(
        "aria-label",
        `Select image ${filename}`
      );


      /* ---------------------------------------------------
         IMAGE
      --------------------------------------------------- */

      const image =
        document.createElement(
          "img"
        );

      image.src =
        `images/${encodeURIComponent(
          filename
        )}`;

      image.alt =
        filename;

      image.loading =
        index < 4
          ? "eager"
          : "lazy";

      image.decoding =
        "async";


      /* ---------------------------------------------------
         SELECTION INDICATOR
      --------------------------------------------------- */

      const indicator =
        document.createElement(
          "span"
        );

      indicator.className =
        "selection-indicator";

      indicator.setAttribute(
        "aria-hidden",
        "true"
      );


      /* ---------------------------------------------------
         IMAGE INFORMATION
      --------------------------------------------------- */

      const info =
        document.createElement(
          "div"
        );

      info.className =
        "media-info";


      const filenameElement =
        document.createElement(
          "div"
        );

      filenameElement.className =
        "media-filename";

      filenameElement.textContent =
        filename;


      const technicalInfo =
        document.createElement(
          "div"
        );

      technicalInfo.className =
        "media-technical-info";

      technicalInfo.textContent =
        "LOADING INFO…";


      info.appendChild(
        filenameElement
      );

      info.appendChild(
        technicalInfo
      );


      /* ---------------------------------------------------
         IMAGE NOTE
      --------------------------------------------------- */

      const note =
        document.createElement(
          "div"
        );

      note.className =
        "image-note";


      const noteLabel =
        document.createElement(
          "label"
        );

      noteLabel.textContent =
        "NOTE";


      const noteInput =
        document.createElement(
          "textarea"
        );

      noteInput.className =
        "image-note-input";

      noteInput.placeholder =
        "Add a note about this image…";

      noteInput.rows =
        2;

      noteInput.setAttribute(
        "aria-label",
        `Note for ${filename}`
      );


      /* ---------------------------------------------------
         NOTE AUTOMATICALLY SELECTS IMAGE
      --------------------------------------------------- */

      noteInput.addEventListener(
        "input",
        () => {

          if (
            noteInput.value.trim() !== ""
          ) {

            if (
              !item.classList.contains(
                "selected"
              )
            ) {

              item.classList.add(
                "selected"
              );

              button.setAttribute(
                "aria-pressed",
                "true"
              );

            }

          }

          updateSelection();

        }
      );


      note.appendChild(
        noteLabel
      );

      note.appendChild(
        noteInput
      );


      /* ---------------------------------------------------
         ASSEMBLE BUTTON
      --------------------------------------------------- */

      button.appendChild(
        image
      );

      button.appendChild(
        indicator
      );


      /* ---------------------------------------------------
         IMAGE SELECTION
      --------------------------------------------------- */

      button.addEventListener(
        "click",
        () => {

          const selected =
            item.classList.toggle(
              "selected"
            );


          button.setAttribute(
            "aria-pressed",
            selected
              ? "true"
              : "false"
          );


          updateSelection();

        }
      );


      /* ---------------------------------------------------
         ASSEMBLE ITEM
      --------------------------------------------------- */

      item.appendChild(
        button
      );

      item.appendChild(
        info
      );

      item.appendChild(
        note
      );

      gallery.appendChild(
        item
      );


      /* ---------------------------------------------------
         LOAD METADATA
      --------------------------------------------------- */

      Promise.all([
        getImageMetadata(filename),
        getFileSize(filename)
      ]).then(
        ([metadata, fileSize]) => {

          const dimensions =
            metadata.width &&
            metadata.height
              ? `${metadata.width} × ${metadata.height}px`
              : "SIZE UNKNOWN";


          const ratio =
            formatAspectRatio(
              metadata.width,
              metadata.height
            );


          const formattedSize =
            formatFileSize(
              fileSize
            );


          const parts = [];


          if (dimensions) {

            parts.push(
              dimensions
            );

          }


          if (ratio) {

            parts.push(
              ratio
            );

          }


          if (formattedSize) {

            parts.push(
              formattedSize
            );

          }


          technicalInfo.textContent =
            parts.join(
              "  /  "
            );

        }
      );

    }
  );

}


/* =========================================================
   UPDATE SELECTION
========================================================= */

function updateSelection() {

  selectedItems =
    Array.from(
      document.querySelectorAll(
        ".media-item.selected"
      )
    ).map(
      item => {

        const filename =
          item.dataset.filename;

        const note =
          item.querySelector(
            ".image-note-input"
          );

        const noteText =
          note
            ? note.value.trim()
            : "";

        return {
          filename,
          note: noteText
        };

      }
    );


  const selectedCount =
    selectedItems.length;


  const totalCount =
    allImages.length;


  const countText =
    `${selectedCount} / ${totalCount} SELECTED`;


  if (selectionCount) {

    selectionCount.textContent =
      countText;

  }


  if (mobileSelectionCount) {

    mobileSelectionCount.textContent =
      countText;

  }


  /* -------------------------------------------------------
     FORMAT SELECTED IMAGES FOR FORMSPREE
  ------------------------------------------------------- */

  const submissionText =
    selectedItems
      .map(
        item => {

          if (item.note) {

            return `${item.filename}\nNOTE: ${item.note}`;

          }

          return item.filename;

        }
      )
      .join("\n\n");


  if (selectedImagesInput) {

    selectedImagesInput.value =
      submissionText;

  }


  if (selectionCountField) {

    selectionCountField.value =
      selectedCount;

  }


  if (totalImagesField) {

    totalImagesField.value =
      totalCount;

  }


  if (submitButton) {

    submitButton.disabled =
      selectedCount === 0;

  }

}


/* =========================================================
   CLEAR SELECTION
========================================================= */

if (
  clearSelectionButton
) {

  clearSelectionButton.addEventListener(
    "click",
    () => {

      const selected =
        document.querySelectorAll(
          ".media-item.selected"
        );


      selected.forEach(
        item => {

          item.classList.remove(
            "selected"
          );


          const button =
            item.querySelector(
              ".media-select"
            );


          if (button) {

            button.setAttribute(
              "aria-pressed",
              "false"
            );

          }

        }
      );


      updateSelection();

    }
  );

}


/* =========================================================
   MOBILE FOOTER
========================================================= */

if (
  mobileFooterToggle &&
  selectionFooter
) {

  mobileFooterToggle.addEventListener(
    "click",
    () => {

      const isOpen =
        selectionFooter.classList.toggle(
          "mobile-open"
        );


      mobileFooterToggle.setAttribute(
        "aria-expanded",
        isOpen
          ? "true"
          : "false"
      );

    }
  );

}


/* =========================================================
   LOAD VIMEO DATA
========================================================= */

async function loadVimeo() {

  if (!vimeoSection || !vimeoGrid) {
    return;
  }

  try {

    const response =
      await fetch(
        "vimeo.json",
        {
          cache:
            "no-cache"
        }
      );


    if (!response.ok) {

      throw new Error(
        "Could not load vimeo.json"
      );

    }


    const data =
      await response.json();


    if (!Array.isArray(data)) {

      throw new Error(
        "vimeo.json is not an array."
      );

    }


    buildVimeo(data);


  } catch (error) {

    console.error(error);

    vimeoSection.style.display =
      "none";

  }

}


/* =========================================================
   BUILD VIMEO
========================================================= */

function buildVimeo(videos) {

  vimeoGrid.innerHTML =
    "";


  if (
    videos.length === 0
  ) {

    vimeoSection.style.display =
      "none";

    return;

  }


  videos.forEach(
    video => {

      if (
        !video ||
        !video.videoId ||
        !video.reviewUrl
      ) {

        return;

      }


      /* ---------------------------------------------------
         ITEM
      --------------------------------------------------- */

      const item =
        document.createElement(
          "article"
        );

      item.className =
        "vimeo-item";


      /* ---------------------------------------------------
         REVIEW LINK WRAPPER
         
         The entire thumbnail is clickable.
      --------------------------------------------------- */

      const thumbnailLink =
        document.createElement(
          "a"
        );

      thumbnailLink.className =
        "vimeo-thumbnail-link";

      thumbnailLink.href =
        video.reviewUrl;

      thumbnailLink.target =
        "_blank";

      thumbnailLink.rel =
        "noopener noreferrer";

      thumbnailLink.setAttribute(
        "aria-label",
        `Open review for ${
          video.title ||
          "video"
        }`
      );


      /* ---------------------------------------------------
         THUMBNAIL
      --------------------------------------------------- */

      const thumbnail =
        document.createElement(
          "div"
        );

      thumbnail.className =
        "vimeo-thumbnail";


      const image =
        document.createElement(
          "img"
        );

      image.src =
        `https://vumbnail.com/${encodeURIComponent(
          video.videoId
        )}.jpg`;

      image.alt =
        video.title ||
        "Vimeo review";

      image.loading =
        "lazy";

      image.decoding =
        "async";


      thumbnail.appendChild(
        image
      );

      thumbnailLink.appendChild(
        thumbnail
      );


      /* ---------------------------------------------------
         INFO
      --------------------------------------------------- */

      const info =
        document.createElement(
          "div"
        );

      info.className =
        "vimeo-info";


      const title =
        document.createElement(
          "div"
        );

      title.className =
        "vimeo-title";

      title.textContent =
        video.title ||
        "VIDEO REVIEW";


      info.appendChild(
        title
      );


      const reviewLink =
        document.createElement(
          "a"
        );

      reviewLink.className =
        "vimeo-review-link";

      reviewLink.href =
        video.reviewUrl;

      reviewLink.target =
        "_blank";

      reviewLink.rel =
        "noopener noreferrer";

      reviewLink.textContent =
        "OPEN REVIEW";


      info.appendChild(
        reviewLink
      );


      /* ---------------------------------------------------
         ASSEMBLE
      --------------------------------------------------- */

      item.appendChild(
        thumbnailLink
      );

      item.appendChild(
        info
      );

      vimeoGrid.appendChild(
        item
      );

    }
  );

}


/* =========================================================
   FORMSPREE SUBMISSION
========================================================= */

if (selectionForm) {

  selectionForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      updateSelection();


      if (
        selectedItems.length === 0
      ) {

        alert(
          "Please select at least one image."
        );

        return;

      }


      const originalButtonText =
        submitButton.textContent;


      submitButton.disabled =
        true;

      submitButton.textContent =
        "SUBMITTING…";


      try {

        const formData =
          new FormData(
            selectionForm
          );


        const response =
          await fetch(
            selectionForm.action,
            {
              method:
                "POST",

              body:
                formData,

              headers: {
                Accept:
                  "application/json"
              }
            }
          );


        if (!response.ok) {

          throw new Error(
            "Formspree submission failed."
          );

        }


        /* -------------------------------------------------
           SUCCESS
        -------------------------------------------------- */

        selectionForm.style.display =
          "none";


        const summary =
          document.querySelector(
            ".selection-summary"
          );


        if (summary) {

          summary.style.display =
            "none";

        }


        if (
          mobileFooterToggle
        ) {

          mobileFooterToggle.style.display =
            "none";

        }


        /*
          Explicitly show confirmation
          ONLY after successful submission.
        */

        if (
          submissionConfirmation
        ) {

          submissionConfirmation.hidden =
            false;

          submissionConfirmation.style.display =
            "flex";

        }


        if (
          selectionFooter
        ) {

          selectionFooter.classList.remove(
            "mobile-open"
          );

        }


      } catch (error) {

        console.error(error);


        submitButton.disabled =
          false;

        submitButton.textContent =
          originalButtonText;


        alert(
          "There was a problem submitting your selection. Please try again."
        );

      }

    }
  );

}


/* =========================================================
   INITIAL STATE
========================================================= */

/*
  Make absolutely certain the confirmation
  is hidden when the page first loads.
*/

if (
  submissionConfirmation
) {

  submissionConfirmation.hidden =
    true;

  submissionConfirmation.style.display =
    "none";

}


/* =========================================================
   START
========================================================= */

loadGallery();

loadVimeo();