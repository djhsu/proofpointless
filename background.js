const debug_log = (message, details = null) => {
//  const timestamp = new Date().toISOString();
//  console.log(`[proofpointless ${timestamp}] ${message}`);
//  if (details) {
//    console.log("Details:", details);
//  }
};

function process_html(html) {
  const startHeaderTag = "<!-- BaNnErBlUrFlE-HeAdEr-start -->";
  const endHeaderTag = "<!-- BaNnErBlUrFlE-HeAdEr-end -->";

  const startBodyTag = "<!-- BaNnErBlUrFlE-BoDy-start -->";
  const endBodyTag = "<!-- BaNnErBlUrFlE-BoDy-end -->";

  let result = html;
  let startIndex, endIndex;

  while ((startIndex = result.indexOf(startHeaderTag)) !== -1) {
    endIndex = result.indexOf(endHeaderTag, startIndex);
    if (endIndex === -1) break;
    result = result.substring(0, startIndex) + 
             result.substring(endIndex + endHeaderTag.length);
  }

  while ((startIndex = result.indexOf(startBodyTag)) !== -1) {
    endIndex = result.indexOf(endBodyTag, startIndex);
    if (endIndex === -1) break;
    result = result.substring(0, startIndex) + 
             result.substring(endIndex + endBodyTag.length);
  }

  return result;
}

function process_text(text, compose_type) {
  let startTag, endTag;
  if (compose_type === 'forward') {
    startTag = 'ZjQcmQRYFpfptBannerStart';
    endTag = 'ZjQcmQRYFpfptBannerEnd';
  } else {
    startTag = '> ZjQcmQRYFpfptBannerStart';
    endTag = '> ZjQcmQRYFpfptBannerEnd';
  }
  const lines = text.split('\n');
  let start = -1;
  let end = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === startTag) {
      start = i;
    } else if (lines[i].trim() === endTag) {
      end = i;
      break;
    }
  }
  if (start > 3) {
    lines.splice(start - 1, end - start + 2);
  }
  return lines.join('\n');
}

messenger.tabs.onCreated.addListener(async (tab) => {
  let composeDetails = await messenger.compose.getComposeDetails(tab.id);
  debug_log(`Compose type: ${composeDetails.type}`);
  if (composeDetails.type === 'new') {
    debug_log('New message; skipping');
    return;
  }

  if (composeDetails.isPlainText) {
    const processed_text = process_text(composeDetails.plainTextBody, composeDetails.type);
    debug_log("Applied process_text", {
      originalLength: composeDetails.plainTextBody.length,
      charsRemoved: composeDetails.plainTextBody.length - processed_text.length
    });
    await messenger.compose.setComposeDetails(tab.id, {
      plainTextBody: processed_text
    });
  } else {
    const processed_html = process_html(composeDetails.body);
    debug_log("Applied process_html", {
      originalLength: composeDetails.body.length,
      charsRemoved: composeDetails.body.length - processed_html.length
    });
    await messenger.compose.setComposeDetails(tab.id, {
      body: processed_html
    });
  }
});
