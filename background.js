function logMessage(message) {
  console.log(`[proofpointless] ${message}`);
}

function spliceBetweenTags(s, startTag, endTag) {
  let start = s.indexOf(startTag);
  if (start !== -1) {
    let end = s.indexOf(endTag);
    if (end > start) {
      return s.substring(0, start) + s.substring(end + endTag.length);
    }
  }
  return s;
}

function processHtml(html) {
  const startHeaderTag = "<!-- BaNnErBlUrFlE-HeAdEr-start -->";
  const endHeaderTag = "<!-- BaNnErBlUrFlE-HeAdEr-end -->";
  const startBodyTag = "<!-- BaNnErBlUrFlE-BoDy-start -->";
  const endBodyTag = "<!-- BaNnErBlUrFlE-BoDy-end -->";
  let result = spliceBetweenTags(html, startHeaderTag, endHeaderTag);
  return spliceBetweenTags(result, startBodyTag, endBodyTag);
}

function processText(text) {
  const startTag = "ZjQcmQRYFpfptBannerStart";
  const endTag = "ZjQcmQRYFpfptBannerEnd";
  const lines = text.split('\n');
  let start = -1;
  let end = -1;
  for (let i = 0; i < lines.length; i++) {
    let trimmed = lines[i].trim();
    if (trimmed.endsWith(startTag)) {
      start = i;
    } else if (trimmed.endsWith(endTag)) {
      end = i;
      break;
    }
  }
  if (start > 0 && end > start) {
    lines.splice(start - 1, end - start + 2);
    return lines.join('\n');
  } else {
    return text;
  }
}

messenger.tabs.onCreated.addListener(async (tab) => {
  let composeDetails = await messenger.compose.getComposeDetails(tab.id);
  if (composeDetails.type === 'new') {
    return;
  }

  if (composeDetails.isPlainText) {
    const processedText = processText(composeDetails.plainTextBody);
    logMessage(`processText removed ${composeDetails.plainTextBody.length - processedText.length} characters`);
    await messenger.compose.setComposeDetails(tab.id, {
      plainTextBody: processedText,
      isModified: false
    });
  } else {
    const processedHtml = processHtml(composeDetails.body);
    logMessage(`processHtml removed ${composeDetails.body.length - processedHtml.length} characters`);
    await messenger.compose.setComposeDetails(tab.id, {
      body: processedHtml,
      isModified: false
    });
  }
});
