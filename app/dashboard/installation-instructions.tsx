"use client";

import { useState, useEffect, useRef } from "react";

type Platform = {
  name: string;
  abbr: string;
  color: string;
  steps?: string[];
  note?: string;
  supported?: boolean; // defaults true
};

// Official brand marks (Simple Icons, CC0 icon data; trademarks belong to their owners).
// Used here only to identify each platform in its install guide (nominative use).
const LOGOS: Record<string, { hex: string; path: string }> = {
  "HTML": { hex: "#E34F26", path: "M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z" },
  "WordPress": { hex: "#21759B", path: "M21.469 6.825c.84 1.537 1.318 3.3 1.318 5.175 0 3.979-2.156 7.456-5.363 9.325l3.295-9.527c.615-1.54.82-2.771.82-3.864 0-.405-.026-.78-.07-1.11m-7.981.105c.647-.03 1.232-.105 1.232-.105.582-.075.514-.93-.067-.899 0 0-1.755.135-2.88.135-1.064 0-2.85-.15-2.85-.15-.585-.03-.661.855-.075.885 0 0 .54.061 1.125.09l1.68 4.605-2.37 7.08L5.354 6.9c.649-.03 1.234-.1 1.234-.1.585-.075.516-.93-.065-.896 0 0-1.746.138-2.874.138-.2 0-.438-.008-.69-.015C4.911 3.15 8.235 1.215 12 1.215c2.809 0 5.365 1.072 7.286 2.833-.046-.003-.091-.009-.141-.009-1.06 0-1.812.923-1.812 1.914 0 .89.513 1.643 1.06 2.531.411.72.89 1.643.89 2.977 0 .915-.354 1.994-.821 3.479l-1.075 3.585-3.9-11.61.001.014zM12 22.784c-1.059 0-2.081-.153-3.048-.437l3.237-9.406 3.315 9.087c.024.053.05.101.078.149-1.12.393-2.325.609-3.582.609M1.211 12c0-1.564.336-3.05.935-4.39L7.29 21.709C3.694 19.96 1.212 16.271 1.211 12M12 0C5.385 0 0 5.385 0 12s5.385 12 12 12 12-5.385 12-12S18.615 0 12 0" },
  "Shopify": { hex: "#7AB55C", path: "M15.337 23.979l7.216-1.561s-2.604-17.613-2.625-17.73c-.018-.116-.114-.192-.211-.192s-1.929-.136-1.929-.136-1.275-1.274-1.439-1.411c-.045-.037-.075-.057-.121-.074l-.914 21.104h.023zM11.71 11.305s-.81-.424-1.774-.424c-1.447 0-1.504.906-1.504 1.141 0 1.232 3.24 1.715 3.24 4.629 0 2.295-1.44 3.76-3.406 3.76-2.354 0-3.54-1.465-3.54-1.465l.646-2.086s1.245 1.066 2.28 1.066c.675 0 .975-.545.975-.932 0-1.619-2.654-1.694-2.654-4.359-.034-2.237 1.571-4.416 4.827-4.416 1.257 0 1.875.361 1.875.361l-.945 2.715-.02.01zM11.17.83c.136 0 .271.038.405.135-.984.465-2.064 1.639-2.508 3.992-.656.213-1.293.405-1.889.578C7.697 3.75 8.951.84 11.17.84V.83zm1.235 2.949v.135c-.754.232-1.583.484-2.394.736.466-1.777 1.333-2.645 2.085-2.971.193.501.309 1.176.309 2.1zm.539-2.234c.694.074 1.141.867 1.429 1.755-.349.114-.735.231-1.158.366v-.252c0-.752-.096-1.371-.271-1.871v.002zm2.992 1.289c-.02 0-.06.021-.078.021s-.289.075-.714.21c-.423-1.233-1.176-2.37-2.508-2.37h-.115C12.135.209 11.669 0 11.265 0 8.159 0 6.675 3.877 6.21 5.846c-1.194.365-2.063.636-2.16.674-.675.213-.694.232-.772.87-.075.462-1.83 14.063-1.83 14.063L15.009 24l.927-21.166z" },
  "Wix": { hex: "#0C6EFC", path: "m0 7.354 2.113 9.292h.801a1.54 1.54 0 0 0 1.506-1.218l1.351-6.34a.171.171 0 0 1 .167-.137c.08 0 .15.058.167.137l1.352 6.34a1.54 1.54 0 0 0 1.506 1.218h.805l2.113-9.292h-.565c-.62 0-1.159.43-1.296 1.035l-1.26 5.545-1.106-5.176a1.76 1.76 0 0 0-2.19-1.324c-.639.176-1.113.716-1.251 1.365l-1.094 5.127-1.26-5.537A1.33 1.33 0 0 0 .563 7.354H0zm13.992 0a.951.951 0 0 0-.951.95v8.342h.635a.952.952 0 0 0 .951-.95V7.353h-.635zm1.778 0 3.158 4.66-3.14 4.632h1.325c.368 0 .712-.181.918-.486l1.756-2.59a.12.12 0 0 1 .197 0l1.754 2.59c.206.305.55.486.918.486h1.326l-3.14-4.632L24 7.354h-1.326c-.368 0-.712.181-.918.486l-1.772 2.617a.12.12 0 0 1-.197 0L18.014 7.84a1.108 1.108 0 0 0-.918-.486H15.77z" },
  "Squarespace": { hex: "#000000", path: "M22.655 8.719c-1.802-1.801-4.726-1.801-6.564 0l-7.351 7.35c-.45.45-.45 1.2 0 1.65.45.449 1.2.449 1.65 0l7.351-7.351c.899-.899 2.362-.899 3.264 0 .9.9.9 2.364 0 3.264l-7.239 7.239c.9.899 2.362.899 3.263 0l5.589-5.589c1.836-1.838 1.836-4.763.037-6.563zm-2.475 2.437c-.451-.45-1.201-.45-1.65 0l-7.354 7.389c-.9.899-2.361.899-3.262 0-.45-.45-1.2-.45-1.65 0s-.45 1.2 0 1.649c1.801 1.801 4.726 1.801 6.564 0l7.351-7.35c.449-.487.449-1.239.001-1.688zm-2.439-7.35c-1.801-1.801-4.726-1.801-6.564 0l-7.351 7.351c-.45.449-.45 1.199 0 1.649s1.2.45 1.65 0l7.395-7.351c.9-.899 2.371-.899 3.27 0 .451.45 1.201.45 1.65 0 .421-.487.421-1.199-.029-1.649h-.021zm-2.475 2.437c-.45-.45-1.2-.45-1.65 0l-7.351 7.389c-.899.9-2.363.9-3.265 0-.9-.899-.9-2.363 0-3.264l7.239-7.239c-.9-.9-2.362-.9-3.263 0L1.35 8.719c-1.8 1.8-1.8 4.725 0 6.563 1.801 1.801 4.725 1.801 6.564 0l7.35-7.351c.451-.488.451-1.238 0-1.688h.002z" },
  "GoDaddy": { hex: "#1BDBDB", path: "M20.702 2.29c-2.494-1.554-5.778-1.187-8.706.654C9.076 1.104 5.79.736 3.3 2.29c-3.941 2.463-4.42 8.806-1.07 14.167 2.47 3.954 6.333 6.269 9.77 6.226 3.439.043 7.301-2.273 9.771-6.226 3.347-5.361 2.872-11.704-1.069-14.167zM4.042 15.328a12.838 12.838 0 01-1.546-3.541 10.12 10.12 0 01-.336-3.338c.15-1.98.956-3.524 2.27-4.345 1.315-.822 3.052-.87 4.903-.137.281.113.556.24.825.382A15.11 15.11 0 007.5 7.54c-2.035 3.255-2.655 6.878-1.945 9.765a13.247 13.247 0 01-1.514-1.98zm17.465-3.541a12.866 12.866 0 01-1.547 3.54 13.25 13.25 0 01-1.513 1.984c.635-2.589.203-5.76-1.353-8.734a.39.39 0 00-.563-.153l-4.852 3.032a.397.397 0 00-.126.546l.712 1.139a.395.395 0 00.547.126l3.145-1.965c.101.306.203.606.28.916.296 1.086.41 2.214.335 3.337-.15 1.982-.956 3.525-2.27 4.347a4.437 4.437 0 01-2.25.65h-.101a4.432 4.432 0 01-2.25-.65c-1.314-.822-2.121-2.365-2.27-4.347-.074-1.123.039-2.251.335-3.337a13.212 13.212 0 014.05-6.482 10.148 10.148 0 012.849-1.765c1.845-.733 3.586-.685 4.9.137 1.316.822 2.122 2.365 2.271 4.345a10.146 10.146 0 01-.33 3.334z" },
  "Webflow": { hex: "#146EF5", path: "m24 4.515-7.658 14.97H9.149l3.205-6.204h-.144C9.566 16.713 5.621 18.973 0 19.485v-6.118s3.596-.213 5.71-2.435H0V4.515h6.417v5.278l.144-.001 2.622-5.277h4.854v5.244h.144l2.72-5.244H24Z" },
  "Joomla": { hex: "#5091CD", path: "M16.719 14.759L14.22 17.26l-2.37 2.37-.462.466c-1.368 1.365-3.297 1.83-5.047 1.397-.327 1.424-1.604 2.49-3.13 2.49C1.438 23.983 0 22.547 0 20.772c0-1.518 1.055-2.789 2.469-3.123-.446-1.76.016-3.705 1.396-5.08l.179-.18 2.37 2.37-.184.181c-.769.779-.769 2.024 0 2.789.771.78 2.022.78 2.787 0l.465-.465 2.367-2.371 2.502-2.506 2.368 2.372zm.924 6.652c-1.822.563-3.885.12-5.328-1.318l-.18-.185 2.365-2.369.18.184c.771.768 2.018.768 2.787 0 .765-.765.769-2.01-.004-2.781l-.466-.465-2.365-2.37-2.502-2.503 2.37-2.369 2.499 2.505 2.367 2.37.464.464c1.365 1.36 1.846 3.278 1.411 5.021 1.56.224 2.759 1.56 2.759 3.18 0 1.784-1.439 3.21-3.209 3.21-1.545 0-2.851-1.096-3.135-2.565l-.013-.009zM6.975 9.461l2.508-2.505 2.37-2.369.462-.461C13.74 2.7 15.772 2.251 17.58 2.79c.212-1.561 1.555-2.775 3.179-2.775 1.772 0 3.211 1.437 3.211 3.209 0 1.631-1.216 2.978-2.79 3.186.519 1.799.068 3.816-1.35 5.234l-.182.184-2.369-2.369.184-.184c.769-.77.769-2.016 0-2.783-.766-.766-2.011-.768-2.781.003l-.462.461-2.37 2.369-2.505 2.502-2.37-2.366zm-2.653 2.647l-.461-.462C2.43 10.215 1.986 8.17 2.529 6.358 1.1 6.029.03 4.754.03 3.224.03 1.454 1.47.015 3.24.015c1.596 0 2.92 1.166 3.17 2.691 1.73-.405 3.626.065 4.979 1.415l.184.185-2.37 2.37-.183-.181c-.77-.765-2.016-.765-2.785 0-.771.781-.77 2.025-.005 2.79l.465.466 2.37 2.369 2.505 2.505-2.367 2.37-2.51-2.505-2.371-2.37v-.012z" },
  "Drupal": { hex: "#0678BE", path: "M15.78 5.113C14.09 3.425 12.48 1.815 11.998 0c-.48 1.815-2.09 3.425-3.778 5.113-2.534 2.53-5.405 5.4-5.405 9.702a9.184 9.185 0 1018.368 0c0-4.303-2.871-7.171-5.405-9.702M6.72 16.954c-.563-.019-2.64-3.6 1.215-7.416l2.55 2.788a.218.218 0 01-.016.325c-.61.625-3.204 3.227-3.527 4.126-.066.186-.164.18-.222.177M12 21.677a3.158 3.158 0 01-3.158-3.159 3.291 3.291 0 01.787-2.087c.57-.696 2.37-2.655 2.37-2.655s1.774 1.988 2.367 2.649a3.09 3.09 0 01.792 2.093A3.158 3.158 0 0112 21.677m6.046-5.123c-.068.15-.223.398-.431.405-.371.014-.411-.177-.686-.583-.604-.892-5.864-6.39-6.848-7.455-.866-.935-.122-1.595.223-1.94C10.736 6.547 12 5.285 12 5.285s3.766 3.574 5.336 6.016c1.57 2.443 1.029 4.556.71 5.253" },
  "BigCommerce": { hex: "#121118", path: "M12.645 13.663h3.027c.861 0 1.406-.474 1.406-1.235 0-.717-.545-1.234-1.406-1.234h-3.027c-.1 0-.187.086-.187.172v2.125c.015.1.086.172.187.172zm0 4.896h3.128c.961 0 1.535-.488 1.535-1.35 0-.746-.545-1.35-1.535-1.35h-3.128c-.1 0-.187.087-.187.173v2.34c.015.115.086.187.187.187zM23.72.053l-8.953 8.93h1.464c2.281 0 3.63 1.435 3.63 3 0 1.235-.832 2.14-1.722 2.541-.143.058-.143.259.014.316 1.033.402 1.765 1.48 1.765 2.742 0 1.78-1.19 3.202-3.5 3.202h-6.342c-.1 0-.187-.086-.187-.172V13.85L.062 23.64c-.13.13-.043.359.143.359h23.631a.16.16 0 0 0 .158-.158V.182c.043-.158-.158-.244-.273-.13z" },
  "Framer": { hex: "#0055FF", path: "M4 0h16v8h-8zM4 8h8l8 8H4zM4 16h8v8z" },
  "Ghost": { hex: "#15171A", path: "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.256 2.313c2.47.005 5.116 2.008 5.898 2.962l.244.3c1.64 1.994 3.569 4.34 3.569 6.966 0 3.719-2.98 5.808-6.158 7.508-1.433.766-2.98 1.508-4.748 1.508-4.543 0-8.366-3.569-8.366-8.112 0-.706.17-1.425.342-2.15.122-.515.244-1.033.307-1.549.548-4.539 2.967-6.795 8.422-7.408a4.29 4.29 0 01.49-.026Z" },
  "Blogger": { hex: "#FF5722", path: "M21.976 24H2.026C.9 24 0 23.1 0 21.976V2.026C0 .9.9 0 2.025 0H22.05C23.1 0 24 .9 24 2.025v19.95C24 23.1 23.1 24 21.976 24zM12 3.975H9c-2.775 0-5.025 2.25-5.025 5.025v6c0 2.774 2.25 5.024 5.025 5.024h6c2.774 0 5.024-2.25 5.024-5.024v-3.975c0-.6-.45-1.05-1.05-1.05H18c-.524 0-.976-.45-.976-.976 0-2.776-2.25-5.026-5.024-5.026zm3.074 12H9c-.525 0-.975-.45-.975-.975s.45-.976.975-.976h6.074c.526 0 .977.45.977.976s-.45.976-.975.976zm-2.55-7.95c.527 0 .976.45.976.975s-.45.975-.975.975h-3.6c-.525 0-.976-.45-.976-.975s.45-.975.975-.975h3.6z" },
  "Tumblr": { hex: "#36465D", path: "M14.563 24c-5.093 0-7.031-3.756-7.031-6.411V9.747H5.116V6.648c3.63-1.313 4.512-4.596 4.71-6.469C9.84.051 9.941 0 9.999 0h3.517v6.114h4.801v3.633h-4.82v7.47c.016 1.001.375 2.371 2.207 2.371h.09c.631-.02 1.486-.205 1.936-.419l1.156 3.425c-.436.636-2.4 1.374-4.156 1.404h-.178l.011.002z" },
  "Piwigo": { hex: "#FF7700", path: "M16.712 12.777A4.713 4.713 0 0 1 12 17.49a4.713 4.713 0 0 1-4.713-4.713A4.713 4.713 0 0 1 12 8.066a4.713 4.713 0 0 1 4.712 4.711zm2.4-12.776c-2.572.058-2.358 1.544-8.237 1.555h-4.15A5.947 5.947 0 0 0 .777 7.503v10.55A5.947 5.947 0 0 0 6.725 24h10.55a5.947 5.947 0 0 0 5.948-5.947V4.081l-.008-.018c0-.014.004-.028.004-.043 0-2.227-1.88-4.02-4.108-4.02zm.09 2.545a1.409 1.409 0 0 1 1.407 1.41A1.409 1.409 0 0 1 19.2 5.364a1.409 1.409 0 0 1-1.41-1.408 1.409 1.409 0 0 1 1.41-1.41zM12 6.12a6.656 6.656 0 0 1 6.656 6.655A6.656 6.656 0 0 1 12 19.434a6.656 6.656 0 0 1-6.656-6.657A6.656 6.656 0 0 1 12 6.122z" },
  "LiveJournal": { hex: "#00B0EA", path: "M18.09 14.696c-1.512.664-2.726 1.885-3.381 3.399l4.27.883-.886-4.282h-.003zM2.475 8.317L0 5.85C1.125 3.237 3.216 1.14 5.823 0h.006l2.469 2.463c1.368-.591 2.876-.921 4.463-.921C18.967 1.542 24 6.569 24 12.771 24 18.973 18.967 24 12.761 24 6.551 24 1.52 18.976 1.52 12.771c0-1.591.355-3.081.952-4.451l9.143 9.114c1.125-2.613 3.218-4.71 5.823-5.85l-9.135-9.12h-.008c-2.606 1.14-4.695 3.24-5.823 5.85l.003.003z" },
};

