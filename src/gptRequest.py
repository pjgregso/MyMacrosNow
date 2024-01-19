from dotenv import load_dotenv
load_dotenv()

import os
from openai import OpenAI
from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS


client = OpenAI()

app = Flask(__name__)
CORS(app)  


def query_openai(user_input):
    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a nutrition expert knowledgeable in the calories and macros of all foods. The user will tell you what they ate or drank today and you are to sum the calories, fats, carbohydrates, protein, and non-food water consumption in oz's, if applicable.  Return each meal or snacks 4 total values and the combined for the day. Return it in easily JSON  splice-able format."},
            {"role": "user", "content": user_input}
        ]
    )
    return completion.choices[0].message.content


@app.route('/ask', methods=['POST'])
def ask():
    user_input = request.json.get('user_input')
    response = query_openai(user_input)
    return jsonify(response)


if __name__ == '__main__':
    app.run(debug=True)
