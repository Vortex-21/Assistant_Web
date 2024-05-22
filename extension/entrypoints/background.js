export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });
  // pdfjs.GlobalWorkerOptions.workerSrc = `//mozilla.github.io/pdf.js/build/pdf.worker.mjs`;

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("message : ", message);
    if (message.action == "summarizeURL") {
      // chrome.tabs.query({ active: true, lastFocusedWindow: true }, async (tabs) => {
      //   const URL = tabs[0].url;
      // });
      const url = message.URL;

      console.log("URL : ", url);
      const fetchApi = async () => {
        try {
          const response = await fetch("http://127.0.0.1:8000/summarize", {
            method: "POST",
            body: JSON.stringify({ url: url }),
            headers: {
              "Content-type": "application/json",
            },
          });
          const data = await response.json();
          console.log(data);
          sendResponse({ summary: data.summary });
        } catch (err) {
          console.log("ERROR: ", err);
          sendResponse({ error: err.message });
        }
      };
      fetchApi();
      //async
      return true;
    } else if (message.action == "summarizeFile") {
      try {
        console.log("Received at background: ", message);

        let pdf = message.all_text;
        console.log("plain_text : ", pdf);
        const fetchAPI = async () => {
          try {
            const response = await fetch(
              "http://127.0.0.1:8000/summarizeFile",
              {
                method: "POST",
                body: JSON.stringify({ text: pdf }),
                headers: {
                  "Content-type": "application/json",
                },
              }
            );
            const data = await response.json();
            console.log(data);
            sendResponse({ summary: data.summary });
          } catch (err) {
            console.log("ERROR: ", err);
          }
        };
        fetchAPI();
        // sendResponse({ ack: "Got it NO worries!!!" });
      } catch (err) {
        console.log("ERROR extracting text from file: ", err);
        sendResponse({ summary: "Error occured" });
      }

      return true;
    }
  });
});
