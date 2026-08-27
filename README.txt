CLIENT IMAGE GALLERY

FILES
-----
index.html
style.css
script.js

SETUP
-----
1. Put all three files in the same folder.
2. Create an "images" folder beside index.html.
3. Put your client images inside the images folder.
4. Open script.js.
5. Edit CONFIG.media to match the image filenames and desired order.
6. Set CONFIG.formspreeEndpoint to your Formspree endpoint.
7. Open index.html or upload the folder to your hosting.

SELECTIONS
----------
The default maximum is 4 images. Change:
selectionLimit: 4

to whatever number you need.

VIMEO
-----
For an image with a Vimeo review, add:
vimeo: "https://vimeo.com/XXXXXXXXX"

If vimeo is blank, no review link appears.

IMPORTANT
---------
This is a static client-side gallery. The selection limit is enforced in the browser,
so it is intended as a client-facing selection interface rather than a secure access
control system. If the gallery itself needs password protection, that should be added
at the hosting/server level or through the existing private-screening system.
