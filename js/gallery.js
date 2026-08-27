/* =========================================================
   CLIENT IMAGE GALLERY
   Image loading + metadata + file size + selection + Formspree
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const gallery = document.getElementById("gallery");
const selectionCount = document.getElementById("selectionCount");
const mobileSelectionCount = document.getElementById("mobileSelectionCount");

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
  document.getElementById("submissionConfirmation");


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
   ASPECT RATIO
========================================================= */

function getAspectRatio(width, height) {

  if (!width || !height) {
    return "";
  }

  function gcd(a, b) {

    while (b !== 0) {

      const temp = b;

      b = a % b;

      a = temp;

    }

    return a;

  }


  const divisor =
    gcd(width, height);


  return `${width / divisor}:${height / divisor}`;

}


/* =========================================================
   FILE SIZE
========================================================= */

function formatFileSize(bytes) {

  if (!Number.isFinite(bytes)) {
    return "";
  }


  if (bytes < 1024) {
    return `${bytes} B`;
  }


  if (bytes < 1024 * 1024) {

    return `${(bytes / 1024).toFixed(1)} KB`;

  }


  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

}


/* =========================================================
   IMAGE PATH
========================================================= */

function getImagePath(filename) {

  return "images/" + encodeURI(filename);

}


/* =========================================================
   LOAD GALLERY DATA
========================================================= */

async function loadGallery() {

  try {

    const response =
      await fetch(
        "images.json",
        {
          cache: "no-cache"
        }
      );


    if (!response.ok) {

      throw new Error(
        `gallery-data.json returned ${response.status}`
      );

    }


    const data =
      await response.json();


    if (!Array.isArray(data)) {

      throw new Error(
        "gallery-data.json must contain an array."
      );

    }


    allImages =
      data.filter(
        item =>
          typeof item === "string" &&
          item.trim() !== ""
      );


    allImages.sort(
      naturalSort
    );


    console.log(
      "Gallery images:",
      allImages
    );


    buildGallery();

    updateSelection();


  } catch (error) {

    console.error(
      "Gallery loading error:",
      error
    );


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


  if (allImages.length === 0) {

    gallery.innerHTML = `
      <div class="gallery-empty">
        No images found.
      </div>
    `;

    return;

  }


  allImages.forEach(
    (filename, index) => {


      /* ===================================================
         ARTICLE
      =================================================== */

      const item =
        document.createElement(
          "article"
        );

      item.className =
        "media-item";

      item.dataset.filename =
        filename;


      /* ===================================================
         BUTTON
      =================================================== */

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


      /* ===================================================
         IMAGE
      =================================================== */

      const image =
        document.createElement(
          "img"
        );


      const imagePath =
        getImagePath(filename);


      console.log(
        "Loading:",
        imagePath
      );


      image.src =
        imagePath;

      image.alt =
        filename;

      image.loading =
        index < 6
          ? "eager"
          : "lazy";

      image.decoding =
        "async";


      /* ===================================================
         IMAGE INFORMATION
      =================================================== */

      const info =
        document.createElement(
          "div"
        );

      info.className =
        "media-info";

      info.textContent =
        filename;


      /* ===================================================
         IMAGE LOAD
      =================================================== */

      image.addEventListener(
        "load",
        async () => {

          const width =
            image.naturalWidth;

          const height =
            image.naturalHeight;

          const ratio =
            getAspectRatio(
              width,
              height
            );


          let fileSize =
            "";


          /*
            Get the actual file size from the server.
          */

          try {

            const response =
              await fetch(
                imagePath,
                {
                  method: "HEAD",
                  cache: "no-cache"
                }
              );


            if (response.ok) {

              const contentLength =
                response.headers.get(
                  "content-length"
                );


              if (contentLength) {

                fileSize =
                  formatFileSize(
                    Number(contentLength)
                  );

              }

            }

          } catch (error) {

            console.warn(
              "Could not determine file size:",
              filename
            );

          }


          const metadata = [
            filename,
            `${width} × ${height}`,
            ratio,
            fileSize
          ].filter(Boolean);


          info.textContent =
            metadata.join(" · ");


          console.log(
            `Loaded: ${filename} — ${width} × ${height} — ${ratio} — ${fileSize}`
          );

        }
      );


      /* ===================================================
         IMAGE ERROR
      =================================================== */

      image.addEventListener(
        "error",
        () => {

          console.error(
            "IMAGE FAILED:",
            filename,
            imagePath
          );


          info.textContent =
            `${filename} · IMAGE NOT FOUND`;


          item.classList.add(
            "image-error"
          );

        }
      );


      /* ===================================================
         SELECTION INDICATOR
      =================================================== */

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


      /* ===================================================
         ASSEMBLE BUTTON
      =================================================== */

      button.appendChild(
        image
      );

      button.appendChild(
        indicator
      );


      /* ===================================================
         SELECTION
      =================================================== */

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


      /* ===================================================
         ASSEMBLE ITEM
      =================================================== */

      item.appendChild(
        button
      );

      item.appendChild(
        info
      );


      gallery.appendChild(
        item
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
      item =>
        item.dataset.filename
    );


  const selectedCount =
    selectedItems.length;

  const totalCount =
    allImages.length;


  const countText =
    `${selectedCount} / ${totalCount} SELECTED`;


  selectionCount.textContent =
    countText;

  mobileSelectionCount.textContent =
    countText;


  selectedImagesInput.value =
    selectedItems.join("\n");


  selectionCountField.value =
    selectedCount;

  totalImagesField.value =
    totalCount;


  submitButton.disabled =
    selectedCount === 0;

}


/* =========================================================
   CLEAR SELECTION
========================================================= */

clearSelectionButton.addEventListener(
  "click",
  () => {

    document
      .querySelectorAll(
        ".media-item.selected"
      )
      .forEach(
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


/* =========================================================
   MOBILE FOOTER
========================================================= */

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


/* =========================================================
   FORMSPREE
========================================================= */

selectionForm.addEventListener(
  "submit",
  async event => {

    event.preventDefault();


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
          `Formspree returned ${response.status}`
        );

      }


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


      mobileFooterToggle.style.display =
        "none";


      submissionConfirmation.hidden =
        false;


      selectionFooter.classList.add(
        "submission-complete"
      );

      selectionFooter.classList.remove(
        "mobile-open"
      );


    } catch (error) {

      console.error(
        "Formspree error:",
        error
      );


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


/* =========================================================
   START
========================================================= */

loadGallery();
