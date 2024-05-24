from fastapi import FastAPI, Request
from pydantic import BaseModel
import re
app = FastAPI()
from summarizer import load_document,get_response
from loadHTML import load_html
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
@app.post("/summarize")
async def summarize(request:Request,doc_item:DocsItem):
    all_text = doc_item.text;
    
    print(type(all_text),len(all_text));
    try:
        result = get_response(all_text);
        result = removeHeadingTrailingSymbols(result);
        print(result)
        
        return {"summary":result}
    except Exception as err:
        print("Error in file summ: ",err);