// Step-by-step "where to paste the snippet" guides per platform. Steps refer to
// "your Bleviq snippet" (the embed snippet shown above on the same page).
const PLATFORMS: Platform[] = [
  {
    name: "HTML",
    abbr: "<>",
    color: "#e34f26",
    steps: [
      "Open the HTML file for each page where the chat should appear (or your shared header/footer include).",
      "Paste your Bleviq snippet just before the closing </body> tag.",
      "Save the file and upload it to your web host.",
      "Visit your site to confirm the chat bubble appears.",
    ],
  },
  {
    name: "WordPress",
    abbr: "WP",
    color: "#21759b",
    steps: [
      "In your WordPress admin, go to Plugins → Add New, then install and activate \"WPCode\" (or \"Insert Headers and Footers\").",
      "Open the plugin (Code Snippets → Header & Footer, or Settings → Insert Headers and Footers).",
      "Paste your Bleviq snippet into the \"Footer\" box.",
      "Click Save. The widget now loads on every page.",
    ],
    note: "On a block theme you can instead use Appearance → Editor, or paste the snippet before </body> in your theme's footer.php.",
  },
  {
    name: "Shopify",
    abbr: "Sh",
    color: "#5a8a3c",
    steps: [
      "From your Shopify admin, go to Online Store → Themes.",
      "On your current theme, click the \"...\" menu and choose \"Edit code.\"",
      "In the \"Layout\" folder, open theme.liquid.",
      "Paste your Bleviq snippet just before the closing </body> tag.",
      "Click Save.",
    ],
  },
  {
    name: "Wix",
    abbr: "Wx",
    color: "#0c6efc",
    steps: [
      "Go to your Wix dashboard and open Settings.",
      "Click \"Custom Code\" (under the Advanced section).",
      "Click \"+ Add Custom Code\" at the top right.",
      "Paste your Bleviq snippet and give it a name like \"Bleviq.\"",
      "Under \"Add Code to Pages,\" choose \"All pages,\" and set \"Place Code in\" to \"Body - end.\"",
      "Click Apply.",
    ],
    note: "Custom Code requires a Premium plan with a connected domain.",
  },
  {
    name: "Squarespace",
    abbr: "Sq",
    color: "#111111",
    steps: [
      "In your Squarespace dashboard, go to Settings → Advanced → Code Injection.",
      "Paste your Bleviq snippet into the \"Footer\" box.",
      "Click Save.",
    ],
    note: "Code Injection requires a Business or Commerce plan.",
  },
  {
    name: "GoDaddy",
    abbr: "GD",
    color: "#00838a",
    steps: [
      "Sign in to GoDaddy, go to \"My Products,\" and click \"Edit Website\" on your Websites + Marketing site.",
      "Go to the page where you want the chat, then click \"Add Section.\"",
      "Search for and add the \"HTML\" section.",
      "Paste your Bleviq snippet into the custom code field.",
      "Publish your site.",
    ],
    note: "GoDaddy's current Website Builder has no site-wide code field, so add the HTML section to each page you want the widget on. If your site is GoDaddy-hosted WordPress or HTML hosting instead, use that platform's steps.",
  },
  {
    name: "Webflow",
    abbr: "Wf",
    color: "#4353ff",
    steps: [
      "In the Webflow Designer, open your project's Site settings.",
      "Go to the \"Custom code\" tab.",
      "Paste your Bleviq snippet into the \"Footer Code\" box (this loads it before </body>).",
      "Click Save Changes, then publish your site.",
    ],
    note: "Site-wide custom code requires a paid Site plan.",
  },
  {
    name: "Google Sites",
    abbr: "GS",
    color: "#3367d6",
    supported: false,
    note: "Google Sites only allows embedded code inside a contained, sandboxed block on a page, and does not support site-wide floating widgets. The Bleviq chat bubble cannot be installed on Google Sites. Consider linking visitors to a Bleviq-enabled page, or using a platform that allows site-wide code.",
  },
  {
    name: "Joomla",
    abbr: "J",
    color: "#4a7ba6",
    steps: [
      "Log in to your Joomla administrator.",
      "Go to System → Site Templates (or Extensions → Templates → Templates) and open your active template.",
      "Edit the index.php file.",
      "Paste your Bleviq snippet just before the closing </body> tag, then Save.",
    ],
    note: "Alternatively, create a \"Custom HTML\" module placed in a site-wide position, with the editor's code-cleaning disabled so the script isn't stripped.",
  },
  {
    name: "Drupal",
    abbr: "Dr",
    color: "#0678be",
    steps: [
      "In your theme folder, open templates/html.html.twig (copy it from the core \"stable\" theme if your theme doesn't have one).",
      "Paste your Bleviq snippet just before the closing </body> tag.",
      "Clear caches at Configuration → Development → Performance → \"Clear all caches.\"",
    ],
    note: "Prefer not to edit templates? Install the \"Asset Injector\" module and add the snippet there instead.",
  },
  {
    name: "BigCommerce",
    abbr: "BC",
    color: "#34313f",
    steps: [
      "From your BigCommerce control panel, go to Storefront → Script Manager.",
      "Click \"Create a Script.\"",
      "Name it \"Bleviq,\" set \"Location on page\" to \"Footer,\" and \"Pages\" to \"All pages.\"",
      "Set \"Script type\" to \"Script,\" and paste your Bleviq snippet into the box.",
      "Click Save.",
    ],
  },
  {
    name: "Weebly",
    abbr: "Wb",
    color: "#2a5bd7",
    steps: [
      "In the Weebly editor, go to Settings → SEO.",
      "Scroll to the \"Footer Code\" box.",
      "Paste your Bleviq snippet there.",
      "Click Save, then publish your site.",
    ],
  },
  {
    name: "Unbounce",
    abbr: "Un",
    color: "#e35c00",
    steps: [
      "Open your landing page in the Unbounce builder.",
      "Click \"Javascripts\" at the bottom of the page (or Page properties → Javascripts).",
      "Click \"Add a Javascript\" and name it \"Bleviq.\"",
      "Paste your Bleviq snippet and set Placement to \"Before Body End Tag.\"",
      "Click Save, then republish the page.",
    ],
  },
  {
    name: "Framer",
    abbr: "Fr",
    color: "#0055ff",
    steps: [
      "In your Framer project, open Project Settings (the gear icon) → General.",
      "Scroll to the \"Custom Code\" section.",
      "Paste your Bleviq snippet into the \"End of <body> tag\" box.",
      "Publish your site.",
    ],
  },
  {
    name: "Duda",
    abbr: "Du",
    color: "#149c5e",
    steps: [
      "Open your site in the Duda editor.",
      "Click Settings, then \"Header HTML.\"",
      "Paste your Bleviq snippet into the field.",
      "Click Save, then republish your site.",
    ],
  },
  {
    name: "Ghost",
    abbr: "Gh",
    color: "#15171a",
    steps: [
      "In Ghost admin, go to Settings → Code injection.",
      "Paste your Bleviq snippet into the \"Site Footer\" box.",
      "Click Save.",
    ],
  },
  {
    name: "Blogger",
    abbr: "Bl",
    color: "#e8642a",
    steps: [
      "In Blogger, open Theme from the left menu.",
      "Click the arrow next to \"Customize,\" then choose \"Edit HTML.\"",
      "Find the closing </body> tag.",
      "Paste your Bleviq snippet just before it, then click Save.",
    ],
  },
  {
    name: "Tumblr",
    abbr: "Tu",
    color: "#36465d",
    steps: [
      "On your Tumblr dashboard, open your blog's settings, then \"Edit appearance\" → \"Edit theme.\"",
      "Click \"Edit HTML.\"",
      "Paste your Bleviq snippet just before the closing </body> tag.",
      "Click \"Update Preview,\" then \"Save.\"",
    ],
  },
  {
    name: "Yola",
    abbr: "Yo",
    color: "#008f4c",
    steps: [
      "In Yola (Sitebuilder+), click the Main menu button (top left), then Settings.",
      "Open the \"Custom Code\" tab.",
      "In the \"Body\" (or \"Footer\") area, create a new snippet, name it \"Bleviq,\" and paste your snippet.",
      "Click Submit, then publish your site.",
    ],
    note: "Custom code may require an eligible plan.",
  },
  {
    name: "Cargo",
    abbr: "Ca",
    color: "#111111",
    steps: [
      "Open the Custom HTML editor — in Cargo 3: Site Settings → \"CSS/HTML\" → the \"HTML\" tab; in Cargo 2: the \"Design\" tab.",
      "Paste your Bleviq snippet (it's a <script> tag, which Cargo supports).",
      "Click Update/Save. It applies to every page automatically.",
    ],
  },
  {
    name: "Piwigo",
    abbr: "Pi",
    color: "#d96b00",
    steps: [
      "In your Piwigo admin, go to Plugins → Manage and activate the \"LocalFiles Editor\" plugin.",
      "Open Plugins → LocalFiles Editor (or Specials → LocalFiles Editor).",
      "Create a header/footer template override for your active theme (based on header.tpl), and paste your Bleviq snippet near the end.",
      "Save.",
    ],
    note: "Piwigo is self-hosted, so this needs theme/template access and exact steps vary by theme. You can also add a local_head.tpl file containing the snippet to your theme folder.",
  },
  {
    name: "LiveJournal",
    abbr: "LJ",
    color: "#0091c2",
    supported: false,
    note: "LiveJournal strips JavaScript and embed tags from journals for security reasons, so the Bleviq widget cannot be installed there.",
  },
  {
    name: "Jigsy",
    abbr: "Ji",
    color: "#3f7cb8",
    steps: [
      "In the Jigsy Website Editor, click \"Add Content to Page\" (or \"Add to Page\") on the toolbar.",
      "Add the \"HTML\" component to your page.",
      "Click \"Edit\" on the HTML component and paste your Bleviq snippet.",
      "Save.",
    ],
    note: "The HTML component is added per page, so add it on each page where you want the widget (or on a shared block if your template has one).",
  },
  {
    name: "IM Creator",
    abbr: "IM",
    color: "#1591c9",
    steps: [
      "In the IM Creator / XPRS editor, open the \"Site Header code\" editor in your site settings.",
      "Paste your Bleviq snippet there so it loads site-wide.",
      "Save and publish.",
    ],
    note: "Alternatively, add a per-page \"HTML\" element via \"Add an Element → HTML\" and paste the snippet.",
  },
];

