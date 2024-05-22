# from langchain_community.document_loaders import UnstructuredHTMLLoader
import requests
import io
from bs4 import BeautifulSoup

def load_html(url):
    headers = {
        # 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0'
    }
    try:
        response = requests.get(url,headers=headers);
       
        html_content = io.BytesIO(response.content);
        soup = BeautifulSoup(html_content,"html.parser")
        all_text = soup.get_text();
        
        docs = all_text;
        
        return docs;
    except Exception as err:
        print("Error loading html: ",err);
        
if __name__ == '__main__':
    docs = load_html('https://medium.com/@khushi1399gupta/10-javascript-tricks-you-didnt-know-cb23d4bd23e6');
    print("DOCS = ",docs);