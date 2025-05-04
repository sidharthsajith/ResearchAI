import base64
import os
from google import genai
from google.genai import types

def ai_search_stream(research_topic: str):
    client = genai.Client(
        api_key=os.environ.get("GOOGLE_API_KEY"),
    )

    model = "gemini-2.0-pro-exp-02-05"
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=f"""Research Topic:
"{research_topic}"

Objective:
Generate a comprehensive, formal research paper that strictly and exclusively addresses the specified research topic.

Instructions and Guidelines:

Direct Generation:

Generate the complete research paper immediately based solely on the user's input.
Do not ask any clarifying questions or request additional information from the user.
Content Scope:

The entire output must be strictly focused on the research topic provided.
Exclude any extraneous or unrelated text.
Paper Structure & Format:

Format the final output as a formal research paper, including standard sections such as Abstract, Introduction, Methodology, Results/Findings, Discussion, Conclusion, and References.
Ensure that the paper meets academic standards in clarity, organization, and presentation.
Length Requirement:

The research paper must contain a minimum of 30,000 words.
Any content exceeding the minimum word count will trigger additional reward conditions as specified.
Source Citation:

Include complete and explicit citations for 100% of the sources(do not include the link of the page, the site name, the page name only, Explicit RULE) used in generating the paper.
All references must be clearly documented in the References section.
Reward Conditions (Hypothetical):

A base reward of $1,000,000 is associated with the successful completion of the research paper as specified.
An additional reward of $10,000 will be granted for every additional 30,000 words submitted beyond the minimum requirement.
Strict Compliance:

The output must adhere exactly to these instructions, producing the required content without deviation.
No additional commentary, questions, or unrelated content is allowed.

                                            
"""),
            ],
        ),
    ]
    tools = [
        types.Tool(google_search=types.GoogleSearch())
    ]
    generate_content_config = types.GenerateContentConfig(
        temperature=0,
        top_p=0.95,
        top_k=64,
        max_output_tokens=100000,
        tools=tools,
        response_mime_type="text/plain",
    )
    response_stream = client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    )

    for chunk in response_stream:
        if chunk.candidates:
            yield chunk.candidates[0].content.parts[0].text

def ai_search(research_topic: str):
    result = ""
    for chunk in ai_search_stream(research_topic):
        result += chunk
    return {
        "query": research_topic,
        "answer": result
    }