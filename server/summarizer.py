import argparse
from langchain.chains.llm import LLMChain
from langchain.prompts import PromptTemplate
from langchain_community.chat_models import ChatOllama
from langchain_community.document_loaders import WebBaseLoader
import requests
from langchain_community.document_loaders import UnstructuredHTMLLoader
from loadHTML import load_html
import asyncio
import sys

if sys.version_info[0] == 3 and sys.version_info[1] >= 8 and sys.platform.startswith('win'):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
from g4f.client import Client 
client = Client();

def get_response(docs,language = 'english'):
    print("Docs = ",docs);
    prompt = f'''As a professional summarizer, create a detailed and comprehensive summary of the provided text in {language}, be it an article, post, conversation, or passage, while adhering to these guidelines:
            1. Craft a summary that is detailed, thorough, in-depth, and complex, while maintaining clarity.

            2. Incorporate main ideas and essential information, eliminating extraneous language and focusing on critical aspects.

            3. Rely strictly on the provided text, without including external information.

            4. Format the summary in paragraph form for easy understanding.

            5.Conclude your notes with [End of Notes, Message #X] to indicate completion, where "X" represents the total number of messages that I have sent. In other words, include a message counter where you start with #1 and add 1 to the message counter every time I send a message.

        By following this optimized prompt, you will generate an effective summary that encapsulates the essence of the given text in a clear, detailed, and reader-friendly manner. Optimize output as markdown file.

        "{docs}"

        DETAILED SUMMARY:'''
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
    )
    summary = response.choices[0].message.content
    print("SUMMARY : ",summary);
    return summary


def setup_argparse():
    """Setup argparse to parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Summarize a document from a given URL."
    )
    parser.add_argument(
        "-u", "--url", required=True, help="URL of the document to summarize"
    )
    return parser.parse_args()


def load_document(url):
    """Load document from the specified URL."""
    loader = WebBaseLoader(url)
    return loader.load()
    
   
    # return docs;





def main(docs):
    # args = setup_argparse()
    # docs = load_document(args.url)

    
    
    result = get_response(docs)
    return result;
   


if __name__ == "__main__":
    docs = ''
    print(main())


# def setup_summarization_chain():
#     """Setup the summarization chain with a prompt template and ChatOllama."""
#     prompt_template = PromptTemplate(
#         template="""As a professional summarizer, create a detailed and comprehensive summary of the provided text, be it an article, post, conversation, or passage, while adhering to these guidelines:
#             1. Craft a summary that is detailed, thorough, in-depth, and complex, while maintaining clarity.

#             2. Incorporate main ideas and essential information, eliminating extraneous language and focusing on critical aspects.

#             3. Rely strictly on the provided text, without including external information.

#             4. Format the summary in paragraph form for easy understanding.

#             5.Conclude your notes with [End of Notes, Message #X] to indicate completion, where "X" represents the total number of messages that I have sent. In other words, include a message counter where you start with #1 and add 1 to the message counter every time I send a message.

#         By following this optimized prompt, you will generate an effective summary that encapsulates the essence of the given text in a clear, detailed, and reader-friendly manner. Optimize output as markdown file.

#         "{text}"

#         DETAILED SUMMARY:""",
#         input_variables=["text"],
#     )

#     llm = ChatOllama(model="llama3:instruct", base_url="http://127.0.0.1:11434")
#     # llm_chain = LLMChain(llm=llm, prompt=prompt_template)
#     llm_chain = prompt_template|llm
#     return llm_chain