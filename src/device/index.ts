/* eslint no-use-before-define: 0 */
interface DeviceInfo {
  ipAddress: string;
  httpAcceptBrowserValue: string;
  httpAcceptContent: string;
  httpBrowserLanguage: string;
  httpBrowserJavaEnabled: boolean;
  httpBrowserJavaScriptEnabled: boolean;
  httpBrowserColorDepth: string;
  httpBrowserScreenHeight: string;
  httpBrowserScreenWidth: string;
  httpBrowserTimeDifference: string;
  userAgentBrowserValue: string;
}

async function fetchIp() {
  try {
    const response = await fetch("https://api.ipify.org?format=json");

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error(error);
    throw error; // Re-throw the error to propagate it further if needed
  }
}

export async function getDeviceInfo() {
  const deviceInfo: DeviceInfo = {
    ipAddress: await fetchIp(),
    httpAcceptBrowserValue: "text/html",
    httpAcceptContent: "*/*",
    httpBrowserLanguage: navigator.language,
    httpBrowserJavaEnabled: navigator.javaEnabled(),
    // eslint-disable-next-line no-restricted-globals
    httpBrowserColorDepth: screen.colorDepth.toString(),
    httpBrowserJavaScriptEnabled: true,
    // eslint-disable-next-line no-restricted-globals
    httpBrowserScreenHeight: screen.height.toString(),
    // eslint-disable-next-line no-restricted-globals
    httpBrowserScreenWidth: screen.width.toString(),
    httpBrowserTimeDifference: (new Date().getTimezoneOffset() / 60).toString(),
    userAgentBrowserValue: navigator.userAgent,
  };

  return deviceInfo;
}