function PlatformIcon({ name, abbr, color }: { name: string; abbr: string; color: string }) {
  const logo = LOGOS[name];
  return (
    <span
      aria-hidden="true"
      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-50 ring-1 ring-slate-200/70"
    >
      {logo ? (
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill={logo.hex} role="img">
          <path d={logo.path} />
        </svg>
      ) : (
        <span className="text-[11px] font-bold" style={{ color }}>
          {abbr}
        </span>
      )}
    </span>
  );
}

function InstructionsModal({
  platform,
  onClose,
}: {
  platform: Platform;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative shrink-0 border-b border-slate-100 px-6 pb-4 pt-6 text-center">
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Bleviq" className="mx-auto h-7 w-auto" />
          <h3
            id="install-modal-title"
            className="mt-3 text-base font-semibold text-slate-900"
          >
            Installation instructions for {platform.name}
          </h3>
        </div>

        {/* Scrollable body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {platform.supported === false ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm leading-relaxed text-amber-900">{platform.note}</p>
            </div>
          ) : (
            <>
              <ol className="space-y-3">
                {(platform.steps || []).map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 text-sm leading-relaxed text-slate-700">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
              {platform.note && (
                <p className="mt-4 flex gap-2 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                  <span>{platform.note}</span>
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function InstallationInstructions() {
  const [selected, setSelected] = useState<Platform | null>(null);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Installation Instructions
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Pick your platform for step-by-step setup. Each guide shows exactly where
            to paste the snippet above.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {PLATFORMS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => setSelected(p)}
            className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5 text-left transition hover:border-brand-300 hover:bg-brand-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <PlatformIcon name={p.name} abbr={p.abbr} color={p.color} />
            <span className="min-w-0 truncate text-sm font-medium text-slate-800">
              {p.name}
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <InstructionsModal platform={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
