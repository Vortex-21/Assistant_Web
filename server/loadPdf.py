from langchain_community.document_loaders import PyPDFLoader

def loadPDF(file_path):
    loader = PyPDFLoader(file_path)
    pages = loader.load_and_split()
    
    complete_content = "";
    page0=pages[0].json();
    print(type(page0));
        
    
    
    
    
    # page_content='Presentation Layer\n5 April 1, 2024The presentation  layer  is the 6thlayer  from  \nthe bottom  in the OSI model . This layer  \npresents  the incoming  data  from  the \napplication  layer  of the sender  machine  to \nthe receiver  machine . It converts  one format  \nof data  to another  format  of data  if both  \nsender  and receiver  understand  different  \nformats ; hence  this layer  is also called  the \ntranslation  layer . It deals  with  the semantics  \nand syntax  of the data,  so this layer  is also \ncalled  the syntax  layer . It uses  operations  \nsuch  as data  compression,  data  encryption  & \ndecryption,  data  conversion,  etc.' metadata={'source': './docs/class 11_CN.pdf', 'page': 4}
if __name__ == '__main__':
    loadPDF('./docs/class 11_CN.pdf');