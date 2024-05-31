export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });
  // pdfjs.GlobalWorkerOptions.workerSrc = `//mozilla.github.io/pdf.js/build/pdf.worker.mjs`;
  chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ chatContext: {} });
  });
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("message : ", message);

    if (message.action == "summarize") {
      // chrome.tabs.query({ active: true, lastFocusedWindow: true }, async (tabs) => {
      //   const URL = tabs[0].url;
      // });

      const text = message.all_text;
      console.log(typeof text, text.length);
      // console.log("URL : ", url);
      const fetchApi = async () => {
        try {
          const response = await fetch("http://127.0.0.1:8000/summarize", {
            method: "POST",
            body: JSON.stringify({ text: text }),
            headers: {
              "Content-type": "application/json",
            },
          });
          const data = await response.json();
          console.log(data);
          sendResponse({ summaryChunks: data.summaryChunks });
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
            const response = await fetch("http://127.0.0.1:8000/summarize", {
              method: "POST",
              body: JSON.stringify({ text: pdf }),
              headers: {
                "Content-type": "application/json",
              },
            });
            const data = await response.json();
            console.log(data);
            sendResponse({ summaryChunks: data.summaryChunks });
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
    } else if (message.action == "chat") {
      try {
        const fetchAPI = async () => {
          const url = "http://localhost:8000/chat";
          const response = await fetch(url, {
            method: "POST",
            body: JSON.stringify({
              prompt: message.prompt,
              init:message.init?message.init:0,
              context: message.context ? message.context : [],
            }),
            headers: {
              "Content-type": "application/json",
            },
          });
          const data = await response.json();
          console.log("data : ", data);
          const context = data.response[1];
          console.log("context = ", context);
          const getTabId = async () => {
            const tabs = await chrome.tabs.query({ active: true });

            console.log("Tab's Id : ", tabs[0]);
            return tabs[0].id;
          };
          // const tabId = getTabId();
          const currChunkId = message.currChunkId;
          console.log("currChunkId = ", currChunkId);
          const saveContext = async (currChunkId, context) => {
            const tabId = await getTabId();
            console.log("TabId = ", tabId);
            console.log("currChunkId = ", currChunkId);

            let result = await chrome.storage.local.get(["chatContext"]);

            let chatContext = result.chatContext || {};
            if (!chatContext[tabId]) {
              chatContext[tabId] = {};
            }
            chatContext[tabId][currChunkId] = context;
            await chrome.storage.local.set({ chatContext: chatContext });
            
            
            let savedResult = await chrome.storage.local.get(["chatContext"]);
            console.log("chatContext => ", savedResult.chatContext);
          };

          saveContext(currChunkId, context);
          // chrome.storage.local.get("chatContext",(result)=>{
          //   let chatContext = result.chatContext || {};
          //   if(!chatContext[tabId]){
          //     chatContext[tabId] = {};
          //   }
          //   chatContext[tabId][currChunkId] = context;
          //   chrome.storage.local.set({chatContext});

          //   console.log("chatContext : ",chatContext);
          // })

          // chrome.storage.local.get('chatContext');
          sendResponse({ botResponse: data.response });
        };
        fetchAPI();
      } catch (err) {
        console.log("ERROR in chatting: ", err);
      }
    
      // sendResponse({ botResponse: "Bot's response" });
      return true;
    }
    else if(message.action == 'getTabId'){
      const fetchTabId=async()=>{
        const getTabId = async () => {
          const tabs = await chrome.tabs.query({ active: true });
  
          console.log("Tab's Id : ", tabs[0]);
          return tabs[0].id;
        };
        const id = await getTabId();
        console.log("id = ",id);
        sendResponse({tabId:id});
      }
      fetchTabId();
      return true;
    }
  });
});
