from g4f.client import Client
import sys
import asyncio
from fastapi import FastAPI, Request
from pydantic import BaseModel

if sys.version_info[0] == 3 and sys.version_info[1] >= 8 and sys.platform.startswith('win'):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    
client = Client()


def get_response(command):
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": command}],
    )
    return response.choices[0].message.content

app = FastAPI()
@app.get('/')
def home():
    return {"Root":"Home"};


class URL_item(BaseModel):
    user_prompt:str

@app.post('/prompt')
async def prompt_response(request:Request,url_item:URL_item):
    prompt = url_item.user_prompt;
    
    try:
        result = get_response(prompt);
        return {"response":result};
    except Exception as err:
        print("ERROR: ",err);

