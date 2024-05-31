import requests
from langchain_community.llms import Ollama
import json

def get_ollama_response(prompt,context):
    url = "http://localhost:11434/api/generate"
    payload={
        "model":"llama3:instruct",
        "prompt":prompt,
        "stream":False
    }
    if(context):
        payload["context"] = context;
    headers={
        "Content-type":"application/json"
    }
    response = requests.post(url,json=payload,headers=headers)
    response = response.json();
    # print(response);
    return [response["response"],response["context"]];
    
def startConvo():
    # messages_with_history=[];
    prevContext=[]
    while(1):
        try:
            prompt = input("Enter your prompt: ");
            if(prompt == 'end'):
                break;
            arr = get_ollama_response(prompt,prevContext);
            prevContext = arr[1]
            print(arr[0]);
        except Exception as err:
            print("start Convo Error : ",err)
            
            
            
    
    # get_ollama_response("Who was the first President of India?",[]);
    
if __name__ == '__main__':
    startConvo();


