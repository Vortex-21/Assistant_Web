import "./style.css";
import EasySpeech from "easy-speech";
import { YoutubeTranscript } from "youtube-transcript";
import * as cheerio from 'cheerio';
import { pdfjs } from "react-pdf";

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",
  async main(ctx) {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
    const extractTextFromPDF = async (file) => {
      try {
        // Create a blob URL for the PDF file
        const blobUrl = URL.createObjectURL(file);

        // Load the PDF file
        const loadingTask = pdfjs.getDocument(blobUrl);

        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        let extractedText = "";

        // Iterate through each page and extract text
        for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item) => item.str).join(" ");
          extractedText += pageText;
        }
        if (extractedText.length > 0) {
          return extractedText;
        }
        console.error("Error extracting text from PDF:", error);

        // Clean up the blob URL
        URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error("Error extracting text from PDF:", error);
      }
    };

    const wordHighlight = (currIndex, summaryText) => {
      //create id and apply css
      const all_spans = summaryText.getElementsByTagName("span");
      // console.log("all_spans = ",all_spans);
      const id = `word${currIndex}`;
      // console.log(id);
      const prevId = `word${currIndex - 1}`;
      // if(prevId>=0){
      //   const prevElement = document.getElementById(prevId);
      //   if(prevElement)prevElement.style.backgroundColor = 'white';
      // }
      for (let i = 0; i < all_spans.length; i++) {
        const currElement = all_spans[i];
        if (currElement.id == id) {
          // console.log("currElement = ",currElement);
          currElement.style.backgroundColor = "yellow";
          break;
        }
      }
      const element = document.getElementById(id);
      // console.log("currElement = ", element);
      if (element) element.style.backgroundColor = "yellow";
      // console.log(currIndex);
    };

    const sayAloud = async (summary, playButton, summaryText) => {
      const browserComp = EasySpeech.detect();

      if (
        !browserComp.speechSynthesis ||
        !browserComp.speechSynthesisUtterance
      ) {
        console.log("Browser does not support speech synthesis.");
        return;
      }

      try {
        const initResponse = await EasySpeech.init({
          maxTimeout: 5000,
          interval: 250,
        });
        console.log("Init Response : ", initResponse);
      } catch (err) {
        console.log("Error TTS: ", err);
      }
      // .then(() => console.debug('Initialization complete'))
      // .catch(e => console.error(e));

      const voice = EasySpeech.voices()[0];
      // console.log("voice = ", voice);
      const speakText = async () => {
        console.log("Speaking!!!");
        await EasySpeech.speak({
          text: summary,
          voice: voice, // Optional, specify a voice if needed
          pitch: 2,
          rate: 1.5,
          volume: 1,
          boundary: (event) => {
            if (event.name == "word") {
              let idx = event.charIndex;
              wordHighlight(idx, summaryText);
            }
          },
        });

        playButton.innerText = "Play Speech"; // Update the button text after speech completion
        const all_spans = summaryText.getElementsByTagName("span");
        for (let el of all_spans) {
          el.style.backgroundColor = "white";
        }
      };
      speakText();
    };

    const displaySummary = (summary, container) => {
      const button = container.querySelector("#summarize-button");
      const fileButton = container.querySelector("#file-summarize-button");

      button.innerText = "Sum up this web Page!";
      fileButton.innerText = "Summarize File";
      const prevSummary = container.querySelector("#summary-box");
      if(prevSummary)prevSummary.remove();
      const summaryBox = document.createElement("div");
      summaryBox.id = "summary-box";
      summaryBox.style.cssText =
        "top: " +
        (container.offsetTop + container.offsetHeight + 10) +
        "px; right: " +
        (document.body.offsetWidth -
          container.offsetLeft -
          container.offsetWidth) +
        "px; ";

      const closeButton = document.createElement("button");

      closeButton.innerText = "Close";
      closeButton.id = "close-button";

      closeButton.addEventListener("click", () => {
        summaryBox.remove();
      });

      const summaryText = document.createElement("div");
      // summaryText.innerText = summary;
      let i = 0;
      let size = summary.length;
      while (i < size) {
        let word = "";
        let start = i;
        while (i < size && summary[i] != " ") {
          word += summary[i];
          i += 1;
        }
        let span = document.createElement("span");
        span.innerText = word + " ";
        const id = `word${start}`;
        // console.log("id = ", id);
        span.id = id;
        summaryText.appendChild(span);
        i += 1;
      }

      // summaryText.style.cssText = "margin-top:3rem;color:black;font-size:20px;";
      summaryText.id = "summary-text";
      summaryBox.appendChild(summaryText);
      summaryBox.appendChild(closeButton);

      const playSpeech = document.createElement("button");
      playSpeech.id = "playButton";
      playSpeech.innerText = "Play Speech";
      playSpeech.addEventListener("click", () => {
        if (playSpeech.innerText == "Play Speech") {
          sayAloud(summary, playSpeech, summaryText);
          playSpeech.innerText = "Pause";
        } else if (playSpeech.innerText == "Pause") {
          EasySpeech.pause();
          playSpeech.innerText = "Resume";
        } else if (playSpeech.innerText == "Resume") {
          EasySpeech.resume();
          playSpeech.innerText = "Pause";
        }
      });

      const StopSpeech = document.createElement("button");
      StopSpeech.innerText = "Stop";
      StopSpeech.addEventListener("click", () => {
        EasySpeech.cancel();
        playSpeech.innerText = "Play Speech";
        const all_spans = summaryText.getElementsByTagName("span");
        for (let el of all_spans) {
          el.style.backgroundColor = "white";
        }
      });
      summaryBox.appendChild(playSpeech);
      summaryBox.appendChild(StopSpeech);
      // document.body.appendChild(summaryBox);
      // shadow.appendChild(summaryBox);
      container.append(summaryBox);
    };
    const getSubtitles = async (url) => {
      const regex =
        /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(?:-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|live\/|v\/)?)([\w\-]+)(\S+)?$/;

      const match = url.match(regex);
      console.log("match = ", match);
      let videoId;
      if (!match || !match[5]) videoId = null;
      else videoId = match[5];
      if(!videoId)return "";
      console.log("video id: ", videoId);
      console.log("url = ", url);
      // console.log(transcripts);
      let all_text = "";
      try {
        const transcripts = await YoutubeTranscript.fetchTranscript(videoId);
        for (let line of transcripts) {
          all_text += line.text;
        }
        return all_text;
      } catch (err) {
        console.log("ERROR extracting subtitles : ", err);
      }
    };

    function collectText(element) {
      let text = '';
      // Iterate over child nodes
      for (let node of element.childNodes) {
        // If it's a text node, append its content
        if (node.nodeType === Node.TEXT_NODE) {
          text += node.textContent.trim() + ' ';
        }
        // If it's an element node, recursively collect text content
        else if (node.nodeType === Node.ELEMENT_NODE) {
          text += collectText(node);
        }
      }
      return text;
    }

    function collectParagraphText(element) {
      let text = '';
      // Get all <p> elements
      const paragraphs = element.querySelectorAll('p');
      // Iterate over <p> elements
      paragraphs.forEach(paragraph => {
        text += paragraph.textContent.trim() + ' ';
      });
      return text;
    }

    async function loadHtml(url) {
      console.log("URL = ",url);
      try {
          const response = await fetch(url, {
              method: 'GET',
              headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0'
              }
          });
  
          if (!response.ok) {
              throw new Error(`HTTP error status: ${response.status}`);
          }
  
          const htmlContent = await response.text();
          console.log('HTML content : ',htmlContent);
          // const $ = cheerio.load(htmlContent);
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlContent, 'text/html');
          // const regexForDoc = /^(.*?)(?=PrivacyTerms)/;
          // const match = regexForDoc.exec(doc);
          // console.log("Match = ",match);
          // let allText=collectText(doc.documentElement);
          let allText = collectParagraphText(doc.documentElement);
          // if(match)allText=match[1]
          // const allText = doc.body.textContent || doc.body.innerText;
          // const allText = doc.body.textContent || "";
          
          return allText;
      } catch (err) {
          console.error("Error loading HTML: ", err);
      }
  }
    const getSummaryUrl = async (container) => {
      const url = window.location.href;
      let text = await getSubtitles(url);
      if(!text){
        text = await loadHtml(url);
      }
      console.log('all_text = ',text);
      // const response = await fetch(url);
      chrome.runtime.sendMessage(
        { action: "summarize", all_text:text },
        (response) => {
          if (response && response.summary) {
            displaySummary(response.summary, container);
          } else if (response && response.error) {
            displaySummary(response.error, container);
          }
        }
      );
    };

    const handleFormSubmit = async (event, container) => {
      event.preventDefault();
      const inputFile = event.target.elements["docFile"].files[0];
      const all_text = await extractTextFromPDF(inputFile);

      chrome.runtime.sendMessage(
        { action: "summarize", all_text: all_text },
        (response) => {
          if (response && response.summary) {
            displaySummary(response.summary, container);
          } else if (response && response.error) {
            displaySummary(response.error, container);
          }
        }
      );
    };

    const createForm = (container) => {
      const form = document.createElement("form");
      form.enctype = "multipart/form-data";
      const input = document.createElement("input");
      input.type = "file";
      input.name = "docFile";
      input.id = "docFile";
      const buttonSubmit = document.createElement("button");

      buttonSubmit.type = "submit";
      buttonSubmit.innerText = "Summarize file";
      buttonSubmit.style.cssText = `padding:5px;`;
      buttonSubmit.id = "file-summarize-button";
      buttonSubmit.addEventListener("click", (event) => {
        buttonSubmit.innerText = "Summarizing your file...";
        // getSummaryDoc(container);
      });
      form.appendChild(input);
      form.appendChild(buttonSubmit);
      form.addEventListener("submit", (event) => {
        handleFormSubmit(event, container);
      });
      container.append(form);
    };

    const createCloseButton = (container) => {
      const closeButton = document.createElement("button");

      closeButton.id = "closeOptions";
      closeButton.innerText = "Close";

      closeButton.addEventListener("click", () => {
        container.remove();
      });

      container.append(closeButton);
    };

    const createSummarizeButton = (container) => {
      const summarizeButton = document.createElement("button");
      summarizeButton.innerText = "Sum up this webpage!";
      summarizeButton.id = "summarize-button";

      summarizeButton.addEventListener("click", () => {
        console.log("Button clicked");
        summarizeButton.innerText = "Summarizing...";
        getSummaryUrl(container);
      });

      container.append(summarizeButton);
    };

    const createOptionsBox = (container) => {
      const button = container.querySelector("#assistant-button");
      const optionsBox = document.createElement("div");
      optionsBox.id = "options";
      optionsBox.style.cssText = `top: ${
        button.offsetTop + button.offsetHeight + 10
      }px; right: ${
        window.innerWidth - button.offsetLeft - button.offsetWidth - 10
      }px;`;

      createForm(optionsBox);
      createCloseButton(optionsBox);
      createSummarizeButton(optionsBox);
      container.append(optionsBox);
    };

    const addAssist = (container) => {
      const exists = container.querySelector("#assistant-button");
      if (!exists) {
        const button = document.createElement("button");
        button.innerText = "Assistant";
        button.id = "assistant-button";
        // button.style.cssText="background-color:red;color:white;z-index:9999;position:fixed;top:20px;right:80px;";
        container.append(button);

        button.addEventListener("mouseenter", () => {
          const box = container.querySelector("#options");
          if (!box) createOptionsBox(container);
        });
      }
    };
    const ui = await createShadowRootUi(ctx, {
      name: "content-ui",
      position: "inline",
      onMount(container) {
        const app = document.createElement("div");
        app.id = "app";
        addAssist(app);
        container.appendChild(app);
      },
    });

    // 4. Mount the UI
    ui.mount();

    console.log("Content running!");
  },
});
