from fastapi import FastAPI, Request
from pydantic import BaseModel
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

@app.get("/")
def read_root():
    return {"Hello": "World"}


class URLItem(BaseModel):
    url: str

class FileItem(BaseModel):
    text:str
@app.post("/summarize")
async def summarize(request: Request, url_item: URLItem):
    url = url_item.url
    # return {"message": "Received URL", "url": url}
    try:
        print(url);
        result = run_script(url) ;
        print(result)
        return {"summary":result};
    except Exception as err:
        print("ERROR: ",err);
        return {"Received url : ":url};

@app.post("/summarizeFile")
async def summarizeFle(request:Request,file_item:FileItem):
    all_text = file_item.text;
    try:
        result = get_response(all_text);
        print(result)
        return {"summary":result}
    except Exception as err:
        print("Error in file summ: ",err);