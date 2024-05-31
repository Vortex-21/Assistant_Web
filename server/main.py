from fastapi import FastAPI, Request
from pydantic import BaseModel
import re
app = FastAPI()
from summarizer import load_document,get_response
from loadHTML import load_html
from ChatOllama import get_ollama_response
def run_script(url):
    try:
        docs = load_html(url);  
        result = get_response(docs)
        return result;
        
    except Exception as e:

        print(f"Error executing script: {e}")
        return {"ERROR_runScript":e};
def getSummary(docs):
    try:
        result = get_response(docs);
        return result;
    except Exception as err:
        print(f"Error getting response from LLM: {err}")
        return err;
@app.get("/")
def read_root():
    return {"Hello": "World"}


class URLItem(BaseModel):
    url: str

class DocsItem(BaseModel):
    text:str
    
class PromptItem(BaseModel):
    prompt:str;
    init:bool;
    context:list;
    
def divideIntoChunks(summary):
    arr = summary.split(' ');
    # print(arr);
    chunks = [];
    chunk=''
    currentChunkWordLength=0;
    for word in arr:
        if currentChunkWordLength==100:
            chunks.append(chunk);
            chunk='';
            currentChunkWordLength=0;
        else:
            chunk+=word;
            chunk+=' ';
            currentChunkWordLength+=1;
    if currentChunkWordLength and currentChunkWordLength<=30:
        #concatenate to previous chunk : 
        chunks[-1]+=chunk;
    elif   currentChunkWordLength>30:
        chunks.append(chunk);
    return chunks
def removeHeadingTrailingSymbols(text):
    pattern = r'^[#*=(<]+|[#*=)>]+$'
    cleaned_text = re.sub(pattern,'',text)
    return cleaned_text;
# async def summarize(request: Request, url_item: URLItem):
#     url = url_item.url
#     # return {"message": "Received URL", "url": url}
#     try:
#         print(url);
#         result = run_script(url) ;
#         print(result)
#         return {"summary":result};
#     except Exception as err:
#         print("ERROR: ",err);
#         return {"Received url : ":url};

# @app.post("/summarizeFile")
@app.post("/chat")
def chat(request:Request,prompt_item:PromptItem):
    # print("prompt = ",prompt_item.prompt);
    print("ITEM ========>",prompt_item);
    if(prompt_item.init==1):
        new_prompt = f'''
        You are a knowledgeable assistant. I will provide you with a text, and I want you to familiarize yourself with it thoroughly. Your task is to answer any questions I ask based on the information contained in the provided text. Additionally, you should be able to answer questions related to the topic of the text, even if the specific answer is not directly stated in the text itself. Ensure that your responses are accurate and reference the text or the topic context when necessary.

        Here is the text for you to familiarize yourself with:

        {prompt_item.prompt}

        Once you have read and understood the text, I will begin asking questions about it. The questions may be directly related to the information in the text or broadly related to the topic of the text. For example, if the text mentions "Magnus Carlsen is a world-renowned chess player," you should also be prepared to answer questions like "Who is the greatest opponent of Magnus Carlsen?" based on your knowledge of the topic.

        ---
        Please respond with "Hi! How may I help you ?"
    

        '''
        prompt_item.prompt = new_prompt;
        
    currContext = prompt_item.context if len(prompt_item.context) else [];
    Ollama_response = get_ollama_response(prompt_item.prompt,currContext);
    print(Ollama_response);
    return {"response":Ollama_response};
    return {"response":"Response from ChatOllama"};

@app.post("/summarize")
async def summarize(request:Request,doc_item:DocsItem):
    all_text = doc_item.text;

    #Dummy for test
    all_text = divideIntoChunks(all_text);
    # return {"summaryChunks":all_text};
    
    # print(type(all_text),len(all_text));
    try:
        result = get_response(all_text);
        result = removeHeadingTrailingSymbols(result);
        # print(result)
        chunks = divideIntoChunks(result)
        # print(chunks);
        
        return {"summaryChunks":chunks}
    except Exception as err:
        print("Error in file summ: ",err);
        
if __name__ == '__main__':
    summary = "In this text, the author reflects on the concept of the butterfly effect and how small choices and events can have a significant impact on our lives and the world around us. The author shares personal experiences, such as choosing the wrong university due to a mix-up with acronyms, but realizing that it hasn't negatively affected their life. They also mention joining a writing community in college, which shaped their reality and led to writing this article. The story of Edward Lorenz, a mathematician and meteorologist, is referenced to illustrate how a small rounding error in a weather simulation led to a completely different forecast, establishing the concept of the butterfly effect. The author further supports this idea by mentioning historical examples, such as the Revolutionary War, where a mistake made by a German Colonel named Johann Rall changed the outcome of the war. The author emphasizes that our present reality is influenced by the past and highlights the importance of learning from valuable lessons. They encourage readers to make small positive changes in their lives, as even these can have a significant impact in the future. The author concludes by urging readers to embrace their current reality and strive to make each day their best. The text overall serves as a reminder of the interconnectedness of events and the potential for small actions to create significant outcomes.\n\n**End of Notes, Message #1";
    
    
    chunks = divideIntoChunks(summary);
    # print(chunks);
    for chunk in chunks:
        print(chunk,'========');